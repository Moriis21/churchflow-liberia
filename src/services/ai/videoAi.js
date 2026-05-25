// ============================================================
// ChurchFlow Liberia — Video AI helper
//
// Generates a short summary, discussion questions, and devotional
// from a media_resources row. We don't have video transcripts, so
// the prompt uses title + description + provider as the context.
// Cache hits are served from DB; misses call Groq and persist.
// ============================================================
import { groqComplete, GROQ_MODELS } from './groqClient'
import { getCachedAiOutput, saveAiOutput } from '../mediaService'

const PROMPTS = {
  summary: (r) => `You are a thoughtful Bible study companion.

Write a clear, faith-affirming summary (3–5 sentences, ~80–120 words) of this teaching resource. Stick to what's likely covered based on the title and description. Avoid speculation. Tone: warm, pastoral, accessible to a Liberian church audience.

Title: ${r.title}
Provider: ${r.provider}
Description: ${r.description || '(no description provided)'}

Return the summary only — no preamble.`,

  questions: (r) => `You are a small-group Bible study facilitator.

Write 5 thoughtful discussion questions a Liberian church small-group could use after watching this teaching. Mix observation, interpretation, and application questions. Avoid yes/no questions.

Title: ${r.title}
Provider: ${r.provider}
Description: ${r.description || '(no description provided)'}

Return ONLY the 5 questions as a numbered list (1. … 2. …). No intro or outro.`,

  devotional: (r) => `You are writing a short daily devotional for ChurchFlow Liberia.

Based on this teaching, write a 5-paragraph devotional:
1) Opening scripture reference (1 line, just book chapter:verse — pick one that fits)
2) Setting / context (2–3 sentences)
3) Key truth (2–3 sentences)
4) Real-life application for a Liberian believer (2–3 sentences)
5) Closing prayer (2–3 sentences)

Title: ${r.title}
Provider: ${r.provider}
Description: ${r.description || '(no description provided)'}

Return ONLY the devotional. Use clear paragraph breaks.`,
}

const LABELS = {
  summary:    'AI Summary',
  questions:  'Discussion Questions',
  devotional: 'Daily Devotional',
}

export const AI_KINDS = Object.keys(PROMPTS)
export function aiKindLabel(kind) { return LABELS[kind] || kind }

// Get-or-generate. Returns { content, cached, model } or throws.
export async function getOrGenerateAi(resource, kind) {
  if (!resource?.id) throw new Error('Resource is required.')
  if (!PROMPTS[kind]) throw new Error(`Unknown AI kind: ${kind}`)

  // Cache hit?
  const cached = await getCachedAiOutput(resource.id, kind)
  if (cached?.content) {
    return { content: cached.content, cached: true, model: cached.model }
  }

  // Miss — call Groq
  const content = await groqComplete({
    messages: [
      { role: 'system', content: 'You are a Christian teaching assistant for ChurchFlow Liberia. Stay biblical, warm, and concise.' },
      { role: 'user',   content: PROMPTS[kind](resource) },
    ],
    model:       GROQ_MODELS.SMART,
    maxTokens:   600,
    temperature: 0.6,
  })
  const trimmed = (content || '').trim()
  if (!trimmed) throw new Error('AI returned an empty response. Try again.')

  // Persist (best-effort, never blocks UI)
  saveAiOutput(resource.id, kind, trimmed, GROQ_MODELS.SMART).catch(() => {})
  return { content: trimmed, cached: false, model: GROQ_MODELS.SMART }
}
