// ============================================================
// ChurchFlow Liberia — PWA Install Prompt
//
// Listens for beforeinstallprompt (Android/Chrome) and shows a
// friendly bottom-banner. For iOS Safari (no beforeinstallprompt
// support), shows a one-time instruction toast.
//
// Self-hides when:
//   • app is already running in standalone mode
//   • user previously dismissed (localStorage)
//   • user already installed (appinstalled event)
// ============================================================
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, X, Share, Plus } from 'lucide-react'

const DISMISS_KEY    = 'churchflow.pwa.dismissedAt'
const DISMISS_DAYS   = 14   // remind again after 2 weeks
const SHOW_DELAY_MS  = 4500 // give the page a moment to settle

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
}

function recentlyDismissed() {
  const at = parseInt(localStorage.getItem(DISMISS_KEY) || '0', 10)
  if (!at) return false
  return (Date.now() - at) < DISMISS_DAYS * 24 * 60 * 60 * 1000
}

export default function PWAInstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible,  setVisible]  = useState(false)
  const [ios,      setIos]      = useState(false)

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return

    // ── Android / Chrome path ──
    const onBefore = (e) => {
      e.preventDefault()
      setDeferred(e)
      // Show after a small delay so it doesn't block first paint
      setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    }
    window.addEventListener('beforeinstallprompt', onBefore)

    // ── iOS path (Safari never fires beforeinstallprompt) ──
    if (isIos()) {
      setIos(true)
      setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    }

    // Hide on successful install
    const onInstalled = () => { setVisible(false); setDeferred(null) }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBefore)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferred) return
    deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    }
    setDeferred(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:bottom-6 sm:max-w-sm z-[1050]"
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-purple-900/20 border border-slate-100 p-4 flex items-start gap-3">
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center shadow-md shadow-purple-500/30">
              <Download className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              {ios ? (
                <>
                  <p className="text-sm font-bold text-slate-800 leading-tight">Install ChurchFlow</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Tap <Share className="inline w-3.5 h-3.5 -mt-0.5 text-blue-500" /> then
                    <span className="inline-flex items-center gap-0.5 ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                      <Plus className="w-3 h-3" /> Add to Home Screen
                    </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-slate-800 leading-tight">Install ChurchFlow</p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Works offline. Faster loading. Right on your home screen.
                  </p>
                  <div className="mt-2.5 flex gap-2">
                    <button onClick={handleInstall}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[#151022] to-[#5B00B8] hover:from-[#5B00B8] hover:to-[#3D108A] shadow-sm shadow-purple-500/30 transition-all">
                      Install
                    </button>
                    <button onClick={handleDismiss}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                      Not now
                    </button>
                  </div>
                </>
              )}
            </div>
            <button onClick={handleDismiss}
              aria-label="Dismiss"
              className="flex-shrink-0 -mt-1 -mr-1 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
