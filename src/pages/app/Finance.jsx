// ============================================================
// ChurchFlow Liberia — Finance & Offerings Page
// ============================================================
import { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  Download,
  FileText,
  FileSpreadsheet,
  Receipt,
  Smartphone,
  Filter,
  Search,
  ChevronDown,
  BadgeDollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import { Button, StatsCard, Badge, Input, Modal, Avatar } from '../../components/ui'
import { OFFERINGS, EXPENSES, MEMBERS } from '../../data/dummyData'
import { formatCurrency, formatDate } from '../../utils/helpers'

// ─── Palette ─────────────────────────────────────────────────
const PURPLE = '#7C3AED'
const GOLD   = '#F59E0B'
const NAVY   = '#1E1B4B'
const GREEN  = '#10B981'
const BLUE   = '#3B82F6'
const ROSE   = '#F43F5E'
const TEAL   = '#14B8A6'
const ORANGE = '#F97316'

// ─── Offering type config ─────────────────────────────────────
const OFFERING_TYPE_CONFIG = {
  tithe:         { label: 'Tithe',          variant: 'purple', color: PURPLE },
  offering:      { label: 'Offering',       variant: 'info',   color: BLUE   },
  thanksgiving:  { label: 'Thanksgiving',   variant: 'gold',   color: GOLD   },
  building_fund: { label: 'Building Fund',  variant: 'success', color: GREEN  },
  donation:      { label: 'Donation',       variant: 'gray',   color: TEAL   },
}

// ─── Expense category config ──────────────────────────────────
const EXPENSE_CAT_CONFIG = {
  Utilities:     { variant: 'info',    color: BLUE   },
  Maintenance:   { variant: 'warning', variant2: 'warning', color: ORANGE },
  Outreach:      { variant: 'success', color: GREEN  },
  Salary:        { variant: 'purple',  color: PURPLE },
  Event:         { variant: 'gold',    color: GOLD   },
  'Building Fund': { variant: 'gray',  color: TEAL   },
}

// ─── Multi-currency helpers ───────────────────────────────────
const LRD_TO_USD = 192 // approximate (legacy helper kept for USD display)

const RATES_TO_LRD = { LRD: 1, USD: 194, EUR: 212, GBP: 248, NGN: 0.13 }

function toLocalCurrency(amount, currency) {
  return (amount * (RATES_TO_LRD[currency] || 1)).toFixed(2)
}

function toUSD(amount, currency) {
  if (currency === 'USD') return amount
  const lrd = amount * (RATES_TO_LRD[currency] || 1)
  return (lrd / LRD_TO_USD).toFixed(2)
}
function toLRD(amount, currency) {
  if (currency === 'LRD') return amount
  return Math.round(amount * (RATES_TO_LRD[currency] || 1))
}

// ─── Currency badge config ─────────────────────────────────────
const CURRENCY_BADGE = {
  LRD: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
  USD: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  EUR: { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'   },
  GBP: { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  NGN: { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
}

function CurrencyBadge({ currency }) {
  const cfg = CURRENCY_BADGE[currency] || CURRENCY_BADGE.LRD
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {currency}
    </span>
  )
}

// ─── Monthly summary data (last 6 months) ────────────────────
const MONTHLY_SUMMARY = [
  { month: 'Dec', Income: 87000, Expenses: 24000 },
  { month: 'Jan', Income: 92500, Expenses: 28500 },
  { month: 'Feb', Income: 78200, Expenses: 21000 },
  { month: 'Mar', Income: 104000, Expenses: 31000 },
  { month: 'Apr', Income: 118500, Expenses: 35000 },
  { month: 'May', Income: 125750, Expenses: 32400 },
]

// ─── Pie data from offerings ──────────────────────────────────
function buildOfferingPie() {
  const totals = {}
  OFFERINGS.forEach((o) => {
    const lrd = toLRD(o.amount, o.currency)
    totals[o.type] = (totals[o.type] || 0) + lrd
  })
  return Object.entries(totals).map(([type, value]) => ({
    name: OFFERING_TYPE_CONFIG[type]?.label || type,
    value,
    color: OFFERING_TYPE_CONFIG[type]?.color || NAVY,
  }))
}

// ─── Custom Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 text-sm">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-medium">
          {entry.name}:{' '}
          <span className="font-bold">{formatCurrency(entry.value, 'LRD')}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Add Transaction Modal ────────────────────────────────────
function AddTransactionModal({ isOpen, onClose }) {
  const [txTab, setTxTab]           = useState('Income')
  const [type, setType]             = useState('tithe')
  const [memberId, setMemberId]     = useState('')
  const [amount, setAmount]         = useState('')
  const [currency, setCurrency]     = useState('LRD')
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes]           = useState('')
  const [category, setCategory]     = useState('Utilities')
  const [description, setDescription] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [saving, setSaving]         = useState(false)

  const handleSave = () => {
    setSaving(true)
    if (txTab === 'Income') {
      // TODO: connect to InsForge: db.offerings().insert([{ type, memberId, amount: Number(amount), currency, date, notes }])
    } else {
      // TODO: connect to InsForge: db.expenses().insert([{ category, description, amount: Number(amount), currency: 'LRD', date, approvedBy }])
    }
    setTimeout(() => {
      setSaving(false)
      onClose()
    }, 800)
  }

  const reset = () => {
    setType('tithe'); setMemberId(''); setAmount(''); setCurrency('LRD')
    setDate(new Date().toISOString().split('T')[0]); setNotes('')
    setCategory('Utilities'); setDescription(''); setApprovedBy('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); reset() }}
      title="Add Transaction"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => { onClose(); reset() }}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            Save Transaction
          </Button>
        </div>
      }
    >
      {/* Income / Expense toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {['Income', 'Expense'].map((t) => (
          <button
            key={t}
            onClick={() => setTxTab(t)}
            className={[
              'flex-1 py-2 text-sm font-semibold rounded-lg transition-all',
              txTab === t
                ? t === 'Income'
                  ? 'bg-white shadow text-emerald-700'
                  : 'bg-white shadow text-rose-600'
                : 'text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t === 'Income' ? '+ Income' : '− Expense'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {txTab === 'Income' ? (
          <>
            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Offering Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
              >
                {Object.entries(OFFERING_TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Member */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Member</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
              >
                <option value="">— General Collection / Anonymous —</option>
                {MEMBERS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Amount + Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  icon={DollarSign}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
                >
                  <option value="LRD">LRD — Liberian Dollar</option>
                  <option value="USD">USD — US Dollar</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="NGN">NGN — Nigerian Naira</option>
                </select>
              </div>
            </div>

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
              />
            </div>
          </>
        ) : (
          <>
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
              >
                {Object.keys(EXPENSE_CAT_CONFIG).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Brief description of the expense…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
              />
            </div>

            {/* Amount */}
            <Input
              label="Amount (LRD)"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              icon={DollarSign}
            />

            <Input
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <Input
              label="Approved By"
              placeholder="e.g. Pastor John Doe"
              value={approvedBy}
              onChange={(e) => setApprovedBy(e.target.value)}
            />
          </>
        )}
      </div>
    </Modal>
  )
}

// ─── Income Tab ───────────────────────────────────────────────
function IncomeTab() {
  const [filterType, setFilterType]   = useState('all')
  const [search, setSearch]           = useState('')

  const filtered = useMemo(() =>
    OFFERINGS.filter((o) => {
      const matchType = filterType === 'all' || o.type === filterType
      const matchSearch =
        o.member.toLowerCase().includes(search.toLowerCase()) ||
        (o.notes || '').toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    }),
    [filterType, search]
  )

  const totalLRD = useMemo(
    () => filtered.reduce((s, o) => s + toLRD(o.amount, o.currency), 0),
    [filtered]
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by member or notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
          >
            <option value="all">All Types</option>
            {Object.entries(OFFERING_TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70">
              {['Date', 'Member', 'Type', 'Currency', 'Original Amount', 'LRD Equivalent', 'Notes', 'Receipt'].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400 text-sm">
                  No records match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const cfg = OFFERING_TYPE_CONFIG[o.type] || {}
                const lrdAmt = toLRD(o.amount, o.currency)
                return (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                      {formatDate(o.date)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={o.member} size="xs" />
                        <span className="text-slate-700 font-medium whitespace-nowrap">{o.member}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{
                          backgroundColor: cfg.color + '18',
                          color: cfg.color,
                          borderColor: cfg.color + '40',
                        }}
                      >
                        {cfg.label || o.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <CurrencyBadge currency={o.currency} />
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap">
                      {o.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(lrdAmt, 'LRD')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 max-w-[180px] truncate text-xs">
                      {o.notes || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button className="p-1.5 rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600 transition-colors" title="View receipt">
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {/* Total row */}
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-violet-50/60 border-t-2 border-violet-100">
                <td colSpan={5} className="px-4 py-3.5 text-sm font-bold text-violet-800">
                  Total (LRD equivalent) — {filtered.length} records
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-emerald-700 whitespace-nowrap">
                  {formatCurrency(totalLRD, 'LRD')}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// ─── Expenses Tab ─────────────────────────────────────────────
function ExpensesTab() {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const filtered = useMemo(
    () =>
      EXPENSES.filter((e) => {
        const matchCat = filterCat === 'all' || e.category === filterCat
        const matchSearch =
          e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.approvedBy.toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
      }),
    [search, filterCat]
  )

  const totalLRD = useMemo(
    () => filtered.reduce((s, e) => s + toLRD(e.amount, e.currency), 0),
    [filtered]
  )

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search description or approved by…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
          >
            <option value="all">All Categories</option>
            {Object.keys(EXPENSE_CAT_CONFIG).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/70">
              {['Date', 'Category', 'Description', 'Amount', 'Approved By'].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3.5"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400 text-sm">
                  No expense records match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const cfg = EXPENSE_CAT_CONFIG[e.category] || { color: NAVY }
                return (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 font-medium">
                      {formatDate(e.date)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                        style={{
                          backgroundColor: cfg.color + '18',
                          color: cfg.color,
                          borderColor: cfg.color + '40',
                        }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-[220px]">
                      {e.description}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-rose-600 whitespace-nowrap">
                      {formatCurrency(toLRD(e.amount, e.currency), 'LRD')}
                      {e.currency === 'USD' && (
                        <span className="ml-1 text-xs font-normal text-slate-400">
                          (USD {e.amount})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                      {e.approvedBy}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
          {/* Total row */}
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-rose-50/60 border-t-2 border-rose-100">
                <td colSpan={3} className="px-4 py-3.5 text-sm font-bold text-rose-700">
                  Total ({filtered.length} expenses)
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-rose-700 whitespace-nowrap">
                  {formatCurrency(totalLRD, 'LRD')}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  )
}

// ─── Reports Tab ──────────────────────────────────────────────
function ReportsTab() {
  const pieData = useMemo(buildOfferingPie, [])

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <FileText className="w-4 h-4 text-rose-500" />
          Download PDF
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Export Excel
        </button>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Monthly bar chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
          <h3 className="text-base font-bold text-slate-800 mb-1">Monthly Summary</h3>
          <p className="text-xs text-slate-400 mb-5">Income vs Expenses – last 6 months (LRD)</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={MONTHLY_SUMMARY}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8f5ff' }} />
              <Bar dataKey="Income"   name="Income"   fill={GREEN} radius={[5, 5, 0, 0]} maxBarSize={30} />
              <Bar dataKey="Expenses" name="Expenses" fill={ROSE}  radius={[5, 5, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-5 mt-3 justify-center">
            {[{ color: GREEN, label: 'Income' }, { color: ROSE, label: 'Expenses' }].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offering breakdown pie */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
          <h3 className="text-base font-bold text-slate-800 mb-1">Offering Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Percentage by type</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={82}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => [formatCurrency(v, 'LRD'), '']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-slate-500 flex-1 truncate">{item.name}</span>
                <span className="text-xs font-semibold text-slate-700">
                  {formatCurrency(item.value, 'LRD')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly breakdown table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">6-Month Financial Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70">
                {['Month', 'Income (LRD)', 'Expenses (LRD)', 'Net Balance', 'Margin'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MONTHLY_SUMMARY.map((row) => {
                const net = row.Income - row.Expenses
                const margin = ((net / row.Income) * 100).toFixed(0)
                return (
                  <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{row.month} 2026</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">
                      {formatCurrency(row.Income, 'LRD')}
                    </td>
                    <td className="px-5 py-3.5 text-rose-600 font-semibold">
                      {formatCurrency(row.Expenses, 'LRD')}
                    </td>
                    <td className="px-5 py-3.5 font-bold" style={{ color: net > 0 ? GREEN : ROSE }}>
                      {net > 0 ? '+' : ''}{formatCurrency(net, 'LRD')}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[80px]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            style={{ width: `${margin}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-emerald-600">{margin}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Main Finance Page ────────────────────────────────────────
export default function Finance() {
  const [activeTab, setActiveTab] = useState('Income')
  const [modalOpen, setModalOpen] = useState(false)

  const TABS = ['Income', 'Expenses', 'Reports']

  // ── Aggregate stats ────────────────────────────────────────
  const totalIncomeLRD = useMemo(
    () => OFFERINGS.reduce((s, o) => s + toLRD(o.amount, o.currency), 0),
    []
  )
  const totalExpenseLRD = useMemo(
    () => EXPENSES.reduce((s, e) => s + toLRD(e.amount, e.currency), 0),
    []
  )
  const netBalance = totalIncomeLRD - totalExpenseLRD

  // This month (May 2026)
  const thisMonthIncome = useMemo(
    () =>
      OFFERINGS.filter((o) => o.date.startsWith('2026-05')).reduce(
        (s, o) => s + toLRD(o.amount, o.currency),
        0
      ),
    []
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Finance &amp; Offerings
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track all income, expenses, and generate financial reports
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Exchange rate strip */}
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
              <span className="font-medium">Exchange Rates (approx):</span>
              <span>1 USD = 194 LRD</span>
              <span className="mx-1 text-slate-300">|</span>
              <span>1 EUR = 212 LRD</span>
              <span className="mx-1 text-slate-300">|</span>
              <span>1 GBP = 248 LRD</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" icon={Download} size="md">
                Export
              </Button>
              <Button variant="primary" icon={PlusCircle} onClick={() => setModalOpen(true)}>
                Add Transaction
              </Button>
            </div>
          </div>
        </div>

        {/* ── Stats Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatsCard
            title="Total Income"
            value={formatCurrency(totalIncomeLRD, 'LRD')}
            change="+LRD 14,250 this month"
            changeType="up"
            icon={ArrowUpRight}
            color="green"
          />
          <StatsCard
            title="Total Expenses"
            value={formatCurrency(totalExpenseLRD, 'LRD')}
            change="+LRD 3,200 this month"
            changeType="down"
            icon={ArrowDownRight}
            color="rose"
          />
          <StatsCard
            title="Net Balance"
            value={formatCurrency(netBalance, 'LRD')}
            change="Healthy surplus"
            changeType="up"
            icon={Wallet}
            color="purple"
          />
          <StatsCard
            title="This Month"
            value={formatCurrency(thisMonthIncome, 'LRD')}
            change="+18% vs April"
            changeType="up"
            icon={TrendingUp}
            color="gold"
          />
        </div>

        {/* ── Diaspora Giving Section ────────────────────── */}
        <div className="rounded-xl border border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50 p-4 flex items-start gap-3">
          <Globe className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Multi-Currency Giving Enabled</p>
            <p className="text-xs text-purple-600 mt-0.5">
              Accept offerings in LRD, USD, EUR, GBP, and NGN. Ideal for diaspora members sending from abroad.
              All amounts are displayed in their original currency and converted to LRD for reporting.
            </p>
          </div>
        </div>

        {/* ── Mobile Money Notice ────────────────────────── */}
        <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center mt-0.5">
            <Smartphone className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Mobile Money Integration Coming Soon</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Orange Money &amp; Lonestar MTN MoMo integration will allow members to give directly via mobile money — coming in a future update.
            </p>
          </div>
        </div>

        {/* ── Tabs + Content ─────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Tab bar */}
          <div className="flex items-center border-b border-slate-100 px-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={[
                  'px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-150 border-b-2 -mb-px',
                  activeTab === tab
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === 'Income'   && <IncomeTab />}
            {activeTab === 'Expenses' && <ExpensesTab />}
            {activeTab === 'Reports'  && <ReportsTab />}
          </div>
        </div>

      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
