import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COVER_TYPES = ['Solid Reactive', 'Pearl Reactive', 'Hybrid Reactive', 'Urethane', 'Polyester', 'Particle']
const ROLE_TAGS   = ['benchmark', 'strong_asym', 'transition', 'urethane', 'spare', 'other']

const SYSTEM_PROMPT = `You are a bowling ball specification expert with knowledge of all major brands and models.
Given a brand and model, return the factory specs as JSON.

Rules:
- cover_type must be exactly one of: "Solid Reactive", "Pearl Reactive", "Hybrid Reactive", "Urethane", "Polyester", "Particle"
- role_tag must be exactly one of: "benchmark", "strong_asym", "transition", "urethane", "spare", "other"
- factory_finish: factory surface spec, e.g. "500/1000 Abralon" or "4000 Abralon / Crown Factory Compound"
- core_name: the core's brand name, e.g. "Catalyst Core" or "Ignitor Core" (omit if unknown)
- core_symmetry: "symmetric" or "asymmetric" (omit if unknown)
- found: true if you recognize this specific ball, false if not

Return only JSON:
{"found":true,"cover_type":"...","factory_finish":"...","role_tag":"...","core_name":"...","core_symmetry":"..."}`

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

    // Check catalog first — free, instant, and accurate
    const { data: cached } = await supabase
      .from('balls_catalog')
      .select('cover_type, core_name, factory_finish, role_tag')
      .eq('brand', brand)
      .eq('model', model)
      .maybeSingle()

    if (cached) {
      return new Response(
        JSON.stringify({
          found: true,
          source: 'catalog',
          cover_type: cached.cover_type,
          core_type: cached.core_name,
          finish_surface: cached.factory_finish,
          role_tag: cached.role_tag,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Fall back to OpenAI
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
    const specs = JSON.parse(aiData.choices[0].message.content)

    if (!specs.found) {
      return new Response(JSON.stringify({ found: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate enum values before saving — discard invalid AI output
    const coverTypeOk = !specs.cover_type || COVER_TYPES.includes(specs.cover_type)
    const roleTagOk   = !specs.role_tag   || ROLE_TAGS.includes(specs.role_tag)

    if (coverTypeOk && roleTagOk) {
      await supabase.from('balls_catalog').insert({
        brand,
        model,
        cover_type:     specs.cover_type     || null,
        core_name:      specs.core_name      || null,
        factory_finish: specs.factory_finish || null,
        role_tag:       specs.role_tag       || null,
        core_symmetry:  specs.core_symmetry  || null,
        ai_verified:    false,
      }).onConflict('brand, model').ignore()
    }

    return new Response(
      JSON.stringify({
        found: true,
        source: 'ai',
        cover_type:    coverTypeOk ? specs.cover_type    : null,
        core_type:     specs.core_name                   ?? null,
        finish_surface: specs.factory_finish             ?? null,
        role_tag:      roleTagOk   ? specs.role_tag      : null,
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
