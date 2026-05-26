// ============================================================
// ChurchFlow Liberia — Top-level Error Boundary
// Catches uncaught JS errors in the component tree so a single
// bug doesn't crash the whole app for the user.
// ============================================================
import React from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Non-PII log for debugging — no user data
    console.error('[ErrorBoundary]', error?.message, info?.componentStack?.slice(0, 200))
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-lg font-extrabold text-slate-800 mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            An unexpected error occurred. Refreshing the page usually fixes this.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <RefreshCw className="w-4 h-4" /> Refresh page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 text-left text-xs bg-slate-100 rounded-xl p-4 text-red-700 overflow-auto max-h-40">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
