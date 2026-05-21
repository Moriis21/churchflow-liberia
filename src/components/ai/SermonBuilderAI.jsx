// ============================================================
// ChurchFlow Liberia — Sermon Builder AI
// A structured tool for pastors to prepare sermons.
// Step 1: Choose sermon type + enter scripture/topic
// Step 2: AI generates structured outline
// Step 3: Pastor can refine, save, export
// ============================================================
import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  BookOpen, Sparkles, Save, Download, RefreshCw,
  ChevronDown, ChevronUp, Copy, Check, Loader2,
  FileText, X,
} from 'lucide-react'
import { groqStream, GROQ_MODELS } from '../../services/ai/groqClient'
import { getSystemPrompt } from '../../services/ai/aiPersonalities'
import { saveOutput, logUsage } from '../../services/ai/conversationService'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import toast from 'react-hot-toast'

const SERMON_TYPES = [
  { value: 'sunday_service',  label: 'Sunday Service'    },
  { value: 'teaching',        label: 'Teaching / Study'  },
  { value: 'evangelistic',    label: 'Evangelistic'      },
  { value: 'youth',           label: 'Youth Service'     },
  { value: 'prayer_service',  label: 'Prayer Service'    },
  { value: 'bible_study',     label: 'Bible Study'       },
  { value: 'womens',          label: 'Women\'s Service'  },
  { value: 'mens',            label: 'Men\'s Service'    },
]

// Exported sermon content to markdown-friendly text
function toPlainText(content) {
  return content
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .trim()
}

export default function SermonBuilderAI({ className = '' }) {
  const { user }   = useAuth()
  const { church } = useChurch()

  const [step,        setStep]        = useState(1)  // 1=input, 2=result
  const [scripture,   setScripture]   = useState('')
  const [sermonType,  setSermonType]  = useState('sunday_service')
  const [extra,       setExtra]       = useState('')
  const [result,      setResult]      = useState('')
  const [streaming,   setStreaming]   = useState(false)
  const [copied,      setCopied]      = useState(false)
  const [saving,      setSaving]      = useState(false)
  const abortRef = useRef(null)

  const generate = async () => {
    if (!scripture.trim()) { toast.error('Please enter a scripture or topic.'); return }

    const typeLabel  = SERMON_TYPES.find(t => t.value === sermonType)?.label || sermonType
    const userPrompt = [
      `Scripture / Topic: ${scripture.trim()}`,
      `Service Type: ${typeLabel}`,
      extra.trim() ? `Additional context: ${extra.trim()}` : '',
      '',
      'Please generate a complete, structured sermon outline I can build from.',
    ].filter(Boolean).join('\n')

    setResult('')
    setStep(2)
    setStreaming(true)
    abortRef.current = new AbortController()

    try {
      await groqStream({
        messages: [
          { role: 'system', content: getSystemPrompt('sermon') },
          { role: 'user',   content: userPrompt },
        ],
        model:       GROQ_MODELS.SMART,
        maxTokens:   1500,
        temperature: 0.75,
        signal:      abortRef.current.signal,
        onChunk:  (chunk) => setResult(prev => prev + chunk),
        onDone:   (full)  => {
          logUsage({ userId: user?.id, churchId: church?.id, featureName: 'sermon_ai', tokensUsed: Math.ceil(full.length / 4) })
        },
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Generation failed. Please try again.')
        setStep(1)
      }
    } finally {
      setStreaming(false)
    }
  }

  const stop = () => {
    abortRef.current?.abort()
    setStreaming(false)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(toPlainText(result))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  const save = async () => {
    if (!result) return
    setSaving(true)
    const title = `Sermon — ${scripture.slice(0, 40)}`
    await saveOutput({
      userId:     user?.id,
      churchId:   church?.id,
      outputType: 'sermon_outline',
      title,
      content:    result,
      metadata:   { scripture, sermonType },
    })
    setSaving(false)
    toast.success('Sermon outline saved!')
  }

  const downloadTxt = () => {
    const blob = new Blob([toPlainText(result)], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `sermon-${scripture.slice(0, 30).replace(/\s+/g, '-')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => { setStep(1); setResult(''); setScripture(''); setExtra('') }

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>

      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#1E1B4B] to-[#7C3AED]">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4.5 h-4.5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold">Sermon Companion</p>
          <p className="text-white/60 text-[10px]">AI-powered sermon preparation · ChurchFlow</p>
        </div>
        {step === 2 && !streaming && (
          <button onClick={reset}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <RefreshCw className="w-3 h-3" /> New
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">

        {/* ── Step 1: Input ── */}
        {step === 1 && (
          <motion.div key="step1"
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
            className="p-5 space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Scripture or Topic <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={scripture}
                onChange={e => setScripture(e.target.value)}
                placeholder="e.g. John 15:1-8, Faith, The Power of Prayer"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service Type</label>
              <select value={sermonType} onChange={e => setSermonType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none bg-white transition-all">
                {SERMON_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Additional notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea value={extra} onChange={e => setExtra(e.target.value)}
                placeholder="e.g. Focus on practical application, congregation is going through a difficult period…"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
              />
            </div>

            <button onClick={generate} disabled={!scripture.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-bold hover:from-violet-700 hover:to-purple-800 disabled:opacity-40 shadow-sm shadow-purple-500/20 transition-all">
              <Sparkles className="w-4 h-4" />
              Generate Sermon Outline
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              The AI will build a structured outline you can preach from and adjust to your own style.
            </p>
          </motion.div>
        )}

        {/* ── Step 2: Result ── */}
        {step === 2 && (
          <motion.div key="step2"
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            {/* Action bar */}
            {!streaming && result && (
              <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50 flex-wrap">
                <button onClick={copy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-colors">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button onClick={save} disabled={saving}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-colors disabled:opacity-50">
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
                <button onClick={downloadTxt}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-colors">
                  <Download className="w-3 h-3" /> Export
                </button>
                {streaming && (
                  <button onClick={stop}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 border border-red-200 transition-colors ml-auto">
                    <X className="w-3 h-3" /> Stop
                  </button>
                )}
              </div>
            )}

            {/* Streaming header */}
            {streaming && (
              <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-purple-50">
                <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                <span className="text-xs font-medium text-purple-700">Building your sermon outline…</span>
              </div>
            )}

            {/* Result text */}
            <div className="p-5 overflow-y-auto max-h-[500px]">
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                {result}
                {streaming && (
                  <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse rounded-sm" />
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
