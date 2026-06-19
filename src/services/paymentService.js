// ============================================================
// ChurchFlow Liberia — Payments (Flutterwave: Mobile Money + cards)
//
// The PUBLIC key is safe in the browser (it is designed to be). The
// SECRET key lives only in the flutterwave-verify edge function, which
// confirms every transaction server-side before it is recorded — so a
// payment can never be faked from the client.
// ============================================================

const PUBLIC_KEY  = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || ''
const INSFORGE_URL = (import.meta.env.VITE_INSFORGE_URL || '').replace(/\/+$/, '')
const ANON_KEY     = import.meta.env.VITE_INSFORGE_ANON_KEY || ''

export const PAYMENTS_ENABLED = !!PUBLIC_KEY

function functionsBase() {
  try {
    const appkey = new URL(INSFORGE_URL).hostname.split('.')[0]
    return `https://${appkey}.functions.insforge.app`
  } catch { return '' }
}

// Load the Flutterwave inline script once.
let scriptPromise = null
function loadFlutterwave() {
  if (window.FlutterwaveCheckout) return Promise.resolve()
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://checkout.flutterwave.com/v3.js'
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Could not load the payment library.'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

function makeTxRef() {
  return `CF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Open the Flutterwave checkout and resolve once the payment is
 * verified server-side.
 *
 * @returns {Promise<{ok:boolean, status:string, tx_ref:string}>}
 */
export async function startPayment({
  amount,
  currency = 'LRD',
  purpose = 'offering',
  customer = {},          // { name, email, phone_number }
  churchId = null,
  userId = null,
  note = '',
  title = 'ChurchFlow Giving',
  description = '',
}) {
  if (!PAYMENTS_ENABLED) {
    throw new Error('Payments are not set up yet. Please contact your administrator.')
  }
  if (!amount || Number(amount) <= 0) throw new Error('Enter a valid amount.')

  await loadFlutterwave()
  const tx_ref = makeTxRef()

  return new Promise((resolve, reject) => {
    window.FlutterwaveCheckout({
      public_key: PUBLIC_KEY,
      tx_ref,
      amount: Number(amount),
      currency,
      payment_options: 'mobilemoneyghana,mobilemoney,card,banktransfer',
      customer: {
        email: customer.email || 'giving@churchflow.lr',
        name:  customer.name  || 'Church Member',
        phone_number: customer.phone_number || '',
      },
      customizations: {
        title,
        description: description || `${purpose} payment`,
        logo: `${window.location.origin}/logo.png`,
      },
      callback: async (data) => {
        try {
          const res = await fetch(`${functionsBase()}/flutterwave-verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(ANON_KEY ? { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } : {}),
            },
            body: JSON.stringify({
              transaction_id: data.transaction_id,
              tx_ref,
              expectedAmount: Number(amount),
              expectedCurrency: currency,
              church_id: churchId,
              user_id: userId,
              purpose,
              payer_name: customer.name,
              payer_email: customer.email,
              payer_phone: customer.phone_number,
              note,
            }),
          })
          const out = await res.json().catch(() => ({}))
          resolve({ ok: !!out.ok, status: out.status || 'failed', tx_ref })
        } catch (err) {
          resolve({ ok: false, status: 'failed', tx_ref, error: err?.message })
        }
      },
      onclose: () => {
        // User closed the modal without finishing — treat as cancelled.
        reject(new Error('Payment cancelled.'))
      },
    })
  })
}
