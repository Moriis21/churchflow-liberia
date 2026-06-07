// ============================================================
// ChurchFlow Liberia — Groq AI Client
//
// Calls go through the InsForge `groq-proxy` edge function so the
// Groq API key lives ONLY on the server and is never shipped to the
// browser. The frontend authenticates to the function with the public
// anon key (same as every other InsForge call).
// ============================================================

// Server-side proxy endpoint (Groq key held by the edge function).
// Functions are served from https://{appkey}.functions.insforge.app/{slug}
const INSFORGE_URL = (import.meta.env.VITE_INSFORGE_URL || '').replace(/\/+$/, '')
const ANON_KEY     = import.meta.env.VITE_INSFORGE_ANON_KEY || ''

function functionsBase() {
  try {
    const appkey = new URL(INSFORGE_URL).hostname.split('.')[0]  // e.g. "nihu7zi9"
    return `https://${appkey}.functions.insforge.app`
  } catch {
    return ''
  }
}
const GROQ_API_URL = `${functionsBase()}/groq-proxy`

export const GROQ_MODELS = {
  FAST:     'llama-3.1-8b-instant',    // Simple queries, landing page (replaces decommissioned llama3-8b-8192)
  SMART:    'llama-3.3-70b-versatile', // Sermons, Bible study, analysis
  BALANCED: 'llama-3.1-8b-instant',   // Admin summaries, SMS drafts
}

const IS_DEV = import.meta.env.DEV

// Auth header for the proxy — anon key, NOT the Groq key.
function proxyHeaders() {
  return {
    'Content-Type':  'application/json',
    ...(ANON_KEY ? { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` } : {}),
  }
}

// ─── Unified error builder ────────────────────────────────────
async function buildApiError(res) {
  let body = null
  try { body = await res.json() } catch { /* ignore parse error */ }

  const providerMsg  = body?.error?.message || body?.message || null
  const shortMessage = providerMsg || `HTTP ${res.status} from Groq API`

  console.error('[Groq] API error', {
    status:   res.status,
    url:      GROQ_API_URL,
    provider: providerMsg,
    body,
  })

  const err = new Error(shortMessage)
  err.status      = res.status
  err.groqBody    = body
  err.userMessage = IS_DEV
    ? `Groq error ${res.status}: ${shortMessage}`
    : 'I\'m having trouble connecting right now. Please try again.'

  return err
}

// ─── Regular (non-streaming) completion ──────────────────────
export async function groqComplete({
  messages,
  model       = GROQ_MODELS.SMART,
  maxTokens   = 1024,
  temperature = 0.7,
}) {
  const requestBody = { model, messages, max_tokens: maxTokens, temperature }

  console.debug('[Groq] groqComplete →', { model, messages: messages.length })

  let res
  try {
    res = await fetch(GROQ_API_URL, {
      method:  'POST',
      headers: proxyHeaders(),
      body: JSON.stringify(requestBody),
    })
  } catch (netErr) {
    console.error('[Groq] Network error:', netErr)
    const err = new Error(netErr.message)
    err.userMessage = IS_DEV
      ? `Network error: ${netErr.message}`
      : 'Network error. Check your internet connection and try again.'
    throw err
  }

  if (!res.ok) throw await buildApiError(res)

  const json = await res.json()
  console.debug('[Groq] groqComplete ✓', { model, tokens: json.usage?.total_tokens })
  return json.choices?.[0]?.message?.content ?? ''
}

// ─── Streaming completion (SSE) ──────────────────────────────
// BUG FIX: inner `break` on [DONE] previously only exited the
// `for` loop. Now we set `streamDone = true` and break the
// outer `while` loop as well.
export async function groqStream({
  messages,
  model       = GROQ_MODELS.SMART,
  maxTokens   = 1024,
  temperature = 0.7,
  onChunk,   // (text: string) => void — called per token
  onDone,    // (fullText: string) => void — called on finish
  signal,    // AbortSignal
}) {
  const requestBody = {
    model,
    messages,
    max_tokens:  maxTokens,
    temperature,
    stream:      true,
  }

  console.debug('[Groq] groqStream →', { model, messages: messages.length })

  let res
  try {
    res = await fetch(GROQ_API_URL, {
      method:  'POST',
      headers: proxyHeaders(),
      body:   JSON.stringify(requestBody),
      signal,
    })
  } catch (netErr) {
    if (netErr.name === 'AbortError') throw netErr
    console.error('[Groq] Network error:', netErr)
    const err = new Error(netErr.message)
    err.userMessage = IS_DEV
      ? `Network error: ${netErr.message}`
      : 'Network error. Check your connection and try again.'
    throw err
  }

  if (!res.ok) throw await buildApiError(res)

  const reader    = res.body.getReader()
  const decoder   = new TextDecoder()
  let   full      = ''
  let   streamDone = false

  try {
    while (!streamDone) {
      const { done, value } = await reader.read()
      if (done) break

      const raw   = decoder.decode(value, { stream: true })
      const lines = raw.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') { streamDone = true; break }
        if (!data) continue

        try {
          const parsed  = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) {
            full += content
            onChunk?.(content)
          }
        } catch (parseErr) {
          console.debug('[Groq] SSE parse skip:', data.slice(0, 60))
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  console.debug('[Groq] groqStream ✓', { model, chars: full.length })
  onDone?.(full)
  return full
}
