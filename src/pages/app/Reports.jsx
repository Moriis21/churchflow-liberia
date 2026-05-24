// ============================================================
// ChurchFlow Liberia — Reports & Analytics Page
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  UserCheck,
  Calendar,
  Download,
  Filter,
  Loader2,
  BarChart2,
} from 'lucide-react'
import { Button, StatsCard, Badge } from '../../components/ui'
import { insforge } from '../../lib/insforge'
import { formatCurrency, formatDate } from '../../utils/helpers'

// ─── Palette ──────────────────────────────────────────────────
const C = {
  purple: '#8A19FF',
  gold: '#F59E0B',
  navy: '#151022',
  green: '#10B981',
  blue: '#3B82F6',
  rose: '#F43F5E',
  teal: '#14B8A6',
}

const TABS = [
  { key: 'overview',   label: 'Overview',   icon: TrendingUp },
  { key: 'membership', label: 'Membership', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: UserCheck },
  { key: 'finance',    label: 'Finance',    icon: DollarSign },
  { key: 'events',     label: 'Events',     icon: Calendar },
]

// ─── Custom tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 text-sm">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Empty Chart Placeholder ──────────────────────────────────
function EmptyChart({ height = 200 }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 border border-dashed border-slate-200"
      style={{ height }}
    >
      <BarChart2 className="w-8 h-8 text-slate-300" />
      <p className="text-sm text-slate-400 font-medium text-center">
        No data available yet.<br />Start adding records to see reports.
      </p>
    </div>
  )
}

// ─── Build chart data from raw DB rows ────────────────────────

// Group members by month of created_at
function buildMemberGrowth(members) {
  const byMonth = {}
  members.forEach((m) => {
    if (!m.created_at) return
    const key = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    if (!byMonth[key]) byMonth[key] = { month: key, total: 0, new: 0 }
    byMonth[key].new += 1
  })
  // cumulative total
  let running = 0
  return Object.values(byMonth).map((b) => {
    running += b.new
    return { month: b.month, members: running, new: b.new }
  })
}

// Build attendance trend from attendance records
function buildAttendanceTrend(attendance) {
  return attendance
    .filter((r) => r.service_type === 'Sunday Morning Service' || r.service_type?.toLowerCase().includes('sunday'))
    .slice(0, 12)
    .reverse()
    .map((r) => ({
      date: r.service_date
        ? new Date(r.service_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '—',
      present: r.present_count || 0,
      visitors: r.visitor_count || 0,
      rate: (r.present_count && r.absent_count != null)
        ? Math.round((r.present_count / (r.present_count + r.absent_count)) * 100)
        : 0,
    }))
}

// Group offerings/expenses by month
function buildGivingTrend(offerings) {
  const byMonth = {}
  offerings.forEach((o) => {
    if (!o.date || o.currency !== 'LRD') return
    const key = new Date(o.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })
    if (!byMonth[key]) byMonth[key] = { month: key, income: 0, expenses: 0 }
    if (o.category === 'expense') byMonth[key].expenses += o.amount || 0
    else byMonth[key].income += o.amount || 0
  })
  return Object.values(byMonth).slice(-7)
}

// Count members by membership_status
function buildStatusDonut(members) {
  const counts = {}
  members.forEach((m) => {
    const s = m.membership_status || 'active'
    counts[s] = (counts[s] || 0) + 1
  })
  const colorMap = { active: C.green, new: C.blue, inactive: '#94A3B8' }
  return Object.entries(counts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: colorMap[name] || C.purple,
  }))
}

// Group events by event_type
function buildEventsByType(events) {
  const byType = {}
  events.forEach((e) => {
    const t = e.event_type || e.type || 'Other'
    if (!byType[t]) byType[t] = { type: t, count: 0 }
    byType[t].count += 1
  })
  return Object.values(byType)
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ membersData, attendanceData, offeringsData, loading }) {
  const memberGrowth = useMemo(() => buildMemberGrowth(membersData), [membersData])
  const attendanceTrend = useMemo(() => buildAttendanceTrend(attendanceData), [attendanceData])
  const givingTrend = useMemo(() => buildGivingTrend(offeringsData), [offeringsData])

  const totalIncome = offeringsData
    .filter((o) => o.currency === 'LRD' && o.category !== 'expense')
    .reduce((s, o) => s + (o.amount || 0), 0)
  const avgAttendance = attendanceTrend.length > 0
    ? Math.round(attendanceTrend.reduce((s, r) => s + r.present, 0) / attendanceTrend.length)
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Members" value={membersData.length} icon={Users} color="purple" />
        <StatsCard title="Avg Attendance" value={avgAttendance || '—'} icon={UserCheck} color="gold" />
        <StatsCard title="Total Income (LRD)" value={totalIncome > 0 ? totalIncome.toLocaleString() : '0'} icon={DollarSign} color="green" />
        <StatsCard title="Services Tracked" value={attendanceData.length} icon={Calendar} color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Membership Growth */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Membership Growth</h3>
          <p className="text-xs text-slate-400 mb-4">Cumulative member count over time</p>
          {memberGrowth.length === 0 ? (
            <EmptyChart height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memberGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.purple} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="members" name="Members" stroke={C.purple} strokeWidth={2.5} fill="url(#memGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Attendance Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Recent Sunday services</p>
          {attendanceTrend.length === 0 ? (
            <EmptyChart height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={attendanceTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="present" name="Present" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4, fill: C.gold, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="visitors" name="Visitors" stroke={C.blue} strokeWidth={2} dot={{ r: 3, fill: C.blue, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Giving Trend */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Giving Trend</h3>
        <p className="text-xs text-slate-400 mb-4">Income vs Expenses (LRD)</p>
        {givingTrend.length === 0 ? (
          <EmptyChart height={220} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={givingTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.rose} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={C.rose} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="income" name="Income" stroke={C.green} strokeWidth={2.5} fill="url(#incomeGrad)" dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke={C.rose} strokeWidth={2} fill="url(#expGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: C.green }} />
                <span className="text-xs text-slate-500">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: C.rose }} />
                <span className="text-xs text-slate-500">Expenses</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Membership Tab ───────────────────────────────────────────
function MembershipTab({ membersData, loading }) {
  const memberGrowth = useMemo(() => buildMemberGrowth(membersData), [membersData])
  const statusDonut = useMemo(() => buildStatusDonut(membersData), [membersData])

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="secondary" icon={Download} size="sm">Export</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* New members per month */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">New Members per Month</h3>
          <p className="text-xs text-slate-400 mb-4">Based on member created date</p>
          {memberGrowth.length === 0 ? (
            <EmptyChart height={220} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={memberGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="new" name="New Members" fill={C.purple} radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Members by status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Members by Status</h3>
          <p className="text-xs text-slate-400 mb-4">Current snapshot</p>
          {statusDonut.length === 0 ? (
            <EmptyChart height={180} />
          ) : (
            <>
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusDonut}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusDonut.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, '']} contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {statusDonut.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-xs text-slate-600">{s.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Attendance Tab ────────────────────────────────────────────
function AttendanceTab({ attendanceData, loading }) {
  const attendanceTrend = useMemo(() => buildAttendanceTrend(attendanceData), [attendanceData])

  const avgRate = attendanceTrend.length > 0
    ? Math.round(attendanceTrend.reduce((s, r) => s + r.rate, 0) / attendanceTrend.length)
    : 0

  const highestAttendance = attendanceTrend.length > 0
    ? Math.max(...attendanceTrend.map((r) => r.present))
    : 0

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#151022] to-[#5B00B8] rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold opacity-70 mb-1">Avg Attendance Rate</p>
          <p className="text-3xl font-extrabold">{attendanceTrend.length > 0 ? `${avgRate}%` : '—'}</p>
          <p className="text-xs opacity-60 mt-1">Sunday services tracked</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">Highest Attendance</p>
          <p className="text-3xl font-extrabold text-slate-800">
            {highestAttendance > 0 ? highestAttendance : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Single service record</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Services Tracked</p>
          <p className="text-3xl font-extrabold text-slate-800">{attendanceData.length}</p>
          <p className="text-xs text-slate-400 mt-1">Across all service types</p>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Weekly Attendance</h3>
        <p className="text-xs text-slate-400 mb-4">Sunday morning services</p>
        {attendanceTrend.length === 0 ? (
          <EmptyChart height={220} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="present" name="Present" fill={C.purple} radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="visitors" name="Visitors" fill={C.gold} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* All service types */}
      {attendanceData.length > 0 && (() => {
        const byType = {}
        attendanceData.forEach((r) => {
          const t = r.service_type || 'Other'
          if (!byType[t]) byType[t] = { type: t, total: 0, count: 0 }
          byType[t].total += r.present_count || 0
          byType[t].count += 1
        })
        const rows = Object.values(byType).map((r) => ({ ...r, avg: Math.round(r.total / r.count) }))
        const maxAvg = Math.max(...rows.map((r) => r.avg), 1)

        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Service Type Comparison</h3>
            <div className="space-y-3">
              {rows.map((s) => (
                <div key={s.type} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-40 flex-shrink-0 truncate">{s.type}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                      style={{ width: `${Math.round((s.avg / maxAvg) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-800 w-20 text-right">avg {s.avg}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Finance Tab ──────────────────────────────────────────────
function FinanceTab({ offeringsData, loading }) {
  const givingTrend = useMemo(() => buildGivingTrend(offeringsData), [offeringsData])

  // Build monthly summary table from givingTrend
  const monthlySummary = givingTrend.map((row) => ({
    month: row.month,
    income: row.income,
    expenses: row.expenses,
    net: row.income - row.expenses,
  }))

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Button variant="secondary" icon={Download} size="sm">Export PDF</Button>
        <Button variant="secondary" icon={Download} size="sm">Export Excel</Button>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Income vs Expenses</h3>
        <p className="text-xs text-slate-400 mb-4">Monthly breakdown (LRD)</p>
        {givingTrend.length === 0 ? (
          <EmptyChart height={250} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={givingTrend} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="income" name="Income" fill={C.green} radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill={C.rose} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: C.green }} />
                <span className="text-xs text-slate-500">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: C.rose }} />
                <span className="text-xs text-slate-500">Expenses</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Monthly Totals Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Monthly Financial Summary</h3>
        </div>
        {monthlySummary.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-500">No financial records yet</p>
              <p className="text-xs text-slate-400">Add offerings to see financial summaries here.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Month</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Income</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Expenses</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthlySummary.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{row.month}</td>
                    <td className="px-6 py-4 text-right text-emerald-700 font-semibold">LRD {row.income.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-rose-600 font-semibold">LRD {row.expenses.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant={row.net >= 0 ? 'success' : 'danger'}>
                        LRD {row.net.toLocaleString()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Events Tab ────────────────────────────────────────────────
function EventsTab({ eventsData, loading }) {
  const eventsByType = useMemo(() => buildEventsByType(eventsData), [eventsData])

  if (loading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Events by type bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Events by Type</h3>
        <p className="text-xs text-slate-400 mb-4">All recorded events</p>
        {eventsByType.length === 0 ? (
          <EmptyChart height={220} />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={eventsByType} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="count" name="Events" fill={C.navy} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Events list summary */}
      {eventsData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Event Breakdown</h3>
          <div className="space-y-3">
            {eventsByType.map((e) => {
              const maxCount = Math.max(...eventsByType.map((x) => x.count), 1)
              return (
                <div key={e.type} className="flex items-center gap-4">
                  <span className="text-sm text-slate-600 w-36 flex-shrink-0 truncate">{e.type}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.round((e.count / maxCount) * 100)}%`,
                        background: `linear-gradient(90deg, ${C.purple}, ${C.gold})`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-800 w-10 text-right">{e.count}</span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-slate-400 mt-4">
            Bar width represents events as a proportion of the most common event type.
          </p>
        </div>
      )}

      {eventsData.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-slate-300" />
          </div>
          <p className="text-sm font-semibold text-slate-500">No events recorded yet</p>
          <p className="text-xs text-slate-400">Add events to see analytics and participation data here.</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [membersData, setMembersData] = useState([])
  const [attendanceData, setAttendanceData] = useState([])
  const [offeringsData, setOfferingsData] = useState([])
  const [eventsData, setEventsData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [mRes, aRes, oRes, eRes] = await Promise.all([
        insforge.database
          .from('members')
          .select('id, membership_status, created_at, department_id')
          .order('created_at'),
        insforge.database
          .from('attendance')
          .select('*')
          .order('service_date', { ascending: false })
          .limit(50),
        insforge.database
          .from('offerings')
          .select('*')
          .order('date', { ascending: false })
          .limit(100),
        insforge.database
          .from('events')
          .select('*')
          .order('event_date'),
      ])

      if (mRes.error) console.error('[Reports members]', mRes.error.message)
      if (aRes.error) console.error('[Reports attendance]', aRes.error.message)
      if (oRes.error) console.error('[Reports offerings]', oRes.error.message)
      if (eRes.error) console.error('[Reports events]', eRes.error.message)

      setMembersData(mRes.data || [])
      setAttendanceData(aRes.data || [])
      setOfferingsData(oRes.data || [])
      setEventsData(eRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Reports & Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Insights across membership, attendance, finance, and events</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                showFilters
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Date Range
            </button>
            <Button variant="primary" icon={FileText}>
              Generate Report
            </Button>
          </div>
        </div>

        {/* Date Range Filter */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-purple-400 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-purple-400 outline-none"
              />
            </div>
            {dateFrom && dateTo && (
              <span className="text-xs text-slate-400">
                Range: {formatDate(dateFrom)} – {formatDate(dateTo)}
              </span>
            )}
          </div>
        )}

        {/* Report Type Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm w-fit overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === key
                  ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <OverviewTab membersData={membersData} attendanceData={attendanceData} offeringsData={offeringsData} loading={loading} />
        )}
        {activeTab === 'membership' && (
          <MembershipTab membersData={membersData} loading={loading} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceTab attendanceData={attendanceData} loading={loading} />
        )}
        {activeTab === 'finance' && (
          <FinanceTab offeringsData={offeringsData} loading={loading} />
        )}
        {activeTab === 'events' && (
          <EventsTab eventsData={eventsData} loading={loading} />
        )}
      </div>
    </div>
  )
}
