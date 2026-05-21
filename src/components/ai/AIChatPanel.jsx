// ============================================================
// ChurchFlow Liberia — AIChatPanel
//
// Core reusable streaming chat component.
// Mobile-first, dev/prod error detail, retry button,
// floating typing indicator, auto-scroll.
// ============================================================
import React, {
  useState, useRef, useEffect, useCallback, useMemo
} from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Send, Copy, RefreshCw, Sparkles, Check,
  StopCircle, Loader2, BookOpen, FileText,
  Zap, AlertTriangle, RotateCcw, ExternalLink,
  MessageSquare, X,
} from 'lucide-react'
import { groqStream, GROQ_MODELS } from '../../services/ai/groqClient'
import { getSystemPrompt, SUGGESTED_PROMPTS } from '../../services/ai/aiPersonalities'
import { logUsage } from '../../services/ai/conversationService'
import toast from 'react-hot-toast'

const IS_DEV = import.meta.env.DEV

// ─── Typing dots indicator ────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm w-fit">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex gap-1 items-center">
        {[0, 0.18, 0.36].map((delay, i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Single message bubble ────────────────────────────────────
function MessageBubble({ msg, onAction, isStreaming }) {
  const [copied, setCopied] = useState(false)
  const isAI = msg.role === 'assistant'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={`flex gap-2.5 ${isAI ? 'items-start' : 'items-start justify-end'}`}
    >
      {/* AI avatar */}
      {isAI && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className={`max-w-[82%] sm:max-w-[80%] ${isAI ? '' : 'flex flex-col items-end'}`}>
        {/* Message bubble */}
        <div className={`
          px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
          ${isAI
            ? 'bg-white border border-slate-100 shadow-sm text-slate-800 rounded-tl-sm whitespace-pre-wrap'
            : 'bg-gradient-to-r from-violet-600 to-purple-700 text-white rounded-tr-sm'
          }
        `}>
          {msg.content}
          {isStreaming && isAI && (
            <span className="inline-block w-1.5 h-4 bg-purple-400 ml-0.5 animate-pulse rounded-sm align-middle" />
          )}
        </div>

        {/* Error state */}
        {msg.isError && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Response failed</span>
          </div>
        )}

        {/* AI message actions — only when finished */}
        {isAI && !isStreaming && msg.content && (
          <div className="flex items-center gap-0.5 mt-1 flex-wrap">
            <button onClick={handleCopy}
              className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors">
              {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onAction && (
              <>
                <button onClick={() => onAction('simplify', msg.content)}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                  <Zap className="w-3 h-3" /> Simplify
                </button>
                <button onClick={() => onAction('shorter', msg.content)}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                  <RefreshCw className="w-3 h-3" /> Shorter
                </button>
                <button onClick={() => onAction('devotional', msg.content)}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-600 px-2 py-1 rounded-lg hover:bg-amber-50 transition-colors">
                  <BookOpen className="w-3 h-3" /> Devotional
                </button>
                <button onClick={() => onAction('sermon', msg.content)}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-indigo-600 px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                  <FileText className="w-3 h-3" /> Sermon
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* User icon */}
      {!isAI && (
        <div className="w-7 h-7 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
        </div>
      )}
    </motion.div>
  )
}

// ─── Error panel with retry ───────────────────────────────────
function ErrorPanel({ error, onRetry, lastInput }) {
  const isDev = import.meta.env.DEV
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="mx-1 p-4 bg-red-50 border border-red-100 rounded-2xl"
    >
      <div className="flex items-start gap-2.5 mb-3">
        <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-700 mb-0.5">Couldn't get a response</p>
          <p className="text-xs text-red-500 leading-relaxed">
            {isDev
              ? (error?.userMessage || error?.message || 'Unknown error')
              : 'Something went wrong connecting to the AI. Please try again.'
            }
          </p>
          {isDev && error?.status && (
            <p className="text-[10px] text-red-400 mt-1 font-mono">Status: {error.status}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {onRetry && lastInput && (
          <button onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
            <RotateCcw className="w-3 h-3" /> Try again
          </button>
        )}
        <a href="/contact"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-600 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-200 transition-colors">
          <ExternalLink className="w-3 h-3" /> Contact support
        </a>
      </div>
    </motion.div>
  )
}

// ─── Main AIChatPanel ─────────────────────────────────────────
export default function AIChatPanel({
  assistantType  = 'landing',
  assistantName  = 'ChurchFlow Guide',
  placeholder    = 'Ask me anything…',
  userId         = null,
  churchId       = null,
  userRole       = 'visitor',
  model          = GROQ_MODELS.SMART,
  maxTokens      = 1024,
  className      = '',
  onSaveOutput   = null,
  onClose        = null,
  compact        = false,
}) {
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState('')
  const [streaming,   setStreaming]   = useState(false)
  const [typing,      setTyping]      = useState(false)   // dots before first token
  const [streamingId, setStreamingId] = useState(null)
  const [lastError,   setLastError]   = useState(null)
  const [lastInput,   setLastInput]   = useState('')

  const bottomRef   = useRef(null)
  const abortRef    = useRef(null)
  const textareaRef = useRef(null)
  const messagesRef = useRef(null)

  const prompts       = useMemo(() => SUGGESTED_PROMPTS[assistantType] || SUGGESTED_PROMPTS.landing, [assistantType])
  const systemPrompt  = useMemo(() => getSystemPrompt(assistantType), [assistantType])
  const isEmpty       = messages.length === 0

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  // Build Groq context window (last 10 messages)
  const buildMessages = useCallback((userText) => {
    const history = messages
      .filter(m => m.content && !m.isError)
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }))
    return [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user',   content: userText },
    ]
  }, [messages, systemPrompt])

  // Core send function
  const send = useCallback(async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed || streaming) return

    setInput('')
    setLastError(null)
    setLastInput(trimmed)

    // Add user message
    const userMsg = { id: crypto.randomUUID(), role: 'user', content: trimmed }
    setMessages(prev => [...prev, userMsg])

    // Show typing dots before first token arrives
    setTyping(true)

    const aiId  = crypto.randomUUID()

    abortRef.current = new AbortController()

    let firstToken = false

    try {
      await groqStream({
        messages:    buildMessages(trimmed),
        model,
        maxTokens,
        temperature: 0.72,
        signal:      abortRef.current.signal,

        onChunk: (chunk) => {
          // First chunk — swap typing dots for actual message
          if (!firstToken) {
            firstToken = true
            setTyping(false)
            setStreaming(true)
            setStreamingId(aiId)
            setMessages(prev => [
              ...prev,
              { id: aiId, role: 'assistant', content: chunk },
            ])
          } else {
            setMessages(prev => prev.map(m =>
              m.id === aiId ? { ...m, content: m.content + chunk } : m
            ))
          }
        },

        onDone: (full) => {
          logUsage({
            userId,
            churchId,
            featureName: assistantType,
            tokensUsed:  Math.ceil(full.length / 4),
          })
        },
      })
    } catch (err) {
      setTyping(false)

      if (err.name === 'AbortError') {
        // User stopped — that's fine, just mark the partial message as done
        setMessages(prev => prev.map(m =>
          m.id === aiId ? { ...m, content: (m.content || '') + ' *(stopped)*' } : m
        ))
      } else {
        // Real error — remove placeholder, show error panel
        console.error('[AIChatPanel] AI error:', err)
        setMessages(prev => prev.filter(m => m.id !== aiId))
        setLastError(err)
      }
    } finally {
      setStreaming(false)
      setStreamingId(null)
      setTyping(false)
    }
  }, [input, streaming, buildMessages, model, maxTokens, userId, churchId, assistantType])

  // Retry last message
  const retry = useCallback(() => {
    setLastError(null)
    if (lastInput) send(lastInput)
  }, [lastInput, send])

  // Stop streaming
  const stop = () => {
    abortRef.current?.abort()
  }

  // Transform actions
  const handleAction = useCallback(async (action, content) => {
    const map = {
      simplify:   `Make this much simpler and easier to understand:\n\n${content}`,
      shorter:    `Give me the same answer but much shorter — key points only:\n\n${content}`,
      devotional: `Turn this into a warm, personal devotional for a church member:\n\n${content}`,
      sermon:     `Convert this into a clear sermon outline with main points:\n\n${content}`,
    }
    if (map[action]) await send(map[action])
  }, [send])

  // Enter to send (Shift+Enter for new line)
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const clearChat = () => {
    setMessages([])
    setLastError(null)
    setLastInput('')
  }

  return (
    <div className={`flex flex-col bg-white overflow-hidden ${className}`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#1E1B4B] to-[#7C3AED] flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight truncate">{assistantName}</p>
          <p className="text-white/55 text-[10px] leading-tight">AI Assistant · ChurchFlow Liberia</p>
        </div>
        <div className="flex items-center gap-1.5">
          {messages.length > 0 && (
            <button onClick={clearChat}
              title="Clear chat"
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          {onClose && (
            <button onClick={onClose}
              title="Close"
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white flex items-center justify-center transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Messages ── */}
      <div
        ref={messagesRef}
        className={`flex-1 overflow-y-auto overscroll-contain px-3.5 py-4 space-y-3.5 ${
          compact ? 'min-h-[200px]' : 'min-h-[300px]'
        }`}
      >
        {/* Welcome / prompt suggestions */}
        {isEmpty && !lastError && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center py-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-0.5">How can I help you?</p>
            <p className="text-xs text-slate-400 mb-4">Try one of these to get started</p>
            <div className="flex flex-col gap-1.5 w-full">
              {prompts.slice(0, 4).map(p => (
                <button key={p} onClick={() => send(p)}
                  className="text-left text-xs text-slate-600 bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border border-slate-100 hover:border-purple-200 px-3 py-2 rounded-xl transition-all duration-150">
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
            onAction={messages.length > 0 ? handleAction : null}
            isStreaming={streaming && msg.id === streamingId}
          />
        ))}

        {/* Typing dots (before first token) */}
        {typing && <TypingDots />}

        {/* Error panel */}
        {lastError && (
          <ErrorPanel
            error={lastError}
            onRetry={retry}
            lastInput={lastInput}
          />
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="border-t border-slate-100 px-3 pt-2.5 pb-3 flex-shrink-0 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={streaming ? 'AI is responding…' : placeholder}
            disabled={streaming}
            rows={1}
            className="flex-1 resize-none text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-400 disabled:opacity-50 overflow-hidden leading-snug"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />

          {streaming ? (
            <button onClick={stop}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors border border-red-100">
              <StopCircle className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={() => send()}
              disabled={!input.trim() || streaming}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white flex items-center justify-center disabled:opacity-35 hover:from-violet-700 hover:to-purple-800 transition-all shadow-sm shadow-purple-500/20 active:scale-95">
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-[10px] text-slate-300 mt-1.5 text-center leading-tight">
          Powered by Groq AI · For guidance only — consult your pastor for spiritual decisions
        </p>
      </div>
    </div>
  )
}
