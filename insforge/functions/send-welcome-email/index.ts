/**
 * ChurchFlow Liberia — Welcome Email Edge Function
 *
 * Server-side ONLY. Reads RESEND_API_KEY + FROM_EMAIL from env so the
 * Resend key is never shipped to the browser.
 *
 * POST /send-welcome-email
 * Body:
 *   {
 *     to:        string,          // user email (required)
 *     name?:     string,          // first / full name
 *     role?:     string,          // pastor | church_admin | treasurer | ...
 *     churchName?: string,        // optional
 *     loginUrl?: string,          // override CTA link
 *   }
 *
 * Returns:
 *   200 { ok: true,  id: '<resend-id>' }   // delivered to Resend
 *   200 { ok: false, error: '...' }        // email failed but caller
 *                                          //   should NOT break the flow
 *
 * Why 200 on failure: registration must succeed even if Resend is down.
 * Caller logs failures from the body instead of try/catch on HTTP status.
 */

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL     = Deno.env.get('FROM_EMAIL')     ?? 'ChurchFlow Liberia <noreply@churchflow-liberia.app>'
const LOGIN_URL      = Deno.env.get('CHURCHFLOW_LOGIN_URL') ?? 'https://churchflow-liberia.vercel.app/login'

const cors = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

function roleLabel(role?: string): string {
  switch ((role || '').toLowerCase()) {
    case 'pastor':       return 'Pastor'
    case 'church_admin': return 'Church Admin'
    case 'treasurer':    return 'Treasurer'
    case 'secretary':    return 'Secretary'
    case 'dept_leader':  return 'Department Leader'
    case 'member':       return 'Member'
    case 'super_admin':  return 'Super Admin'
    default:             return 'Team Member'
  }
}

function buildHtml(opts: { name?: string; role?: string; churchName?: string; loginUrl: string }): string {
  const greetingName = (opts.name || '').trim().split(/\s+/)[0] || 'Friend'
  const rLabel = roleLabel(opts.role)
  const churchLine = opts.churchName
    ? `<p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.6;">
         You're set up for <strong style="color:#151022;">${escapeHtml(opts.churchName)}</strong> as a <strong style="color:#8A19FF;">${rLabel}</strong>.
       </p>`
    : `<p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.6;">
         Your <strong style="color:#8A19FF;">${rLabel}</strong> account is ready.
       </p>`

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Welcome to ChurchFlow Liberia</title>
</head>
<body style="margin:0;padding:0;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#151022;">
  <span style="display:none;color:transparent;font-size:1px;line-height:1px;max-height:0;overflow:hidden;">Welcome to ChurchFlow Liberia — your account is ready.</span>
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#F7F8FA;padding:32px 16px;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(21,16,34,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#151022 0%,#5B00B8 55%,#8A19FF 100%);padding:36px 32px 28px;">
          <table cellspacing="0" cellpadding="0" border="0"><tr>
            <td style="vertical-align:middle;">
              <div style="display:inline-block;width:48px;height:48px;background:#ffffff;border-radius:14px;text-align:center;line-height:48px;font-weight:900;color:#8A19FF;font-size:20px;">CF</div>
            </td>
            <td style="vertical-align:middle;padding-left:14px;">
              <div style="color:#ffffff;font-weight:800;font-size:20px;line-height:1;">ChurchFlow</div>
              <div style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;margin-top:6px;">Liberia</div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 36px 28px;">
          <h1 style="margin:0 0 14px;color:#151022;font-size:24px;font-weight:800;line-height:1.25;">
            Welcome, ${escapeHtml(greetingName)} 🎉
          </h1>
          ${churchLine}
          <p style="margin:0 0 22px;color:#475569;font-size:15px;line-height:1.6;">
            ChurchFlow Liberia is the all-in-one platform for running your church — members, attendance, offerings, sermons, prayer requests, and more.
          </p>

          <p style="margin:24px 0 28px;text-align:left;">
            <a href="${escapeAttr(opts.loginUrl)}" style="display:inline-block;background:linear-gradient(135deg,#8A19FF 0%,#5B00B8 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 30px;border-radius:12px;box-shadow:0 6px 18px rgba(138,25,255,0.35);">
              Open ChurchFlow →
            </a>
          </p>

          <table cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#F7F8FA;border:1px solid #ECECF2;border-radius:12px;padding:18px;margin:0 0 22px;">
            <tr><td>
              <p style="margin:0 0 6px;color:#151022;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;">Login</p>
              <p style="margin:0;color:#5B00B8;font-size:14px;word-break:break-all;">
                <a href="${escapeAttr(opts.loginUrl)}" style="color:#5B00B8;text-decoration:none;font-weight:600;">${escapeHtml(opts.loginUrl)}</a>
              </p>
            </td></tr>
          </table>

          <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
            Need help? Reply to this email and we'll get back to you.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:22px 36px;background:#151022;text-align:center;">
          <p style="margin:0 0 6px;color:#ffffff;font-size:12px;font-weight:600;">
            ChurchFlow Liberia
          </p>
          <p style="margin:0;color:#a1a1aa;font-size:11px;">
            Brewerville City, Montserrado County
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
function escapeAttr(s: string): string { return escapeHtml(s) }

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST')    return json({ ok: false, error: 'Method not allowed' }, 405)

  if (!RESEND_API_KEY) {
    console.warn('[send-welcome-email] RESEND_API_KEY not configured')
    return json({ ok: false, error: 'Email service not configured (missing RESEND_API_KEY).' })
  }

  let body: {
    to?: string
    name?: string
    role?: string
    churchName?: string
    loginUrl?: string
  } = {}
  try { body = await req.json() } catch { return json({ ok: false, error: 'Invalid JSON body' }, 400) }

  const to = (body.to || '').trim().toLowerCase()
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return json({ ok: false, error: 'Valid `to` email is required' }, 400)
  }

  const loginUrl = body.loginUrl?.trim() || LOGIN_URL
  const html = buildHtml({
    name:       body.name,
    role:       body.role,
    churchName: body.churchName,
    loginUrl,
  })

  // ── Call Resend ─────────────────────────────────────────────
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [to],
        subject: 'Welcome to ChurchFlow Liberia',
        html,
      }),
    })

    const out = await res.json().catch(() => ({}))
    if (!res.ok) {
      console.warn('[send-welcome-email] Resend error:', res.status, out)
      return json({ ok: false, error: out?.message || `Resend HTTP ${res.status}` })
    }

    console.log('[send-welcome-email] sent', { to, id: out?.id })
    return json({ ok: true, id: out?.id })
  } catch (err) {
    console.error('[send-welcome-email] fetch threw:', err)
    return json({ ok: false, error: (err as Error)?.message || 'Unknown error' })
  }
}
