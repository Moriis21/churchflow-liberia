// ============================================================
// ChurchFlow Liberia — AIChatPanel
//
// Reusable chat UI used by every AI assistant in the platform.
// Handles streaming responses, suggested prompts, copy/save,
// and action transforms (simplify, shorten, turn into devotional).
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Send, Copy, Download, RefreshCw, Sparkles,
  ChevronDown, Check, X, Loader2, StopCircle,
  BookOpen, FileText, MessageSquare, Zap,
} from 'lucide-react'
import { groqStream, GROQ_MODELS } from '../../services/ai/groqClient'
import { getSystemPrompt, SUGGESTED_PROMPTS } from '../../services/ai/aiPersonalities'
import { logUsage } from '../../services/ai/conversationService'
import toast from 'react-hot-toast'

// ─── Single message bubble ────────────────────────────────────
function MessageBubble({ msg, onAction, isStreaming }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isAI = msg.role === 'assistant'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isAI ? 'items-start' : 'items-start justify-end'}`}
    >
      {/* AI avatar */}
      {isAI && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* Bubble */}
        <div className={`
          px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
          ${isAI
            ? 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-tl-sm'
            : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-tr-sm'
          }
        `}>
          {msg.content}
          {isStreaming && isAI && (
            <span className="inline-block w-1.5 h-4 bg-purple-500 ml-0.5 animate-pulse rounded-sm" />
          )}
        </div>

        {/* AI message actions */}
        {isAI && !isStreaming && msg.content && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <button onClick={copy}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button onClick={() => onAction('simplify', msg.content)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors">
              <Zap className="w-3 h-3" /> Simplify
            </button>
            <button onClick={() => onAction('shorten', msg.content)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors">
              <RefreshCw className="w-3 h-3" /> Shorten
            </button>
            <button onClick={() => onAction('devotional', msg.content)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors">
              <BookOpen className="w-3 h-3" /> Devotional
            </button>
            <button onClick={() => onAction('sermon', msg.content)}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
              <FileText className="w-3 h-3" /> Sermon
            </button>
          </div>
        )}
      </div>

      {/* User avatar */}
      {!isAI && (
        <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4 text-slate-500" />
        </div>
      )}
    </motion.div>
  )
}

// ─── Main AIChatPanel ─────────────────────────────────────────
export default function AIChatPanel({
  assistantType  = 'landing',  // 'landing' | 'sermon' | 'bible' | 'church_admin' | 'super_admin' | etc.
  assistantName  = 'ChurchFlow Guide',
  placeholder    = 'Ask me anything…',
  userId         = null,
  churchId       = null,
  userRole       = 'visitor',
  model          = GROQ_MODELS.SMART,
  maxTokens      = 1024,
  className      = '',
  onSaveOutput   = null, // (content, type) => void — called when user saves
  compact        = false,
}) {
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState('')
  const [streaming,   setStreaming]   = useState(false)
  const [streamingId, setStreamingId] = useState(null)
  const bottomRef = useRef(null)
  const abortRef  = useRef(null)
  const textareaRef = useRef(null)

  const suggestedPrompts = SUGGESTED_PROMPTS[assistantType] || SUGGESTED_PROMPTS.landing
  const systemPrompt     = getSystemPrompt(assistantType)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Build Groq messages array from history
  const buildMessages = useCallback((userText) => {
    const history = messages
      .filter(m => m.content)
      .slice(-10) // keep last 10 for context window
      .map(m => ({ role: m.role, content: m.content }))

    return [
      { role: 'system',  content: systemPrompt },
      ...history,
      { role: 'user',    content: userText },
    ]
  }, [messages, systemPrompt])

  // Send a message
  const send = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || streaming) return

    setInput('')

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])

    // Placeholder AI message
    const aiId  = Date.now() + 1
    const aiMsg = { id: aiId, role: 'assistant', content: '' }
    setMessages(prev => [...prev, aiMsg])
    setStreaming(true)
    setStreamingId(aiId)

    abortRef.current = new AbortController()

    try {
      await groqStream({
        messages:    buildMessages(trimmed),
        model,
        maxTokens,
        temperature: 0.72,
        signal:      abortRef.current.signal,
        onChunk: (chunk) => {
          setMessages(prev => prev.map(m =>
            m.id === aiId ? { ...m, content: m.content + chunk } : m
          ))
        },
        onDone: (full) => {
          logUsage({ userId, churchId, featureName: assistantType, tokensUsed: Math.ceil(full.length / 4) })
        },
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => prev.map(m =>
          m.id === aiId
            ? { ...m, content: "I'm having a little trouble right now. Please try again in a moment." }
            : m
        ))
      }
    } finally {
      setStreaming(false)
      setStreamingId(null)
    }
  }, [input, streaming, buildMessages, model, maxTokens, userId, churchId, assistantType])

  // Stop streaming
  const stop = () => {
    abortRef.current?.abort()
    setStreaming(false)
    setStreamingId(null)
  }

  // Transform actions (simplify, shorten, devotional, sermon)
  const handleAction = useCallback(async (action, content) => {
    const prompts = {
      simplify:   `Make this simpler and easier to understand:\n\n${content}`,
      shorten:    `Shorten this to its most essential points:\n\n${content}`,
      devotional: `Turn this into a warm, personal devotional for a church member:\n\n${content}`,
      sermon:     `Convert this into a structured sermon outline:\n\n${content}`,
    }
    if (prompts[action]) await send(prompts[action])
  }, [send])

  // Handle Enter key
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden ${className}`}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-[#1E1B4B] to-[#7C3AED]">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">{assistantName}</p>
          <p className="text-white/60 text-[10px]">AI Assistant · ChurchFlow Liberia</p>
        </div>
        {streaming && (
          <div className="ml-auto flex items-center gap-1.5 text-white/70 text-xs">
            <Loader2 className="w-3 h-3 animate-spin" />
            Thinking…
          </div>
        )}
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto px-4 py-4 space-y-4 ${compact ? 'min-h-[240px] max-h-[340px]' : 'min-h-[300px] max-h-[480px]'}`}>

        {/* Welcome state */}
        {isEmpty && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-1">How can I help you today?</p>
            <p className="text-xs text-slate-400 mb-4">Try one of these to get started</p>

            {/* Suggested prompts */}
            <div className="flex flex-col gap-2">
              {suggestedPrompts.slice(0, 4).map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-left text-xs text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 hover:border-purple-200 px-3 py-2 rounded-xl transition-colors">
                  {p}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message list */}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onAction={handleAction}
            isStreaming={streaming && msg.id === streamingId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-100 px-3 py-2.5">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-400 max-h-24 overflow-y-auto"
            style={{ minHeight: '40px' }}
          />
          {streaming ? (
            <button onClick={stop}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors">
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => send()}
              disabled={!input.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white flex items-center justify-center disabled:opacity-40 hover:from-violet-700 hover:to-purple-800 transition-all shadow-sm shadow-purple-500/20">
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-300 mt-1.5 text-center">
          Powered by Groq AI · For guidance only — always consult your pastor for spiritual decisions
        </p>
      </div>
    </div>
  )
}
