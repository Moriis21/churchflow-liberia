/**
 * ChurchFlow Liberia — Sermon Transcription Edge Function
 * Uses OpenRouter (Whisper-compatible) to transcribe sermon audio.
 * Also generates a structured summary using GPT.
 */

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY') ?? ''
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { action, audioUrl, rawText, sermonTitle, preacher } = body

    // ── Action: transcribe_url ─────────────────────────────────
    // Fetches audio from a public URL and transcribes via Whisper
    if (action === 'transcribe_url' && audioUrl) {
      // Download the audio file
      const audioResponse = await fetch(audioUrl)
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`)
      }

      const audioBlob = await audioResponse.blob()
      const formData = new FormData()
      formData.append('file', audioBlob, 'sermon.mp3')
      formData.append('model', 'openai/whisper-large-v3')
      formData.append('language', 'en')
      formData.append('response_format', 'text')

      const whisperRes = await fetch(`${OPENROUTER_BASE}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${OPENROUTER_API_KEY}` },
        body: formData,
      })

      if (!whisperRes.ok) {
        const err = await whisperRes.text()
        throw new Error(`Whisper error: ${err}`)
      }

      const transcript = await whisperRes.text()

      // Generate structured summary
      const summary = await generateSummary(transcript, sermonTitle, preacher)

      return new Response(
        JSON.stringify({ success: true, transcript, summary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // ── Action: summarize ──────────────────────────────────────
    // Takes raw text (already transcribed) and generates a summary
    if (action === 'summarize' && rawText) {
      const summary = await generateSummary(rawText, sermonTitle, preacher)
      return new Response(
        JSON.stringify({ success: true, summary }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: transcribe_url | summarize' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Transcription error:', message)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
}

// ── Generate structured sermon summary ──────────────────────────
async function generateSummary(
  transcript: string,
  sermonTitle?: string,
  preacher?: string,
): Promise<{ keyPoints: string[]; scriptureReferences: string[]; summary: string; keywords: string[] }> {
  const systemPrompt = `You are a helpful assistant for a Liberian church management system called ChurchFlow Liberia.
Your job is to analyze sermon transcripts and extract structured information.
Always respond with valid JSON only — no markdown, no code blocks, just raw JSON.`

  const userPrompt = `Analyze this sermon transcript${sermonTitle ? ` titled "${sermonTitle}"` : ''}${preacher ? ` by ${preacher}` : ''} and return a JSON object with these exact fields:
{
  "summary": "A 2-3 sentence overview of the sermon message",
  "keyPoints": ["point 1", "point 2", "point 3", "...up to 5 key points"],
  "scriptureReferences": ["Book Chapter:Verse", "...all Bible references mentioned"],
  "keywords": ["word1", "word2", "...5-8 searchable keywords"]
}

Transcript:
${transcript.slice(0, 4000)}`

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://churchflowliberia.insforge.site',
      'X-Title': 'ChurchFlow Liberia',
    },
    body: JSON.stringify({
      model: 'openai/gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  })

  if (!res.ok) {
    console.error('Summary generation failed:', await res.text())
    return { summary: '', keyPoints: [], scriptureReferences: [], keywords: [] }
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content ?? '{}'

  try {
    return JSON.parse(content)
  } catch {
    return { summary: content, keyPoints: [], scriptureReferences: [], keywords: [] }
  }
}
