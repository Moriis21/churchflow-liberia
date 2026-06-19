/**
 * ChurchFlow Liberia — Flutterwave payment verification
 *
 * Server-side ONLY. Holds FLUTTERWAVE_SECRET_KEY. The browser never
 * sees the secret key. After the user completes the inline Flutterwave
 * checkout, the frontend calls this function with the transaction id;
 * we verify it directly against Flutterwave's API and record the result
 * in the payments table. A user therefore cannot fake a "successful"
 * payment — only a server-verified transaction is stored.
 *
 * POST /flutterwave-verify
 * Body: {
 *   transaction_id, tx_ref, expectedAmount, expectedCurrency,
 *   church_id?, user_id?, purpose?, payer_name?, payer_email?,
 *   payer_phone?, note?
 * }
 * Returns: { ok, status, message }
 */
const FLW_SECRET   = Deno.env.get('FLUTTERWAVE_SECRET_KEY') ?? ''
const INSFORGE_URL = Deno.env.get('INSFORGE_INTERNAL_URL') || Deno.env.get('INSFORGE_BASE_URL') || ''
const SERVICE_KEY  = Deno.env.get('API_KEY') || Deno.env.get('ANON_KEY') || ''

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST')    return json({ ok: false, error: 'Method not allowed' }, 405)
  if (!FLW_SECRET)              return json({ ok: false, error: 'Payments not configured on the server.' }, 500)

  let body: any
  try { body = await req.json() } catch { return json({ ok: false, error: 'Invalid JSON' }, 400) }

  const { transaction_id, tx_ref, expectedAmount, expectedCurrency } = body || {}
  if (!transaction_id || !tx_ref) return json({ ok: false, error: 'transaction_id and tx_ref are required' }, 400)

  // 1. Verify with Flutterwave
  let verify: any
  try {
    const res = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      headers: { 'Authorization': `Bearer ${FLW_SECRET}` },
    })
    verify = await res.json()
  } catch (err) {
    console.error('[flutterwave-verify] FLW error', err)
    return json({ ok: false, error: 'Could not reach payment provider.' }, 502)
  }

  const d = verify?.data
  const verified =
    verify?.status === 'success' &&
    d?.status === 'successful' &&
    d?.tx_ref === tx_ref &&
    (!expectedAmount || Number(d?.amount) >= Number(expectedAmount)) &&
    (!expectedCurrency || d?.currency === expectedCurrency)

  const finalStatus = verified ? 'successful' : 'failed'

  // 2. Record in DB via RPC (best-effort; never block the response)
  try {
    await fetch(`${INSFORGE_URL.replace(/\/$/, '')}/api/database/rpc/record_payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
      body: JSON.stringify({
        p_tx_ref: tx_ref,
        p_church_id: body.church_id ?? null,
        p_user_id: body.user_id ?? null,
        p_purpose: body.purpose ?? 'offering',
        p_amount: d?.amount ?? expectedAmount ?? 0,
        p_currency: d?.currency ?? expectedCurrency ?? 'LRD',
        p_status: finalStatus,
        p_flw_tx_id: String(transaction_id),
        p_payer_name: body.payer_name ?? d?.customer?.name ?? null,
        p_payer_email: body.payer_email ?? d?.customer?.email ?? null,
        p_payer_phone: body.payer_phone ?? d?.customer?.phone_number ?? null,
        p_note: body.note ?? null,
      }),
    })
  } catch (err) {
    console.warn('[flutterwave-verify] record_payment failed:', err)
  }

  return json({
    ok: verified,
    status: finalStatus,
    message: verified ? 'Payment verified.' : 'Payment could not be verified.',
  })
}
