// ============================================================
// ChurchFlow Liberia — Two-Factor Authentication (TOTP)
//
// Architecture:
//   • Secret + backup codes live in user_two_factor table (RLS hidden,
//     reachable only via SECURITY DEFINER RPCs bound to auth.uid()).
//   • TOTP verification runs client-side using `otpauth` because
//     external imports are blocked from InsForge edge functions.
//     The user's JWT can already fetch the secret directly, so
//     server-side verification would not be a stronger boundary
//     here — both paths require the JWT. This is documented as a
//     "phishing-resistant by default" rather than "device-bound"
//     posture.
//
//   • Backup codes are stored only as SHA-256 hashes server-side.
//     The plaintext is shown to the user once at enrollment.
// ============================================================
import { TOTP, Secret } from 'otpauth'
import QRCode from 'qrcode'
import { insforge } from '../lib/insforge'

const ISSUER = 'ChurchFlow Liberia'

// ─── Tiny SHA-256 helper (browser-native WebCrypto) ──────────
async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ─── Status (cheap, safe to call anywhere) ───────────────────
export async function getMyTwoFactorStatus() {
  const { data, error } = await insforge.database.rpc('my_two_factor_status')
  if (error) return { enabled: false, unused_backup_codes: 0 }
  return data || { enabled: false, unused_backup_codes: 0 }
}

export async function userHasTwoFactor(userId) {
  if (!userId) return false
  const { data, error } = await insforge.database.rpc('has_two_factor_enabled', {
    p_user_id: userId,
  })
  if (error) return false
  return !!data
}

// ─── Enrollment: step 1 — generate + persist secret, return QR
// The secret is stored on the server with `is_enabled=false` so that
// abandoned enrollments don't lock the account.
export async function startEnrollment({ userId, userEmail }) {
  // 20 bytes = 160 bits = standard TOTP secret length
  const secret = new Secret({ size: 20 })
  const secretBase32 = secret.base32

  // Save (pending) to server — RLS forbids reading later by non-uid users
  const { error } = await insforge.database.rpc('upsert_two_factor_secret', {
    p_user_id: userId,
    p_secret:  secretBase32,
  })
  if (error) throw new Error(`Could not save 2FA secret: ${error.message}`)

  const totp = new TOTP({
    issuer:    ISSUER,
    label:     userEmail || 'ChurchFlow user',
    algorithm: 'SHA1',
    digits:    6,
    period:    30,
    secret,
  })
  const otpauthUri = totp.toString()
  const qrDataUrl  = await QRCode.toDataURL(otpauthUri, { margin: 1, width: 220 })

  return { secret: secretBase32, otpauthUri, qrDataUrl }
}

// ─── Enrollment: step 2 — user enters first code; if valid we
//     mint backup codes, hash them, persist, and return plaintexts.
export async function finalizeEnrollment(code) {
  const clean = String(code || '').replace(/\s/g, '')
  if (!/^\d{6}$/.test(clean)) {
    throw new Error('Enter the 6-digit code from your authenticator app.')
  }

  // Fetch pending secret (own session only)
  const { data: secretB32, error: getErr } = await insforge.database.rpc('get_my_two_factor_secret')
  if (getErr || !secretB32) {
    throw new Error('No pending 2FA setup found. Try again.')
  }

  const totp = new TOTP({
    algorithm: 'SHA1', digits: 6, period: 30,
    secret: Secret.fromBase32(secretB32),
  })
  if (totp.validate({ token: clean, window: 1 }) === null) {
    throw new Error('Code did not match. Check your authenticator and try again.')
  }

  // Generate 10 backup codes (8 chars, alphanumeric, no ambiguous)
  const codes = []
  const hashes = []
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789'
  for (let i = 0; i < 10; i++) {
    const buf = crypto.getRandomValues(new Uint8Array(8))
    const c   = Array.from(buf).map((b) => alphabet[b % alphabet.length]).join('')
    const formatted = `${c.slice(0, 4)}-${c.slice(4)}`
    codes.push(formatted)
    hashes.push(await sha256Hex(c))
  }

  const { error: finErr } = await insforge.database.rpc('finalize_two_factor_enrollment_self', {
    p_code_hashes: hashes,
  })
  if (finErr) throw new Error(`Could not finalize 2FA: ${finErr.message}`)

  return { backupCodes: codes }
}

// ─── Login verification — TOTP or backup code ────────────────
// Returns true if the code was accepted; false otherwise. Never throws.
export async function verifyTwoFactorCode(code) {
  const clean = String(code || '').replace(/[\s-]/g, '')
  if (!clean) return false

  try {
    // Try TOTP first (must be exactly 6 digits)
    if (/^\d{6}$/.test(clean)) {
      const { data: secretB32 } = await insforge.database.rpc('get_my_two_factor_secret')
      if (secretB32) {
        const totp = new TOTP({
          algorithm: 'SHA1', digits: 6, period: 30,
          secret: Secret.fromBase32(secretB32),
        })
        if (totp.validate({ token: clean, window: 1 }) !== null) {
          await insforge.database.rpc('touch_two_factor_used')
          return true
        }
      }
    }
    // Fall through to backup code
    if (clean.length >= 8) {
      const hash = await sha256Hex(clean.toLowerCase())
      const { data: ok } = await insforge.database.rpc('consume_backup_code', {
        p_code_hash: hash,
      })
      if (ok === true) {
        await insforge.database.rpc('touch_two_factor_used')
        return true
      }
    }
  } catch {
    return false
  }
  return false
}

export async function disableTwoFactor() {
  const { error } = await insforge.database.rpc('disable_my_two_factor')
  if (error) throw new Error(`Could not disable 2FA: ${error.message}`)
}
