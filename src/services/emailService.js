// ============================================================
// ChurchFlow Liberia — Email Service
//
// Wraps insforge.emails.send() with branded HTML templates for
// transactional emails:
//   • Welcome (after church setup)
//   • Event reminder
//   • Weekly digest (for pastors)
//   • Team invite
//
// Password reset is handled automatically by insforge.auth.
// All sends are best-effort — failures are logged but never throw
// (so the user flow is never blocked by a paid-plan email gate).
// ============================================================
import { insforge } from '../lib/insforge'

const FROM = 'ChurchFlow Liberia'
const REPLY_TO = 'morrisldorleyjr21@gmail.com'

// ─── Shared HTML wrapper ──────────────────────────────────────
function emailShell({ title, preheader, content }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <span style="display:none;color:transparent;font-size:1px;line-height:1px;max-height:0;overflow:hidden;">${preheader || ''}</span>
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(15,23,42,0.06);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#151022 0%,#8A19FF 100%);padding:32px 32px 24px;">
          <table cellspacing="0" cellpadding="0" border="0"><tr>
            <td style="vertical-align:middle;">
              <div style="display:inline-block;width:42px;height:42px;background:#ffffff;border-radius:12px;text-align:center;line-height:42px;font-weight:900;color:#8A19FF;font-size:18px;">CF</div>
            </td>
            <td style="vertical-align:middle;padding-left:14px;">
              <div style="color:#ffffff;font-weight:800;font-size:18px;line-height:1;">ChurchFlow</div>
              <div style="color:#F59E0B;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:4px;">Liberia</div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 36px 28px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 36px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0 0 6px;color:#64748b;font-size:12px;">
            ChurchFlow Liberia &middot; Brewerville City, Montserrado County
          </p>
          <p style="margin:0;color:#94a3b8;font-size:11px;">
            Questions? Reply to this email or write to <a href="mailto:${REPLY_TO}" style="color:#8A19FF;text-decoration:none;">${REPLY_TO}</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`
}

// ─── Reusable elements ────────────────────────────────────────
const button = (label, href) => `
  <a href="${href}" style="display:inline-block;background:linear-gradient(135deg,#8A19FF 0%,#5B00B8 100%);color:#ffffff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:10px;">
    ${label}
  </a>`

// ─── Core send wrapper ────────────────────────────────────────
async function safeSend(payload, kind) {
  try {
    const { data, error } = await insforge.emails.send(payload)
    if (error) {
      console.warn(`[email:${kind}] send failed:`, error.message || error)
      return { ok: false, error }
    }
    console.debug(`[email:${kind}] sent`, data?.id)
    return { ok: true, id: data?.id, skipped: data?.skipped || [] }
  } catch (err) {
    console.warn(`[email:${kind}] throw:`, err.message || err)
    return { ok: false, error: err }
  }
}

// ─── 1. Welcome email — goes through the server function ─────
//
// The Resend API key is NEVER shipped to the browser. We POST to an
// InsForge edge function (insforge/functions/send-welcome-email) which
// reads RESEND_API_KEY + FROM_EMAIL from env and calls Resend itself.
//
// Always resolves — failures are logged but never throw, so a Resend
// outage never breaks registration.
//
// Args: { to, userName, role?, churchName?, loginUrl? }
//
// ⚠ Disabled until a sending domain is verified in Resend. Until you
// own a domain and add DNS records, Resend will not deliver mail to
// anyone except the email on your own Resend account. To re-enable:
//   1. Verify a domain in Resend
//   2. `insforge secrets update FROM_EMAIL` to use that domain
//   3. Set VITE_EMAIL_ENABLED=true in your .env / Vercel env
export async function sendWelcomeEmail({ to, userName, role, churchName, loginUrl }) {
  if (!to) return { ok: false, error: 'missing-email' }
  if (import.meta.env.VITE_EMAIL_ENABLED !== 'true') {
    return { ok: false, skipped: true, error: 'email-disabled' }
  }

  const base = (import.meta.env.VITE_INSFORGE_URL || '').replace(/\/+$/, '')
  const apikey = import.meta.env.VITE_INSFORGE_ANON_KEY || ''
  const endpoint = `${base}/functions/v1/send-welcome-email`

  const payload = {
    to,
    name:       userName || '',
    role:       role || '',
    churchName: churchName || '',
    loginUrl:   loginUrl || 'https://churchflow-liberia.vercel.app/login',
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apikey ? { 'apikey': apikey, 'Authorization': `Bearer ${apikey}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok || body?.ok === false) {
      console.warn('[email:welcome] server function failed:', body?.error || `HTTP ${res.status}`)
      return { ok: false, error: body?.error || `HTTP ${res.status}` }
    }
    console.debug('[email:welcome] sent', body?.id)
    return { ok: true, id: body?.id }
  } catch (err) {
    console.warn('[email:welcome] fetch threw:', err?.message || err)
    return { ok: false, error: err?.message || String(err) }
  }
}

// ─── 2. Event reminder ────────────────────────────────────────
export function sendEventReminder({ to, memberName, eventTitle, eventDate, eventTime, venue }) {
  const html = emailShell({
    title: `Reminder: ${eventTitle}`,
    preheader: `${eventTitle} is coming up on ${eventDate}`,
    content: `
      <h1 style="margin:0 0 12px;color:#151022;font-size:22px;font-weight:800;">
        Reminder: ${eventTitle}
      </h1>
      <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.6;">
        Hi ${memberName || 'friend'}, just a friendly reminder about <strong>${eventTitle}</strong>.
      </p>
      <table cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;margin:0 0 22px;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px;font-weight:600;width:80px;">Date</td><td style="color:#0f172a;font-size:14px;font-weight:700;">${eventDate}</td></tr>
        ${eventTime ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;font-weight:600;">Time</td><td style="color:#0f172a;font-size:14px;font-weight:700;">${eventTime}</td></tr>` : ''}
        ${venue ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;font-weight:600;">Venue</td><td style="color:#0f172a;font-size:14px;font-weight:700;">${venue}</td></tr>` : ''}
      </table>
      <p style="margin:0 0 8px;color:#475569;font-size:14px;line-height:1.6;">
        We look forward to seeing you there. God bless!
      </p>`,
  })
  return safeSend({ to, from: FROM, replyTo: REPLY_TO, subject: `Reminder: ${eventTitle} — ${eventDate}`, html }, 'event_reminder')
}

// ─── 3. Weekly digest (for pastors / church admin) ────────────
export function sendWeeklyDigest({ to, churchName, stats }) {
  const {
    weekLabel = 'this week',
    attendance = 0,
    newMembers = 0,
    offerings = 'LRD 0',
    visitors = 0,
    prayerRequests = 0,
  } = stats || {}

  const html = emailShell({
    title: `${churchName} — Weekly Summary`,
    preheader: `Your ministry at a glance for ${weekLabel}`,
    content: `
      <h1 style="margin:0 0 6px;color:#151022;font-size:22px;font-weight:800;">
        ${churchName}
      </h1>
      <p style="margin:0 0 22px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;">
        Weekly summary &middot; ${weekLabel}
      </p>

      <table cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0 0 24px;">
        <tr>
          <td style="width:50%;padding:6px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
              <div style="color:#8A19FF;font-weight:800;font-size:28px;line-height:1;">${attendance}</div>
              <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:6px;letter-spacing:1px;">Sunday attendance</div>
            </div>
          </td>
          <td style="width:50%;padding:6px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
              <div style="color:#F59E0B;font-weight:800;font-size:28px;line-height:1;">${offerings}</div>
              <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:6px;letter-spacing:1px;">Offerings</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:6px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
              <div style="color:#10B981;font-weight:800;font-size:28px;line-height:1;">${newMembers}</div>
              <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:6px;letter-spacing:1px;">New members</div>
            </div>
          </td>
          <td style="padding:6px;">
            <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
              <div style="color:#3B82F6;font-weight:800;font-size:28px;line-height:1;">${visitors}</div>
              <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;margin-top:6px;letter-spacing:1px;">First-time visitors</div>
            </div>
          </td>
        </tr>
      </table>

      ${prayerRequests > 0 ? `
      <p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.6;">
        You have <strong>${prayerRequests}</strong> open prayer request${prayerRequests===1?'':'s'} waiting for follow-up.
      </p>` : ''}

      <p style="margin:0 0 22px;">${button('Open ChurchFlow', 'https://churchflow-liberia.vercel.app/app/dashboard')}</p>

      <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
        Tip: Use the AI assistant on your dashboard to draft this week's Sunday SMS or sermon outline in seconds.
      </p>`,
  })
  return safeSend({ to, from: FROM, replyTo: REPLY_TO, subject: `${churchName} — Weekly Summary`, html }, 'weekly_digest')
}

// ─── 4. Team invite ───────────────────────────────────────────
export function sendTeamInvite({ to, churchName, inviterName, role, joinUrl }) {
  const roleLabel = ({
    pastor:      'Pastor',
    treasurer:   'Treasurer',
    secretary:   'Secretary',
    dept_leader: 'Department Leader',
    church_admin:'Church Admin',
  })[role] || 'Team Member'

  const html = emailShell({
    title: `${inviterName} invited you to ${churchName} on ChurchFlow`,
    preheader: `Join as ${roleLabel}`,
    content: `
      <h1 style="margin:0 0 12px;color:#151022;font-size:22px;font-weight:800;">
        You're invited to join ${churchName}
      </h1>
      <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.6;">
        <strong>${inviterName}</strong> invited you to join <strong>${churchName}</strong> on ChurchFlow as a <strong>${roleLabel}</strong>.
      </p>
      <p style="margin:0 0 22px;color:#475569;font-size:14px;line-height:1.6;">
        ChurchFlow is the church management platform built specifically for Liberian churches — members, attendance, offerings, sermons, and live streams, all in one place.
      </p>
      <p style="margin:0 0 22px;">${button('Accept Invitation', joinUrl)}</p>
      <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
        If you weren't expecting this invitation, you can safely ignore this email.
      </p>`,
  })
  return safeSend({ to, from: FROM, replyTo: REPLY_TO, subject: `${inviterName} invited you to ${churchName}`, html }, 'team_invite')
}

// ─── 5. Generic notification ──────────────────────────────────
export function sendNotification({ to, subject, heading, body, ctaLabel, ctaUrl }) {
  const html = emailShell({
    title: subject,
    preheader: heading,
    content: `
      <h1 style="margin:0 0 12px;color:#151022;font-size:22px;font-weight:800;">${heading}</h1>
      <div style="margin:0 0 22px;color:#475569;font-size:15px;line-height:1.6;">${body}</div>
      ${ctaLabel && ctaUrl ? `<p style="margin:0 0 22px;">${button(ctaLabel, ctaUrl)}</p>` : ''}`,
  })
  return safeSend({ to, from: FROM, replyTo: REPLY_TO, subject, html }, 'notification')
}
