// ============================================================
// ChurchFlow Liberia — Data Export Service
//
// Generates CSV (and printable HTML) exports of church data for
// admins. Zero external dependencies — uses the browser's native
// Blob + URL.createObjectURL.
// ============================================================
import { insforge } from '../lib/insforge'

// ─── CSV escape ──────────────────────────────────────────────
function csvCell(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCSV(rows, columns) {
  // columns: [{ key, label, format? }]
  const header = columns.map(c => csvCell(c.label)).join(',')
  const body   = rows.map(r =>
    columns.map(c => {
      const v = c.format ? c.format(r[c.key], r) : r[c.key]
      return csvCell(v)
    }).join(',')
  ).join('\n')
  return `${header}\n${body}`
}

function downloadFile(content, filename, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type: mime })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function timestamp() {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

// ─── Column definitions per table ────────────────────────────
const COLUMNS = {
  members: [
    { key: 'full_name',          label: 'Full Name' },
    { key: 'email',              label: 'Email' },
    { key: 'phone',              label: 'Phone' },
    { key: 'gender',             label: 'Gender' },
    { key: 'date_of_birth',      label: 'Date of Birth' },
    { key: 'address',            label: 'Address' },
    { key: 'membership_status',  label: 'Status' },
    { key: 'baptism_date',       label: 'Baptism Date' },
    { key: 'created_at',         label: 'Joined', format: v => v?.slice(0, 10) || '' },
  ],
  attendance: [
    { key: 'service_date',  label: 'Service Date', format: v => v?.slice(0, 10) || '' },
    { key: 'service_type',  label: 'Service Type' },
    { key: 'present_count', label: 'Present' },
    { key: 'absent_count',  label: 'Absent' },
    { key: 'visitor_count', label: 'Visitors' },
    { key: 'notes',         label: 'Notes' },
  ],
  offerings: [
    { key: 'date',          label: 'Date', format: v => v?.slice(0, 10) || '' },
    { key: 'type',          label: 'Type' },
    { key: 'amount',        label: 'Amount' },
    { key: 'currency',      label: 'Currency' },
    { key: 'service_type',  label: 'Service' },
    { key: 'notes',         label: 'Notes' },
  ],
  events: [
    { key: 'title',         label: 'Title' },
    { key: 'event_date',    label: 'Date', format: v => v?.slice(0, 10) || '' },
    { key: 'event_time',    label: 'Time' },
    { key: 'venue',         label: 'Venue' },
    { key: 'event_type',    label: 'Type' },
    { key: 'status',        label: 'Status' },
    { key: 'description',   label: 'Description' },
  ],
  prayer_requests: [
    { key: 'member_name',   label: 'From' },
    { key: 'request',       label: 'Request' },
    { key: 'visibility',    label: 'Visibility' },
    { key: 'status',        label: 'Status' },
    { key: 'submitted_at',  label: 'Submitted', format: v => v?.slice(0, 10) || '' },
  ],
}

// ─── Generic exporter ────────────────────────────────────────
export async function exportTableCSV(table, opts = {}) {
  const cols = COLUMNS[table]
  if (!cols) throw new Error(`No column definition for "${table}"`)

  const { data, error } = await insforge.database
    .from(table)
    .select('*')
    .limit(opts.limit || 5000)

  if (error) throw error
  const rows = data || []
  if (rows.length === 0) {
    return { count: 0 }
  }

  const csv = toCSV(rows, cols)
  const filename = `churchflow-${table}-${timestamp()}.csv`
  downloadFile(csv, filename)
  return { count: rows.length, filename }
}

// ─── Convenience wrappers ────────────────────────────────────
export const exportMembers     = (opts) => exportTableCSV('members', opts)
export const exportAttendance  = (opts) => exportTableCSV('attendance', opts)
export const exportOfferings   = (opts) => exportTableCSV('offerings', opts)
export const exportEvents      = (opts) => exportTableCSV('events', opts)
export const exportPrayers     = (opts) => exportTableCSV('prayer_requests', opts)

// ─── Full church backup — multi-table zip-like as one CSV bundle ──
// (Browser-only, no JSZip dependency: writes one combined .csv with
// a section header per table — simple but readable.)
export async function exportFullBackup() {
  const tables = ['members', 'attendance', 'offerings', 'events', 'prayer_requests']
  let combined = `# ChurchFlow Liberia — Full Data Backup\n# Generated: ${new Date().toISOString()}\n\n`
  let totalRows = 0

  for (const t of tables) {
    const cols = COLUMNS[t]
    const { data, error } = await insforge.database.from(t).select('*').limit(5000)
    if (error) {
      combined += `## ${t.toUpperCase()} — ERROR: ${error.message}\n\n`
      continue
    }
    const rows = data || []
    combined += `## ${t.toUpperCase()} (${rows.length} rows)\n`
    if (rows.length > 0) combined += toCSV(rows, cols) + '\n\n'
    else combined += '(no records)\n\n'
    totalRows += rows.length
  }

  const filename = `churchflow-backup-${timestamp()}.csv`
  downloadFile(combined, filename)
  return { count: totalRows, filename }
}

// ─── Printable HTML report (opens print dialog → save as PDF) ──
export function printSummaryReport(title, sections) {
  const win = window.open('', '_blank', 'width=900,height=1000')
  if (!win) return
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const html = `
  <!doctype html><html><head><meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #151022; font-size: 24px; margin: 0 0 4px; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 32px; }
    h2 { color: #8A19FF; font-size: 16px; margin: 32px 0 12px; padding-bottom: 6px; border-bottom: 2px solid #ede9fe; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 8px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #475569; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .stat { background: #f8fafc; border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; }
    .stat-value { font-size: 20px; font-weight: 800; color: #151022; }
    .stat-label { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; margin-top: 4px; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 0; } }
  </style></head><body>
    <h1>${title}</h1>
    <p class="subtitle">${today}</p>
    ${sections.map(s => `
      <h2>${s.title}</h2>
      ${s.stats ? `<div class="stat-grid">${s.stats.map(st => `
        <div class="stat"><div class="stat-value">${st.value}</div><div class="stat-label">${st.label}</div></div>
      `).join('')}</div>` : ''}
      ${s.table ? `<table>
        <thead><tr>${s.table.columns.map(c => `<th>${c}</th>`).join('')}</tr></thead>
        <tbody>${s.table.rows.map(r => `<tr>${r.map(c => `<td>${c ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>` : ''}
      ${s.text ? `<p>${s.text}</p>` : ''}
    `).join('')}
    <div class="footer">Generated by ChurchFlow Liberia &middot; ${new Date().toLocaleString()}</div>
    <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script>
  </body></html>`

  win.document.write(html)
  win.document.close()
}
