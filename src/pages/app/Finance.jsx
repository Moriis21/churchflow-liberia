// ============================================================
// ChurchFlow Liberia — Finance & Offerings Page
// ============================================================
import { useState, useMemo, useEffect } from 'react'
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
import { formatCurrency, formatDate } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'

// ─── Palette ─────────────────────────────────────────────────
const PURPLE = '#8A19FF'
const GOLD   = '#F59E0B'
const NAVY   = '#151022'
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

// ─── Build monthly summary from real data ────────────────────
// Groups offerings (income) and expenses by month for the last 6 months
function buildMonthlySummary(offeringsList = [], expensesList = []) {
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const result = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = MONTHS[d.getMonth()]
    const income = offeringsList
      .filter(o => (o.date || o.created_at || '').startsWith(monthStr))
      .reduce((sum, o) => sum + toLRD(o.amount, o.currency || 'LRD'), 0)
    const expenses = expensesList
      .filter(e => (e.date || e.created_at || '').startsWith(monthStr))
      .reduce((sum, e) => sum + toLRD(e.amount, e.currency || 'LRD'), 0)
    result.push({ month: label, Income: Math.round(income), Expenses: Math.round(expenses) })
  }
  return result
}

// ─── Pie data from offerings ──────────────────────────────────
function buildOfferingPie(offeringsList = []) {
  const totals = {}
  offeringsList.forEach((o) => {
    const lrd = toLRD(o.amount, o.currency || 'LRD')
    totals[o.type] = (totals[o.type] || 0) + lrd
  })
  return Object.entries(totals).map(([type, value]) => ({
    name: OFFERING_TYPE_CONFIG[type]?.label || type,
    value,
    color: OFFERING_TYPE_CONFIG[type]?.color || NAVY,
  }))
}

// ─── Normalise offering row (DB snake_case → camelCase) ───────
function normOffering(o) {
  return {
    ...o,
    member: o.member || o.member_name || 'Anonymous',
    currency: o.currency || 'LRD',
  }
}

// ─── Normalise expense row ────────────────────────────────────
function normExpense(e) {
  return {
    ...e,
    description: e.description || '',
    approvedBy: e.approvedBy || e.approved_by || '—',
    currency: e.currency || 'LRD',
  }
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
function AddTransactionModal({ isOpen, onClose, onOfferingSaved, onExpenseSaved, members = [] }) {
  const { user } = useAuth()
  const [txTab, setTxTab]           = useState('Income')
  const [type, setType]             = useState('tithe')
  const [memberId, setMemberId]     = useState('')
  const [memberName, setMemberName] = useState('')
  const [amount, setAmount]         = useState('')
  const [currency, setCurrency]     = useState('LRD')
  const [date, setDate]             = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes]           = useState('')
  const [category, setCategory]     = useState('Utilities')
  const [description, setDescription] = useState('')
  const [approvedBy, setApprovedBy] = useState('')
  const [saving, setSaving]         = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const churchId = user?.churchId || user?.profile?.church_id
    try {
      if (txTab === 'Income') {
        const selectedMember = members.find((m) => m.id === memberId)
        const mName = selectedMember?.full_name || selectedMember?.name || memberName || 'Anonymous'
        const { data, error } = await insforge.database
          .from('offerings')
          .insert([{
            church_id: churchId,
            member_name: mName,
            type,
            amount: parseFloat(amount) || 0,
            currency,
            date,
            notes,
          }])
          .select()
          .single()
        if (error) throw error
        if (data && onOfferingSaved) onOfferingSaved(data)
      } else {
        const { data, error } = await insforge.database
          .from('expenses')
          .insert([{
            church_id: churchId,
            category,
            description,
            amount: parseFloat(amount) || 0,
            currency: 'LRD',
            date,
            approved_by: approvedBy,
          }])
          .select()
          .single()
        if (error) throw error
        if (data && onExpenseSaved) onExpenseSaved(data)
      }
    } catch (err) {
      console.error('Save transaction error:', err)
    } finally {
      setSaving(false)
      onClose()
    }
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
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.full_name || m.name}</option>
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
function IncomeTab({ offerings = [] }) {
  const [filterType, setFilterType]   = useState('all')
  const [search, setSearch]           = useState('')

  const normalisedOfferings = useMemo(() => offerings.map(normOffering), [offerings])

  const filtered = useMemo(() =>
    normalisedOfferings.filter((o) => {
      const matchType = filterType === 'all' || o.type === filterType
      const matchSearch =
        (o.member || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.notes || '').toLowerCase().includes(search.toLowerCase())
      return matchType && matchSearch
    }),
    [normalisedOfferings, filterType, search]
  )

  const totalLRD = useMemo(
    () => filtered.reduce((s, o) => s + toLRD(o.amount, o.currency || 'LRD'), 0),
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
                      {Number(o.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
function ExpensesTab({ expenses = [] }) {
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')

  const normalisedExpenses = useMemo(() => expenses.map(normExpense), [expenses])

  const filtered = useMemo(
    () =>
      normalisedExpenses.filter((e) => {
        const matchCat = filterCat === 'all' || e.category === filterCat
        const matchSearch =
          (e.description || '').toLowerCase().includes(search.toLowerCase()) ||
          (e.approvedBy || '').toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
      }),
    [normalisedExpenses, search, filterCat]
  )

  const totalLRD = useMemo(
    () => filtered.reduce((s, e) => s + toLRD(e.amount, e.currency || 'LRD'), 0),
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
function ReportsTab({ offerings = [] }) {
  const pieData = useMemo(() => buildOfferingPie(offerings), [offerings])

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
              data={buildMonthlySummary(offerings, expenses)}
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
              {buildMonthlySummary(offerings, expenses).map((row) => {
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
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Income')
  const [modalOpen, setModalOpen] = useState(false)
  const [offerings, setOfferings] = useState([])
  const [expenses, setExpenses]   = useState([])
  const [members, setMembers]     = useState([])

  // ── Load data from InsForge ────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [oRes, eRes, mRes] = await Promise.all([
          insforge.database.from('offerings').select('*').order('date', { ascending: false }),
          insforge.database.from('expenses').select('*').order('date', { ascending: false }),
          insforge.database.from('members').select('id, full_name').order('full_name', { ascending: true }),
        ])
        setOfferings(oRes.data || [])
        setExpenses(eRes.data || [])
        setMembers(mRes.data || [])
      } catch (err) {
        console.error('Finance load error:', err)
      }
    }
    load()
  }, [])

  const TABS = ['Income', 'Expenses', 'Reports']

  // ── Aggregate stats ────────────────────────────────────────
  const totalIncomeLRD = useMemo(
    () => offerings.reduce((s, o) => s + toLRD(o.amount, o.currency || 'LRD'), 0),
    [offerings]
  )
  const totalExpenseLRD = useMemo(
    () => expenses.reduce((s, e) => s + toLRD(e.amount, e.currency || 'LRD'), 0),
    [expenses]
  )
  const netBalance = totalIncomeLRD - totalExpenseLRD

  // This month
  const thisMonthIncome = useMemo(() => {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return offerings
      .filter((o) => (o.date || '').startsWith(prefix))
      .reduce((s, o) => s + toLRD(o.amount, o.currency || 'LRD'), 0)
  }, [offerings])

  return (
    <div className="min-h-screen">
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
            {activeTab === 'Income'   && <IncomeTab offerings={offerings} />}
            {activeTab === 'Expenses' && <ExpensesTab expenses={expenses} />}
            {activeTab === 'Reports'  && <ReportsTab offerings={offerings} />}
          </div>
        </div>

      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onOfferingSaved={(o) => setOfferings((prev) => [o, ...prev])}
        onExpenseSaved={(e) => setExpenses((prev) => [e, ...prev])}
        members={members}
      />
    </div>
  )
}
