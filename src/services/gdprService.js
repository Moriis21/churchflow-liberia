// ============================================================
// ChurchFlow Liberia — GDPR data rights service
//
// • exportMyData()    → JSON object (caller saves to disk)
// • deleteMyAccount() → soft-deletes + scrubs PII
//
// Both call SECURITY DEFINER RPCs that pull auth.uid() from the
// session, so no IDs need to be passed from the client.
// ============================================================
import { insforge } from '../lib/insforge'

export async function exportMyData() {
  const { data, error } = await insforge.database.rpc('export_my_data')
  if (error) throw new Error(`Export failed: ${error.message}`)
  return data
}

// Trigger a download in the browser of the user's data as JSON
export async function downloadMyData() {
  const data = await exportMyData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `churchflow-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  return data
}

// Confirmation phrase must exactly match what the DB function expects
export const DELETE_CONFIRM_PHRASE = 'DELETE MY ACCOUNT'

export async function deleteMyAccount(confirmPhrase) {
  const { data, error } = await insforge.database.rpc('delete_my_account', {
    p_confirm: confirmPhrase,
  })
  if (error) throw new Error(`Deletion failed: ${error.message}`)
  return data
}
