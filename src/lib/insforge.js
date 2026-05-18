import { createClient } from '@insforge/sdk'

// TODO: Replace with your InsForge credentials
// 1. Get URL from .insforge/project.json → oss_host field
// 2. Get ANON_KEY: npx @insforge/cli secrets get ANON_KEY
// Then add to .env:
//   VITE_INSFORGE_URL=https://your-project.insforge.app
//   VITE_INSFORGE_ANON_KEY=your-anon-key

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL || 'https://your-project.insforge.app',
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || 'your-anon-key',
})

// ─── Auth ──────────────────────────────────────────────────────
export const auth = insforge.auth

// ─── Database table helpers (church_id enforced via RLS) ───────
export const db = {
  members:        () => insforge.database.from('members'),
  attendance:     () => insforge.database.from('attendance'),
  offerings:      () => insforge.database.from('offerings'),
  expenses:       () => insforge.database.from('expenses'),
  events:         () => insforge.database.from('events'),
  visitors:       () => insforge.database.from('visitors'),
  prayerRequests: () => insforge.database.from('prayer_requests'),
  departments:    () => insforge.database.from('departments'),
  sermons:        () => insforge.database.from('sermons'),
  branches:       () => insforge.database.from('branches'),
  settings:       () => insforge.database.from('settings'),
  smsLogs:        () => insforge.database.from('sms_logs'),
  notifications:  () => insforge.database.from('notifications'),
  churches:       () => insforge.database.from('churches'),
  users:          () => insforge.database.from('users'),
}

// ─── Storage helper ────────────────────────────────────────────
export const storage = insforge.storage
