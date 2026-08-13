/**
 * ChurchFlow Liberia — Groq AI Proxy Edge Function
 *
 * Server-side ONLY. Reads GROQ_API_KEY from env so the Groq key is
 * never shipped to the browser. The frontend posts the same body it
 * used to send to Groq directly; this function forwards it to Groq
 * with the secret key attached.
 *
 * Supports both streaming (SSE passthrough) and non-streaming.
 *
 * POST /groq-proxy
 * Body: { messages, model, max_tokens, temperature, stream? }
 *
 * Returns:
 *   - stream:true  → text/event-stream piped straight from Groq
 *   - otherwise    → Groq JSON chat-completion response
 */

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') ?? ''
const GROQ_URL      = 'https://api.groq.com/openai/v1/chat/completions'

// Models the frontend is allowed to request (prevents abuse of the key
// to call arbitrary/expensive models).
const ALLOWED_MODELS = new Set([
  'openai/gpt-oss-20b',
  'openai/gpt-oss-120b',
])

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  if (!GROQ_API_KEY) {
    console.error('[groq-proxy] GROQ_API_KEY is not set')
    return json({ error: 'AI is not configured on the server.' }, 500)
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { messages, model, max_tokens, temperature, stream } = body || {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: '`messages` array is required' }, 400)
  }

  const useModel = ALLOWED_MODELS.has(model) ? model : 'openai/gpt-oss-20b'

  const upstreamBody = JSON.stringify({
    model:       useModel,
    messages,
    max_tokens:  typeof max_tokens === 'number' ? max_tokens : 1024,
    temperature: typeof temperature === 'number' ? temperature : 0.7,
    stream:      !!stream,
  })

  let upstream: Response
  try {
    upstream = await fetch(GROQ_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: upstreamBody,
    })
  } catch (err) {
    console.error('[groq-proxy] upstream fetch threw:', err)
    return json({ error: 'Failed to reach AI provider.' }, 502)
  }

  // Error from Groq → pass through status + body as JSON
  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => '')
    console.warn('[groq-proxy] Groq error', upstream.status, errText.slice(0, 200))
    return new Response(errText || JSON.stringify({ error: `Groq HTTP ${upstream.status}` }), {
      status:  upstream.status,
      headers: { ...cors, 'Content-Type': 'application/json' },
    })
  }

  // Streaming → pipe the SSE body straight through
  if (stream && upstream.body) {
    return new Response(upstream.body, {
      status:  200,
      headers: {
        ...cors,
        'Content-Type':  'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection':    'keep-alive',
      },
    })
  }

  // Non-streaming → return JSON
  const data = await upstream.json().catch(() => ({}))
  return json(data)
}
