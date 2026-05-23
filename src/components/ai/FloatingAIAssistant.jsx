// ============================================================
// ChurchFlow Liberia — Floating AI Assistant
//
// Desktop: fixed bottom-right panel, 400px wide
// Mobile:  full-width bottom sheet, 90dvh
//
// Features:
//  • Click outside → close
//  • Backdrop tap (mobile) → close
//  • Escape key → close
//  • Body scroll lock on mobile while open
//  • AnimatePresence entrance/exit
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MessageCircle, X, ExternalLink, ChevronDown } from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import { GROQ_MODELS } from '../../services/ai/groqClient'
import { useAIFeature } from '../../hooks/useAIFeature'

export default function FloatingAIAssistant() {
  const [open,    setOpen]    = useState(false)
  const [pulse,   setPulse]   = useState(true)
  const [mobile,  setMobile]  = useState(() => window.innerWidth < 768)

  const panelRef   = useRef(null)
  const triggerRef = useRef(null)

  const { enabled } = useAIFeature('landing_assistant')

  // ── Detect mobile ─────────────────────────────────────────
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // ── Body scroll lock on mobile ────────────────────────────
  useEffect(() => {
    if (open && mobile) {
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'none'
    } else {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.touchAction = ''
    }
  }, [open, mobile])

  // ── Click outside + Escape to close ──────────────────────
  useEffect(() => {
    if (!open) return

    const handlePointer = (e) => {
      // Don't close if clicking inside the panel or the trigger button
      if (
        panelRef.current?.contains(e.target) ||
        triggerRef.current?.contains(e.target)
      ) return
      setOpen(false)
    }

    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }

    // Slight delay so the open click doesn't immediately trigger close
    const timer = setTimeout(() => {
      document.addEventListener('mousedown',  handlePointer)
      document.addEventListener('touchstart', handlePointer, { passive: true })
      document.addEventListener('keydown',    handleKey)
    }, 50)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown',  handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown',    handleKey)
    }
  }, [open])

  const handleOpen = useCallback(() => {
    setOpen(true)
    setPulse(false)
  }, [])

  const handleClose = useCallback(() => setOpen(false), [])

  // Allow any page to open the chat via a global event
  useEffect(() => {
    const onOpen = () => handleOpen()
    window.addEventListener('churchflow:open-ai-chat', onOpen)
    return () => window.removeEventListener('churchflow:open-ai-chat', onOpen)
  }, [handleOpen])

  if (!enabled) return null

  return (
    <>
      {/* ── Mobile backdrop ── */}
      <AnimatePresence>
        {open && mobile && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-[2px]"
            onMouseDown={handleClose}
            onTouchStart={handleClose}
          />
        )}
      </AnimatePresence>

      {/* ── Floating trigger button ── */}
      <div className="fixed bottom-6 right-5 z-[1000]">
        <AnimatePresence>
          {!open && (
            <motion.button
              ref={triggerRef}
              key="fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{   scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleOpen}
              aria-label="Open AI Assistant"
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-purple-900/40 flex items-center justify-center hover:from-violet-500 hover:to-purple-600 transition-colors group"
            >
              {pulse && (
                <span className="absolute inset-0 rounded-2xl bg-purple-400/50 animate-ping pointer-events-none" />
              )}
              <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />

              {/* Desktop tooltip */}
              <span className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 bg-[#1E1B4B] text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Ask ChurchFlow Guide ✨
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Chat panel ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              ref={panelRef}
              key="panel"
              // Desktop: slide up from bottom-right
              // Mobile: slide up full-width from bottom
              initial={mobile
                ? { y: '100%', opacity: 1 }
                : { opacity: 0, y: 20, scale: 0.95 }
              }
              animate={mobile
                ? { y: 0, opacity: 1 }
                : { opacity: 1, y: 0,  scale: 1   }
              }
              exit={mobile
                ? { y: '100%', opacity: 1 }
                : { opacity: 0, y: 20, scale: 0.95 }
              }
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              className={
                mobile
                  // ── Mobile: full-width bottom sheet ──
                  ? 'fixed inset-x-0 bottom-0 z-[999] w-full flex flex-col rounded-t-3xl overflow-hidden shadow-2xl shadow-black/40'
                  // ── Desktop: fixed-size panel ──
                  : 'absolute bottom-16 right-0 w-[380px] sm:w-[420px] max-h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/25'
              }
              style={mobile ? { height: '90dvh' } : {}}
            >
              {/* Mobile drag handle */}
              {mobile && (
                <div className="flex justify-center pt-3 pb-1 bg-white cursor-pointer" onClick={handleClose}>
                  <div className="w-10 h-1 rounded-full bg-slate-300" />
                </div>
              )}

              {/* Chat panel — fills remaining space */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <AIChatPanel
                  assistantType="landing"
                  assistantName="ChurchFlow Guide"
                  placeholder="Ask anything about ChurchFlow…"
                  model={GROQ_MODELS.FAST}
                  maxTokens={600}
                  compact={!mobile}
                  onClose={handleClose}
                  className="h-full rounded-none border-0 shadow-none"
                />
              </div>

              {/* Quick links footer */}
              <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between gap-2 flex-shrink-0">
                <a href="/contact"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-purple-600 transition-colors">
                  <MessageCircle className="w-3 h-3" /> Support
                </a>
                <a href="/docs"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-purple-600 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Docs
                </a>
                <a href="/register"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                  Get started →
                </a>
                <button onClick={handleClose}
                  className="ml-auto w-7 h-7 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
                  aria-label="Close">
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
