// ============================================================
// ChurchFlow Liberia — Groq AI Client
// Thin wrapper around the Groq REST API (OpenAI-compatible).
// Supports both regular and streaming responses.
// ============================================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Model selection per task complexity
export const GROQ_MODELS = {
  FAST:    'llama3-8b-8192',            // Simple queries, landing page
  SMART:   'llama-3.3-70b-versatile',  // Sermons, Bible study, analysis
  BALANCED:'llama-3.1-8b-instant',     // Admin summaries, SMS drafts
}

function getKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY
  if (!key) throw new Error('VITE_GROQ_API_KEY is not set.')
  return key
}

// ─── Regular (non-streaming) completion ──────────────────────
export async function groqComplete({
  messages,
  model        = GROQ_MODELS.SMART,
  maxTokens    = 1024,
  temperature  = 0.7,
}) {
  const res = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens:  maxTokens,
      temperature,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error ${res.status}`)
  }

  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

// ─── Streaming completion ─────────────────────────────────────
// onChunk(text) is called for each token chunk received.
// Returns the full assembled text.
export async function groqStream({
  messages,
  model       = GROQ_MODELS.SMART,
  maxTokens   = 1024,
  temperature = 0.7,
  onChunk,    // (chunk: string) => void
  onDone,     // (fullText: string) => void
  signal,     // AbortSignal
}) {
  const res = await fetch(GROQ_API_URL, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${getKey()}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens:  maxTokens,
      temperature,
      stream:      true,
    }),
    signal,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Groq API error ${res.status}`)
  }

  const reader  = res.body.getReader()
  const decoder = new TextDecoder()
  let   full    = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

    for (const line of lines) {
      const data = line.slice(6).trim()
      if (data === '[DONE]') break

      try {
        const json    = JSON.parse(data)
        const content = json.choices?.[0]?.delta?.content
        if (content) {
          full += content
          onChunk?.(content)
        }
      } catch { /* skip malformed chunks */ }
    }
  }

  onDone?.(full)
  return full
}
