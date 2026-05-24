import React, { useEffect, useRef } from 'react'

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}) => {
  const overlayRef = useRef(null)
  const panelRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose?.()
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={[
          'relative w-full bg-white rounded-2xl shadow-2xl',
          'flex flex-col max-h-[90vh]',
          'animate-[modalIn_0.2s_ease-out]',
          sizeClasses[size] || sizeClasses.md,
        ].join(' ')}
        style={{
          animation: 'modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Title bar */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-gradient-to-b from-[#151022] to-[#5B00B8]" />
              <h2
                id="modal-title"
                className="text-base font-semibold text-slate-800"
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Close modal"
            >
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Close button when no title */}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-300 z-10"
            aria-label="Close modal"
          >
            <svg
              className="w-4.5 h-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default Modal
