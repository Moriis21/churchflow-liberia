// ============================================================
// ChurchFlow Liberia — Two-Factor Authentication Section
//
// Drops into any Settings page. Shows current 2FA status and lets
// the user enroll (QR code + first code confirmation), download
// backup codes, or disable.
// ============================================================
import React, { useEffect, useState } from 'react'
import {
  ShieldCheck, ShieldOff, KeyRound, Loader2, Copy, AlertCircle, CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import {
  getMyTwoFactorStatus, startEnrollment, finalizeEnrollment, disableTwoFactor,
} from '../../services/twoFactorService'

export default function TwoFactorSection() {
  const { user } = useAuth()

  const [status, setStatus]   = useState(null)
  const [loading, setLoading] = useState(true)

  // Enrollment flow state
  const [phase,       setPhase]       = useState('idle') // idle | qr | confirm | codes
  const [qrDataUrl,   setQrDataUrl]   = useState(null)
  const [secretB32,   setSecretB32]   = useState(null)
  const [confirmCode, setConfirmCode] = useState('')
  const [busy,        setBusy]        = useState(false)
  const [backupCodes, setBackupCodes] = useState([])

  async function refresh() {
    setLoading(true)
    setStatus(await getMyTwoFactorStatus())
    setLoading(false)
  }
  useEffect(() => { refresh() }, [])

  async function handleStartEnroll() {
    setBusy(true)
    try {
      const { qrDataUrl, secret } = await startEnrollment({
        userId:    user?.id,
        userEmail: user?.email,
      })
      setQrDataUrl(qrDataUrl)
      setSecretB32(secret)
      setConfirmCode('')
      setPhase('qr')
    } catch (err) {
      toast.error(err.message || 'Could not start 2FA setup.')
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirm() {
    setBusy(true)
    try {
      const { backupCodes } = await finalizeEnrollment(confirmCode)
      setBackupCodes(backupCodes)
      setPhase('codes')
      await refresh()
      toast.success('Two-factor authentication enabled.')
    } catch (err) {
      toast.error(err.message || 'Invalid code.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDisable() {
    if (!confirm('Disable two-factor authentication for your account?')) return
    setBusy(true)
    try {
      await disableTwoFactor()
      toast.success('Two-factor authentication disabled.')
      setPhase('idle')
      await refresh()
    } catch (err) {
      toast.error(err.message || 'Could not disable.')
    } finally {
      setBusy(false)
    }
  }

  async function copyCodes() {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'))
      toast.success('Backup codes copied.')
    } catch { toast.error('Could not copy.') }
  }

  function downloadCodes() {
    const blob = new Blob(
      [`ChurchFlow Liberia — 2FA Backup Codes\nGenerated: ${new Date().toISOString()}\nUser: ${user?.email || ''}\n\n${backupCodes.join('\n')}\n\nEach code works only once. Keep them safe.`],
      { type: 'text/plain' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'churchflow-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading 2FA status…
      </div>
    )
  }

  const enabled = status?.enabled

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          {enabled ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <ShieldOff className="w-4 h-4 text-slate-400" />}
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {enabled
            ? 'Your account is protected by an authenticator app. You\'ll be asked for a 6-digit code each time you sign in.'
            : 'Add a second step at sign-in using Google Authenticator, Authy, or any TOTP app.'}
        </p>
      </div>

      {/* ── Idle: show enable / disable button ────────────────── */}
      {phase === 'idle' && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-700">
              Status:{' '}
              <span className={enabled ? 'text-emerald-600' : 'text-slate-500'}>
                {enabled ? 'Enabled' : 'Not configured'}
              </span>
            </p>
            {enabled && (
              <p className="text-xs text-slate-400 mt-0.5">
                {status.unused_backup_codes} unused backup code{status.unused_backup_codes === 1 ? '' : 's'} remaining.
              </p>
            )}
          </div>
          {enabled ? (
            <button
              onClick={handleDisable}
              disabled={busy}
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleStartEnroll}
              disabled={busy}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {busy ? 'Setting up…' : 'Enable 2FA'}
            </button>
          )}
        </div>
      )}

      {/* ── QR + secret display ───────────────────────────────── */}
      {phase === 'qr' && (
        <div className="p-5 rounded-2xl bg-white border border-purple-100">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            1. Scan this QR code with your authenticator app
          </p>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="2FA QR" className="w-44 h-44 mx-auto rounded-xl border border-slate-100" />
          )}
          <p className="text-xs text-slate-400 mt-3 text-center">
            Can't scan? Enter this secret manually:
          </p>
          <div className="mt-2 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <code className="flex-1 text-xs font-mono text-slate-700 truncate">{secretB32}</code>
            <button
              onClick={() => navigator.clipboard.writeText(secretB32).then(() => toast.success('Copied.'))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-700 mb-2">
              2. Enter the 6-digit code from the app
            </p>
            <input
              type="text" inputMode="numeric" autoComplete="one-time-code"
              maxLength={6}
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-slate-200 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500"
              autoFocus
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              onClick={() => setPhase('idle')}
              disabled={busy}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={busy || confirmCode.length !== 6}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {busy ? 'Verifying…' : 'Verify & enable'}
            </button>
          </div>
        </div>
      )}

      {/* ── Backup codes one-time display ─────────────────────── */}
      {phase === 'codes' && backupCodes.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-amber-200">
          <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-amber-50 border border-amber-100">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Save these backup codes somewhere safe. Each works <strong>only once</strong> and can
              sign you in if you lose your authenticator app. <strong>You will not see them again.</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {backupCodes.map((c) => (
              <code key={c} className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700 text-center">
                {c}
              </code>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button onClick={copyCodes} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <button onClick={downloadCodes} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Download .txt
            </button>
            <button
              onClick={() => { setPhase('idle'); setBackupCodes([]) }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> I've saved them
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
