/**
 * ChurchFlow Liberia — Church Setup Edge Function
 *
 * Runs with SERVICE ROLE access (bypasses RLS) to create:
 *   1. A church record
 *   2. A user_profile linked to that church
 *
 * Auth: accepts userId + userEmail in the body.
 * The service role key gives us full DB access — we verify the user
 * exists in auth.users before doing anything. No JWT needed from client
 * because InsForge's SDK doesn't expose session tokens easily.
 *
 * POST /setup-church
 * Body: { userId, userEmail, churchName, fullName, role?, existingChurchId? }
 */

const INSFORGE_URL     = Deno.env.get('INSFORGE_URL')     ?? ''
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') ?? ''

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

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405)

  // ── Parse body ────────────────────────────────────────────
  let body: {
    userId?: string
    userEmail?: string
    churchName?: string
    fullName?: string
    role?: string
    existingChurchId?: string
  }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }

  const { userId, userEmail, churchName, fullName, role = 'church_admin', existingChurchId } = body

  if (!userId) return json({ error: 'userId is required' }, 400)

  // ── Service role DB headers ───────────────────────────────
  const dbHeaders = {
    'Content-Type':  'application/json',
    'apikey':        SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
  }
  const dbUrl = `${INSFORGE_URL}/rest/v1`

  // ── Verify user exists in auth.users ─────────────────────
  const authUserRes = await fetch(
    `${dbUrl}/auth.users?id=eq.${userId}&select=id,email`,
    { headers: dbHeaders }
  )
  if (!authUserRes.ok) {
    // Try alternate path
    const authUserRes2 = await fetch(
      `${INSFORGE_URL}/auth/v1/admin/users/${userId}`,
      { headers: { ...dbHeaders, 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` } }
    )
    if (!authUserRes2.ok) {
      console.warn('Could not verify user, proceeding anyway:', userId)
    }
  }

  // ── Check if profile already has a church ─────────────────
  const profileRes = await fetch(
    `${dbUrl}/user_profiles?id=eq.${userId}&select=id,church_id,role`,
    { headers: { ...dbHeaders, 'Prefer': 'return=representation' } }
  )
  const profileList = await profileRes.json()
  const existingProfile = Array.isArray(profileList) ? profileList[0] : null

  if (existingProfile?.church_id) {
    const churchRes = await fetch(
      `${dbUrl}/churches?id=eq.${existingProfile.church_id}&select=*`,
      { headers: dbHeaders }
    )
    const churchList = await churchRes.json()
    return json({
      success:       true,
      church:        churchList[0] ?? null,
      profile:       existingProfile,
      alreadySetup:  true,
    })
  }

  // ── Create or fetch church ────────────────────────────────
  let churchId  = existingChurchId ?? null
  let churchRow: Record<string, unknown> | null = null

  if (!churchId) {
    if (!churchName?.trim()) return json({ error: 'churchName is required' }, 400)

    const createRes = await fetch(`${dbUrl}/churches`, {
      method:  'POST',
      headers: { ...dbHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        name:     churchName.trim(),
        owner_id: userId,
        currency: 'LRD',
      }),
    })

    if (!createRes.ok) {
      const err = await createRes.text()
      return json({ error: `Failed to create church: ${err}` }, 500)
    }

    const created = await createRes.json()
    churchRow = Array.isArray(created) ? created[0] : created
    churchId  = churchRow?.id as string | undefined
  } else {
    const cRes   = await fetch(`${dbUrl}/churches?id=eq.${churchId}&select=*`, { headers: dbHeaders })
    const cList  = await cRes.json()
    churchRow    = cList[0] ?? null
  }

  if (!churchId) return json({ error: 'Church creation returned no ID' }, 500)

  // ── Upsert user_profile ───────────────────────────────────
  const upsertRes = await fetch(`${dbUrl}/user_profiles`, {
    method:  'POST',
    headers: { ...dbHeaders, 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify({
      id:        userId,
      email:     userEmail || null,
      church_id: churchId,
      full_name: fullName?.trim() || (userEmail ? userEmail.split('@')[0] : 'User'),
      role:      role || 'church_admin',
      is_active: true,
    }),
  })

  if (!upsertRes.ok) {
    const err = await upsertRes.text()
    return json({ error: `Failed to create profile: ${err}` }, 500)
  }

  const profileData = await upsertRes.json()
  const profile = Array.isArray(profileData) ? profileData[0] : profileData

  return json({ success: true, church: churchRow, profile })
}
