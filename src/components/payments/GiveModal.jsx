// ============================================================
// ChurchFlow Liberia — Give / Pay modal (Flutterwave)
// Mobile Money (MTN MoMo, Orange Money) + card, in the glass style.
// ============================================================
import { useState } from 'react'
import { X, Loader2, CheckCircle, HeartHandshake, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { startPayment, PAYMENTS_ENABLED } from '../../services/paymentService'

const PURPOSES = [
  { key: 'tithe',        label: 'Tithe' },
  { key: 'offering',     label: 'Offering' },
  { key: 'building_fund',label: 'Building Fund' },
  { key: 'donation',     label: 'Donation' },
]

export default function GiveModal({ open, onClose, churchId = null, userId = null, defaultName = '', defaultEmail = '' }) {
  const [amount, setAmount]     = useState('')
  const [currency, setCurrency] = useState('LRD')
  const [purpose, setPurpose]   = useState('offering')
  const [name, setName]         = useState(defaultName)
  const [phone, setPhone]       = useState('')
  const [busy, setBusy]         = useState(false)
  const [done, setDone]         = useState(false)

  if (!open) return null

  async function handleGive() {
    if (!amount || Number(amount) <= 0) { toast.error('Enter a valid amount.'); return }
    setBusy(true)
    try {
      const res = await startPayment({
        amount, currency, purpose, churchId, userId, note: '',
        customer: { name, email: defaultEmail, phone_number: phone },
        title: 'ChurchFlow Giving',
        description: `${purpose} (${currency} ${amount})`,
      })
      if (res.ok) { setDone(true); toast.success('Thank you! Your gift was received.') }
      else        { toast.error('Payment could not be verified. If money was deducted, contact your church.') }
    } catch (err) {
      if (err?.message !== 'Payment cancelled.') toast.error(err?.message || 'Payment failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose} role="dialog" aria-modal="true">
      <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-[#151022] to-[#5B00B8] text-white">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">Give to your church</h2>
              <p className="text-xs text-slate-500">Mobile Money or card, securely</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/60 text-slate-500"><X className="w-4 h-4" /></button>
        </div>

        {!PAYMENTS_ENABLED ? (
          <div className="text-center py-8">
            <AlertCircle className="w-9 h-9 text-amber-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Giving is not set up yet</p>
            <p className="text-xs text-slate-500 mt-1">Your administrator needs to connect a payment account.</p>
          </div>
        ) : done ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">Gift received</p>
            <p className="text-sm text-slate-500 mt-1">May God bless your generosity.</p>
            <button onClick={onClose} className="mt-5 px-5 py-2.5 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black">Done</button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Purpose */}
            <div className="flex flex-wrap gap-2">
              {PURPOSES.map((p) => (
                <button key={p.key} onClick={() => setPurpose(p.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    purpose === p.key ? 'bg-[#111111] text-white' : 'bg-white/70 text-slate-600 hover:bg-white'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>

            {/* Amount + currency */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount</label>
                <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/70 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              <div className="w-28">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Currency</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-white/70 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200">
                  <option value="LRD">LRD</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            {/* Name + phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Your name <span className="font-normal text-slate-400">(optional)</span></label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
                className="w-full px-4 py-2.5 rounded-xl border border-white/70 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone (Mobile Money) <span className="font-normal text-slate-400">(optional)</span></label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+231 ..."
                className="w-full px-4 py-2.5 rounded-xl border border-white/70 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>

            <button onClick={handleGive} disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#111111] text-white text-sm font-semibold hover:bg-black disabled:opacity-50 transition-colors">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <HeartHandshake className="w-4 h-4" />}
              {busy ? 'Processing…' : `Give ${currency} ${amount || ''}`.trim()}
            </button>
            <p className="text-[10px] text-slate-400 text-center">Secured by Flutterwave. ChurchFlow never sees your card or PIN.</p>
          </div>
        )}
      </div>
    </div>
  )
}
