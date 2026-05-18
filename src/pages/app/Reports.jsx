// ============================================================
// ChurchFlow Liberia — Reports & Analytics Page
// ============================================================
import { useState } from 'react'
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
} from 'lucide-react'
import { Button, StatsCard, Badge } from '../../components/ui'
import { MEMBERS, ATTENDANCE_RECORDS, OFFERINGS, EXPENSES, DEPARTMENTS } from '../../data/dummyData'
import { formatCurrency, formatDate } from '../../utils/helpers'

// ─── Palette ──────────────────────────────────────────────────
const C = {
  purple: '#7C3AED',
  gold: '#F59E0B',
  navy: '#1E1B4B',
  green: '#10B981',
  blue: '#3B82F6',
  rose: '#F43F5E',
  teal: '#14B8A6',
}

// ─── Chart static data ────────────────────────────────────────
const MONTHLY_GROWTH = [
  { month: 'Jun', members: 212, new: 4 },
  { month: 'Jul', members: 218, new: 6 },
  { month: 'Aug', members: 221, new: 3 },
  { month: 'Sep', members: 226, new: 5 },
  { month: 'Oct', members: 229, new: 3 },
  { month: 'Nov', members: 233, new: 4 },
  { month: 'Dec', members: 237, new: 4 },
  { month: 'Jan', members: 239, new: 2 },
  { month: 'Feb', members: 241, new: 2 },
  { month: 'Mar', members: 243, new: 2 },
  { month: 'Apr', members: 245, new: 2 },
  { month: 'May', members: 248, new: 3 },
]

const ATTENDANCE_TREND = ATTENDANCE_RECORDS.filter(
  (r) => r.serviceType === 'Sunday Morning Service',
)
  .slice()
  .reverse()
  .map((r) => ({
    date: new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    present: r.presentCount,
    visitors: r.visitorCount,
    rate: Math.round((r.presentCount / (r.presentCount + r.absentCount)) * 100),
  }))

const GIVING_TREND = [
  { month: 'Nov', income: 98000, expenses: 62000 },
  { month: 'Dec', income: 145000, expenses: 78000 },
  { month: 'Jan', income: 112000, expenses: 55000 },
  { month: 'Feb', income: 88000, expenses: 49000 },
  { month: 'Mar', income: 103000, expenses: 58000 },
  { month: 'Apr', income: 131000, expenses: 72000 },
  { month: 'May', income: 125750, expenses: 80500 },
]

const DEPT_PIE = DEPARTMENTS.map((d) => ({
  name: d.name.replace(' Ministry', '').replace(' Team', ''),
  value: d.memberCount,
  color: d.color,
}))

const STATUS_DONUT = [
  { name: 'Active', value: MEMBERS.filter((m) => m.membershipStatus === 'active').length, color: C.green },
  { name: 'New', value: MEMBERS.filter((m) => m.membershipStatus === 'new').length, color: C.blue },
  { name: 'Inactive', value: MEMBERS.filter((m) => m.membershipStatus === 'inactive').length, color: '#94A3B8' },
]

const SERVICE_COMPARISON = [
  { type: 'Sunday Service', avg: 185 },
  { type: 'Bible Study', avg: 93 },
  { type: 'Night Vigil', avg: 134 },
  { type: 'Youth Service', avg: 72 },
]

const EVENTS_BY_TYPE = [
  { type: 'Special Service', count: 4, participation: 88 },
  { type: 'Youth Event', count: 2, participation: 72 },
  { type: 'Outreach', count: 3, participation: 65 },
  { type: 'Convention', count: 1, participation: 95 },
  { type: 'Prayer', count: 2, participation: 55 },
  { type: 'Retreat', count: 1, participation: 60 },
]

const MONTHLY_FINANCE = [
  { month: 'March 2026', income: 'LRD 103,000', expenses: 'LRD 58,000', net: 'LRD 45,000' },
  { month: 'April 2026', income: 'LRD 131,000', expenses: 'LRD 72,000', net: 'LRD 59,000' },
  { month: 'May 2026', income: 'LRD 125,750', expenses: 'LRD 80,500', net: 'LRD 45,250' },
]

const TABS = [
  { key: 'overview', label: 'Overview', icon: TrendingUp },
  { key: 'membership', label: 'Membership', icon: Users },
  { key: 'attendance', label: 'Attendance', icon: UserCheck },
  { key: 'finance', label: 'Finance', icon: DollarSign },
  { key: 'events', label: 'Events', icon: Calendar },
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

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab() {
  const totalIncome = OFFERINGS.reduce((s, o) => (o.currency === 'LRD' ? s + o.amount : s), 0)
  const totalExpenses = EXPENSES.reduce((s, e) => (e.currency === 'LRD' ? s + e.amount : s), 0)
  const avgAttendance = Math.round(
    ATTENDANCE_RECORDS.filter((r) => r.serviceType === 'Sunday Morning Service')
      .reduce((s, r) => s + r.presentCount, 0) /
      ATTENDANCE_RECORDS.filter((r) => r.serviceType === 'Sunday Morning Service').length
  )

  return (
    <div className="space-y-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total Members" value={248} change="+12 this month" changeType="up" icon={Users} color="purple" />
        <StatsCard title="Avg Attendance" value={avgAttendance} change="+8%" changeType="up" icon={UserCheck} color="gold" />
        <StatsCard title="Total Income (LRD)" value={totalIncome.toLocaleString()} change="+LRD 14,250" changeType="up" icon={DollarSign} color="green" />
        <StatsCard title="Departments" value={9} icon={Calendar} color="blue" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Membership Growth */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Membership Growth</h3>
          <p className="text-xs text-slate-400 mb-4">12-month trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_GROWTH} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.purple} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[200, 260]} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="members" name="Members" stroke={C.purple} strokeWidth={2.5} fill="url(#memGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Attendance Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Recent Sunday services</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ATTENDANCE_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="present" name="Present" stroke={C.gold} strokeWidth={2.5} dot={{ r: 4, fill: C.gold, strokeWidth: 0 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="visitors" name="Visitors" stroke={C.blue} strokeWidth={2} dot={{ r: 3, fill: C.blue, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Giving Trend */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Giving Trend</h3>
        <p className="text-xs text-slate-400 mb-4">Income vs Expenses — last 7 months (LRD)</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={GIVING_TREND} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
      </div>
    </div>
  )
}

// ─── Membership Tab ───────────────────────────────────────────
function MembershipTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button variant="secondary" icon={Download} size="sm">Export</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* New members per month */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-1">New Members per Month</h3>
          <p className="text-xs text-slate-400 mb-4">Last 12 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_GROWTH} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="new" name="New Members" fill={C.purple} radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Members by status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-1">Members by Status</h3>
          <p className="text-xs text-slate-400 mb-4">Current snapshot</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={STATUS_DONUT}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {STATUS_DONUT.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v, '']}
                  contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {STATUS_DONUT.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-slate-600">{s.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-800">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members by department */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Members by Department</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={DEPT_PIE} layout="vertical" margin={{ top: 0, right: 30, left: 90, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="value" name="Members" radius={[0, 6, 6, 0]} maxBarSize={18}>
              {DEPT_PIE.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Attendance Tab ────────────────────────────────────────────
function AttendanceTab() {
  const avgRate = Math.round(
    ATTENDANCE_RECORDS.filter((r) => r.serviceType === 'Sunday Morning Service')
      .reduce((s, r) => s + Math.round((r.presentCount / (r.presentCount + r.absentCount)) * 100), 0) /
      ATTENDANCE_RECORDS.filter((r) => r.serviceType === 'Sunday Morning Service').length
  )

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold opacity-70 mb-1">Avg Attendance Rate</p>
          <p className="text-3xl font-extrabold">{avgRate}%</p>
          <p className="text-xs opacity-60 mt-1">Sunday services, last 8 weeks</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">Highest Attendance</p>
          <p className="text-3xl font-extrabold text-slate-800">220</p>
          <p className="text-xs text-slate-400 mt-1">Easter Sunday – Apr 19, 2026</p>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-500 mb-1">Total Services Tracked</p>
          <p className="text-3xl font-extrabold text-slate-800">{ATTENDANCE_RECORDS.length}</p>
          <p className="text-xs text-slate-400 mt-1">Across all service types</p>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Weekly Attendance</h3>
        <p className="text-xs text-slate-400 mb-4">Sunday morning services</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ATTENDANCE_TREND} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="present" name="Present" fill={C.purple} radius={[6, 6, 0, 0]} maxBarSize={40} />
            <Bar dataKey="visitors" name="Visitors" fill={C.gold} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Service type comparison */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Service Type Comparison</h3>
        <div className="space-y-3">
          {SERVICE_COMPARISON.map((s) => {
            const pct = Math.round((s.avg / 248) * 100)
            return (
              <div key={s.type} className="flex items-center gap-4">
                <span className="text-sm text-slate-600 w-32 flex-shrink-0">{s.type}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-2.5 rounded-full bg-gradient-to-r from-violet-500 to-purple-600"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-slate-800 w-16 text-right">avg {s.avg}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Finance Tab ──────────────────────────────────────────────
function FinanceTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-3">
        <Button variant="secondary" icon={Download} size="sm">Export PDF</Button>
        <Button variant="secondary" icon={Download} size="sm">Export Excel</Button>
      </div>

      {/* Income vs Expenses Bar Chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Income vs Expenses</h3>
        <p className="text-xs text-slate-400 mb-4">Last 7 months (LRD)</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={GIVING_TREND} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
      </div>

      {/* Monthly Totals Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Monthly Financial Summary</h3>
        </div>
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
              {MONTHLY_FINANCE.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{row.month}</td>
                  <td className="px-6 py-4 text-right text-emerald-700 font-semibold">{row.income}</td>
                  <td className="px-6 py-4 text-right text-rose-600 font-semibold">{row.expenses}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="success">{row.net}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Events Tab ────────────────────────────────────────────────
function EventsTab() {
  return (
    <div className="space-y-6">
      {/* Events by type bar chart */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-1">Events by Type</h3>
        <p className="text-xs text-slate-400 mb-4">2025–2026 church year</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={EVENTS_BY_TYPE} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="type" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="count" name="Events" fill={C.navy} radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Participation rate */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Event Participation Rate</h3>
        <div className="space-y-4">
          {EVENTS_BY_TYPE.map((e) => (
            <div key={e.type} className="flex items-center gap-4">
              <span className="text-sm text-slate-600 w-32 flex-shrink-0">{e.type}</span>
              <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{
                    width: `${e.participation}%`,
                    background: `linear-gradient(90deg, ${C.purple}, ${C.gold})`,
                  }}
                />
              </div>
              <span className="text-sm font-bold text-slate-800 w-10 text-right">{e.participation}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Participation = attendees as % of total church membership.
        </p>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateFrom, setDateFrom] = useState('2026-01-01')
  const [dateTo, setDateTo] = useState('2026-05-18')
  const [showFilters, setShowFilters] = useState(false)

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
            <span className="text-xs text-slate-400">
              Range: {formatDate(dateFrom)} – {formatDate(dateTo)}
            </span>
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
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'membership' && <MembershipTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'finance' && <FinanceTab />}
        {activeTab === 'events' && <EventsTab />}
      </div>
    </div>
  )
}
