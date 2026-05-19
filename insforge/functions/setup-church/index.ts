/**
 * ChurchFlow Liberia — Church Setup Edge Function
 *
 * Runs with SERVICE ROLE access (bypasses RLS) to create:
 *   1. A church record
 *   2. A user_profile linked to that church
 *
 * Called from the frontend after registration / email verification,
 * because direct DB inserts from the browser fail silently due to
 * InsForge's RLS not receiving the user JWT from browser requests.
 *
 * POST /setup-church
 * Headers: Authorization: Bearer <user_jwt>
 * Body: { churchName, fullName, role?, existingChurchId? }
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

  // ── 1. Extract user from Authorization header ─────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const userJwt    = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!userJwt) return json({ error: 'Missing authorization token' }, 401)

  // Verify the token by calling InsForge auth — gets real user object
  const userRes = await fetch(`${INSFORGE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${userJwt}`,
      apikey: SERVICE_ROLE_KEY,
    },
  })

  if (!userRes.ok) return json({ error: 'Invalid or expired token' }, 401)
  const authUser = await userRes.json()
  const userId   = authUser.id
  const userEmail = authUser.email ?? null

  if (!userId) return json({ error: 'Could not resolve user ID' }, 401)

  // ── 2. Parse request body ─────────────────────────────────
  let body: { churchName?: string; fullName?: string; role?: string; existingChurchId?: string }
  try { body = await req.json() } catch { return json({ error: 'Invalid JSON body' }, 400) }

  const { churchName, fullName, role = 'church_admin', existingChurchId } = body

  // ── 3. Service role DB client headers ────────────────────
  const dbHeaders = {
    'Content-Type':  'application/json',
    'apikey':        SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Prefer':        'return=representation',
  }

  const dbUrl = `${INSFORGE_URL}/rest/v1`

  // ── 4. Check if profile already exists ───────────────────
  const existingProfileRes = await fetch(
    `${dbUrl}/user_profiles?id=eq.${userId}&select=id,church_id,role`,
    { headers: dbHeaders }
  )
  const existingProfiles = await existingProfileRes.json()
  const existingProfile  = Array.isArray(existingProfiles) ? existingProfiles[0] : null

  if (existingProfile?.church_id) {
    // Already has church — return existing data
    const churchRes = await fetch(
      `${dbUrl}/churches?id=eq.${existingProfile.church_id}&select=*`,
      { headers: dbHeaders }
    )
    const churches = await churchRes.json()
    return json({ success: true, church: churches[0] ?? null, profile: existingProfile, alreadySetup: true })
  }

  // ── 5. Create or use church ───────────────────────────────
  let churchId = existingChurchId ?? null
  let churchRow: Record<string, unknown> | null = null

  if (!churchId) {
    if (!churchName?.trim()) return json({ error: 'churchName is required' }, 400)

    const createChurchRes = await fetch(`${dbUrl}/churches`, {
      method: 'POST',
      headers: { ...dbHeaders, 'Prefer': 'return=representation' },
      body: JSON.stringify({
        name:     churchName.trim(),
        owner_id: userId,
        currency: 'LRD',
      }),
    })

    if (!createChurchRes.ok) {
      const err = await createChurchRes.text()
      return json({ error: `Failed to create church: ${err}` }, 500)
    }

    const created = await createChurchRes.json()
    churchRow = Array.isArray(created) ? created[0] : created
    churchId  = churchRow?.id
  } else {
    // Fetch the existing church
    const cRes = await fetch(`${dbUrl}/churches?id=eq.${churchId}&select=*`, { headers: dbHeaders })
    const cList = await cRes.json()
    churchRow = cList[0] ?? null
  }

  if (!churchId) return json({ error: 'Church creation failed' }, 500)

  // ── 6. Create or update user_profile ─────────────────────
  const profilePayload = {
    id:        userId,
    email:     userEmail,
    church_id: churchId,
    full_name: fullName?.trim() || userEmail?.split('@')[0] || 'User',
    role:      role || 'church_admin',
    is_active: true,
  }

  const upsertProfileRes = await fetch(`${dbUrl}/user_profiles`, {
    method: 'POST',
    headers: { ...dbHeaders, 'Prefer': 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify(profilePayload),
  })

  if (!upsertProfileRes.ok) {
    const err = await upsertProfileRes.text()
    return json({ error: `Failed to create profile: ${err}` }, 500)
  }

  const profileData = await upsertProfileRes.json()
  const profile = Array.isArray(profileData) ? profileData[0] : profileData

  return json({ success: true, church: churchRow, profile })
}
