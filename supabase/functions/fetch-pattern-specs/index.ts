import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CATEGORIES  = ['short', 'medium', 'long', 'sport', 'custom']
const SOURCES     = ['kegel', 'pba', 'brunswick', 'usbc', 'storm', 'track', 'columbia', 'motiv', 'house', 'tournament', 'other']

const SYSTEM_PROMPT = `You are an oil pattern specification expert with knowledge of all published bowling lane oil patterns.
Given a pattern name, return its published specifications as JSON.

Rules:
- length_ft: numeric, e.g. 40 or 39.5 (feet of oil)
- volume_ml: numeric total volume in mL if known, else omit
- ratio: numeric front-to-back load ratio if known (e.g. 3.2), else omit
- category: exactly one of "short" (<35ft), "medium" (35-42ft), "long" (>42ft), "sport" (sport condition), "custom"
- source: exactly one of "kegel", "pba", "brunswick", "usbc", "storm", "track", "columbia", "motiv", "house", "tournament", "other"
- notes: one sentence describing the pattern's playing characteristic
- found: true if you recognize this pattern, false if not

Return only JSON:
{"found":true,"length_ft":40,"volume_ml":24,"ratio":3.2,"category":"medium","source":"kegel","notes":"..."}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name } = await req.json()
    if (!name) {
      return new Response(JSON.stringify({ error: 'name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Check catalog first — case-insensitive name match
    const { data: cached } = await supabase
      .from('patterns')
      .select('length_ft, volume_ml, ratio, category, source, notes')
      .ilike('name', name.trim())
      .maybeSingle()

    if (cached) {
      return new Response(
        JSON.stringify({ found: true, source_db: true, ...cached }),
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
          { role: 'user',   content: `Specs for the oil pattern named "${name}"?` },
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

    // Validate enums before persisting
    const categoryOk = !specs.category || CATEGORIES.includes(specs.category)
    const sourceOk   = !specs.source   || SOURCES.includes(specs.source)

    if (categoryOk && sourceOk) {
      await supabase.from('patterns').insert({
        name:         name.trim(),
        length_ft:    specs.length_ft    ?? null,
        volume_ml:    specs.volume_ml    ?? null,
        ratio:        specs.ratio        ?? null,
        category:     categoryOk ? specs.category : 'other',
        source:       sourceOk   ? specs.source   : 'other',
        notes:        specs.notes        ?? null,
        ai_verified:  false,
      }).onConflict('name').ignore()
    }

    return new Response(
      JSON.stringify({
        found:      true,
        source_db:  false,
        length_ft:  specs.length_ft                      ?? null,
        volume_ml:  specs.volume_ml                      ?? null,
        ratio:      specs.ratio                          ?? null,
        category:   categoryOk ? specs.category          : null,
        source:     sourceOk   ? specs.source            : null,
        notes:      specs.notes                          ?? null,
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
