// ============================================================
// ChurchFlow Liberia — Floating AI Assistant
// Appears on the landing page, pricing page, contact page.
// Floating chat bubble that opens a chat panel.
// ============================================================
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, X, MessageCircle, ExternalLink } from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import { GROQ_MODELS } from '../../services/ai/groqClient'

export default function FloatingAIAssistant() {
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState(true)

  const handleOpen = () => {
    setOpen(true)
    setPulse(false)
  }

  return (
    <>
      {/* ── Floating button ── */}
      <div className="fixed bottom-6 right-5 z-[999]">
        <AnimatePresence>
          {!open && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleOpen}
              className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 shadow-xl shadow-purple-900/40 flex items-center justify-center hover:from-violet-500 hover:to-purple-600 transition-colors group"
              aria-label="Open AI Assistant"
            >
              {/* Pulse ring */}
              {pulse && (
                <span className="absolute inset-0 rounded-2xl bg-purple-500/40 animate-ping" />
              )}
              <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />

              {/* Tooltip */}
              <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-[#1E1B4B] text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Ask ChurchFlow Guide ✨
              </span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── Chat panel ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1,   y: 0  }}
              exit={{   opacity: 0, scale: 0.9, y: 20  }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              className="w-[340px] sm:w-[380px] shadow-2xl shadow-purple-900/25"
            >
              <div className="relative">
                {/* Close button */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 z-10 w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <AIChatPanel
                  assistantType="landing"
                  assistantName="ChurchFlow Guide"
                  placeholder="Ask anything about ChurchFlow…"
                  model={GROQ_MODELS.FAST}
                  maxTokens={512}
                  compact
                  className="rounded-2xl"
                />

                {/* Footer quick links */}
                <div className="bg-slate-50 border border-slate-100 rounded-b-2xl border-t-0 px-4 py-2.5 flex items-center justify-between gap-2 -mt-px">
                  <a href="/contact"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-purple-600 transition-colors">
                    <MessageCircle className="w-3 h-3" /> Talk to support
                  </a>
                  <a href="/docs"
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-purple-600 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Documentation
                  </a>
                  <a href="/register"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors">
                    Get started →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
