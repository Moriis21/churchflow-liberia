// ============================================================
// ChurchFlow Liberia — Groq AI Client
// Fixed: streaming [DONE] handler, dev/prod error detail,
//        key validation, model name check.
// ============================================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export const GROQ_MODELS = {
  FAST:     'llama3-8b-8192',           // Simple queries, landing page
  SMART:    'llama-3.3-70b-versatile',  // Sermons, Bible study, analysis
  BALANCED: 'llama-3.1-8b-instant',    // Admin summaries, SMS drafts
}

const IS_DEV = import.meta.env.DEV

// ─── API key validation ───────────────────────────────────────
function getKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key || key === 'your_groq_api_key_here' || key.trim() === '') {
    const msg = '[Groq] VITE_GROQ_API_KEY is not set. Add it to .env and redeploy.'
    console.error(msg)
    throw Object.assign(new Error('AI_KEY_MISSING'), { userMessage: msg })
  }
  if (!key.startsWith('gsk_')) {
    console.warn('[Groq] API key does not start with "gsk_" — may be invalid.')
  }
  return key
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
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${getKey()}`,
      },
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
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${getKey()}`,
      },
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
