import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COVER_TYPES   = ['Solid Reactive', 'Pearl Reactive', 'Hybrid Reactive', 'Urethane', 'Polyester', 'Particle']
const ROLE_TAGS     = ['benchmark', 'strong_asym', 'transition', 'urethane', 'spare', 'other']
const PERF_CATS     = ['strong_asym','strong_solid','strong_pearl','strong_hybrid','mid_solid','mid_pearl','mid_hybrid','entry','urethane','spare']
const FLARE_VALUES  = ['Low', 'Medium', 'Medium-High', 'High', 'Very High']

const SYSTEM_PROMPT = `You are a bowling ball specification expert. Use your full training knowledge — manufacturer specs, third-party databases, bowling forums, pro shop resources — to answer.

Brand families to be aware of: Storm Products owns Storm, Roto Grip, and 900 Global. Brunswick owns Hammer, Columbia 300, Radical, DV8, and Track. If the submitted brand looks wrong for the model name (e.g. "Storm Attention Star" when Attention Star is a Roto Grip ball), still return the specs using the correct brand you recognize — set found: true.

Rules:
- cover_type: exactly one of "Solid Reactive", "Pearl Reactive", "Hybrid Reactive", "Urethane", "Polyester", "Particle"
- cover_name: the coverstock marketing name, e.g. "R2S Pearl", "eTrax Pearl" (omit if unknown)
- core_name: the core marketing name, e.g. "Catalyst Core", "Star Core" (omit if unknown)
- core_symmetry: "symmetric" or "asymmetric" (omit if unknown)
- factory_finish: factory surface spec, e.g. "500/1000 Abralon", "4000 Grit LSS" (omit if unknown)
- rg: radius of gyration as a decimal, e.g. 2.47 (omit if unknown)
- differential: RG differential as a decimal, e.g. 0.050 (omit if unknown)
- mass_bias: mass bias for asymmetric balls only, e.g. 0.018 (omit for symmetric balls or if unknown)
- found: true if you recognize this ball (even under a corrected brand), false if truly unrecognized

REQUIRED when found is true — always provide a best estimate, never omit:
- perf_category: exactly one of "strong_asym", "strong_solid", "strong_pearl", "strong_hybrid", "mid_solid", "mid_pearl", "mid_hybrid", "entry", "urethane", "spare"
- flare_potential: exactly one of "Low", "Medium", "Medium-High", "High", "Very High"
- role_tag: exactly one of "benchmark", "strong_asym", "transition", "urethane", "spare", "other"

perf_category guide (objective — the ball's design, not how a specific bowler uses it):
  strong_asym   — ASYMMETRIC core only (has mass bias / intermediate differential); high flare, max-hook equipment. Do NOT use for symmetric balls regardless of differential.
  strong_solid  — high-performance SYMMETRIC ball with solid reactive coverstock
  strong_pearl  — high-performance SYMMETRIC ball with pearl reactive coverstock
  strong_hybrid — high-performance SYMMETRIC ball with hybrid reactive coverstock (e.g. Storm Bionic, Storm Code Red)
  mid_solid     — mid-performance symmetric solid
  mid_pearl     — mid-performance symmetric pearl
  mid_hybrid    — mid-performance symmetric hybrid
  entry         — entry-level reactive (any cover type)
  urethane      — urethane coverstock
  spare         — plastic / polyester spare ball

Key rule: core_symmetry drives strong_asym vs strong_solid/pearl/hybrid — differential alone does not.

flare_potential guide: derive from differential if known — < 0.030 → Low, 0.030–0.039 → Medium, 0.040–0.049 → Medium-High, 0.050–0.059 → High, ≥ 0.060 → Very High. Use general market knowledge if differential is unknown.

Always include a "brand" field in the response with the canonical manufacturer brand name (e.g. "Roto Grip" even if "Storm" was submitted for an Attention Star).

Return only JSON:
{"found":true,"brand":"...","cover_type":"...","cover_name":"...","factory_finish":"...","core_name":"...","core_symmetry":"...","rg":2.47,"differential":0.050,"mass_bias":0.018,"flare_potential":"...","perf_category":"...","role_tag":"..."}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { brand, model } = await req.json()
    if (!brand || !model) {
      return new Response(JSON.stringify({ error: 'brand and model are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const CATALOG_COLS = 'brand, cover_type, cover_name, core_name, factory_finish, role_tag, perf_category, rg, differential, mass_bias, flare_potential'

    // 1. Exact brand + model match
    const { data: exactMatch } = await supabase
      .from('balls_catalog')
      .select(CATALOG_COLS)
      .eq('brand', brand)
      .eq('model', model)
      .maybeSingle()

    // 2. Model-only fallback — catches wrong brand submissions (e.g. "Storm Attention Star" → "Roto Grip")
    //    Prefer entries from a different brand than submitted so we find the canonical one
    const { data: modelMatch } = !exactMatch ? await supabase
      .from('balls_catalog')
      .select(CATALOG_COLS)
      .ilike('model', model)
      .neq('brand', brand)
      .maybeSingle() : { data: null }

    const cached = exactMatch ?? modelMatch

    // Only trust the catalog entry if it has the new spec fields — stale entries
    // (cached before migration 0017) will have perf_category and flare_potential null
    // and need to be refreshed via AI.
    const catalogComplete = cached && cached.perf_category && cached.flare_potential

    if (catalogComplete) {
      return new Response(
        JSON.stringify({
          found:           true,
          source:          'catalog',
          canonical_brand: cached.brand,
          cover_type:      cached.cover_type,
          cover_name:      cached.cover_name,
          core_type:       cached.core_name,
          finish_surface:  cached.factory_finish,
          role_tag:        cached.role_tag,
          perf_category:   cached.perf_category,
          rg:              cached.rg,
          differential:    cached.differential,
          mass_bias:       cached.mass_bias,
          flare_potential: cached.flare_potential,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fall back to OpenAI (also handles stale catalog entries — upsert will update them)
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      return new Response(JSON.stringify({ found: false, error: 'OpenAI not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Factory specs for the ${brand} ${model}?` },
        ],
      }),
    })

    if (!aiRes.ok) {
      return new Response(JSON.stringify({ found: false, error: 'OpenAI request failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiData = await aiRes.json()
    const specs  = JSON.parse(aiData.choices[0].message.content)

    if (!specs.found) {
      return new Response(JSON.stringify({ found: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use canonical brand from AI (may differ from submitted brand)
    const canonicalBrand = typeof specs.brand === 'string' && specs.brand.trim() ? specs.brand.trim() : brand

    // Validate enum values
    const coverTypeOk   = !specs.cover_type    || COVER_TYPES.includes(specs.cover_type)
    const roleTagOk     = !specs.role_tag      || ROLE_TAGS.includes(specs.role_tag)
    const perfCatOk     = !specs.perf_category || PERF_CATS.includes(specs.perf_category)
    const flareOk       = !specs.flare_potential || FLARE_VALUES.includes(specs.flare_potential)

    if (coverTypeOk && roleTagOk && perfCatOk) {
      await supabase.from('balls_catalog').upsert({
        brand:  canonicalBrand,
        model,
        cover_type:      coverTypeOk ? specs.cover_type  || null : null,
        cover_name:      specs.cover_name      || null,
        core_name:       specs.core_name       || null,
        factory_finish:  specs.factory_finish  || null,
        role_tag:        roleTagOk  ? specs.role_tag     || null : null,
        perf_category:   perfCatOk  ? specs.perf_category || null : null,
        core_symmetry:   specs.core_symmetry   || null,
        rg:              typeof specs.rg === 'number'           ? specs.rg           : null,
        differential:    typeof specs.differential === 'number' ? specs.differential : null,
        mass_bias:       typeof specs.mass_bias === 'number'    ? specs.mass_bias    : null,
        flare_potential: flareOk    ? specs.flare_potential || null : null,
        ai_verified:     false,
      }, { onConflict: 'brand,model', ignoreDuplicates: false })
    }

    return new Response(
      JSON.stringify({
        found:           true,
        source:          'ai',
        canonical_brand: canonicalBrand,
        cover_type:      coverTypeOk ? specs.cover_type      ?? null : null,
        cover_name:      specs.cover_name      ?? null,
        core_type:       specs.core_name       ?? null,
        finish_surface:  specs.factory_finish  ?? null,
        role_tag:        roleTagOk   ? specs.role_tag        ?? null : null,
        perf_category:   perfCatOk   ? specs.perf_category   ?? null : null,
        rg:              typeof specs.rg === 'number'           ? specs.rg           : null,
        differential:    typeof specs.differential === 'number' ? specs.differential : null,
        mass_bias:       typeof specs.mass_bias === 'number'    ? specs.mass_bias    : null,
        flare_potential: flareOk     ? specs.flare_potential  ?? null : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(JSON.stringify({ found: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
