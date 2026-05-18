// ============================================================
// ChurchFlow Liberia — Main App Dashboard
// ============================================================
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserCheck,
  DollarSign,
  UserPlus,
  Calendar,
  MessageSquare,
  FileText,
  Bell,
  PlusCircle,
  BookOpen,
  TrendingUp,
  Clock,
  Heart,
  Music,
  Megaphone,
  Video,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
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
} from 'recharts'

import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { StatsCard, Card, Badge, Avatar } from '../../components/ui'
import {
  STATS,
  MEMBERS,
  EVENTS,
  PRAYER_REQUESTS,
  ATTENDANCE_RECORDS,
  OFFERINGS,
} from '../../data/dummyData'
import { formatCurrency, formatDate, getGreeting } from '../../utils/helpers'

// ─── Palette ─────────────────────────────────────────────────
const CHART_COLORS = {
  purple: '#7C3AED',
  gold: '#F59E0B',
  navy: '#1E1B4B',
  green: '#10B981',
  blue: '#3B82F6',
  rose: '#F43F5E',
}

// ─── Attendance area-chart data ───────────────────────────────
const attendanceChartData = ATTENDANCE_RECORDS.filter(
  (r) => r.serviceType === 'Sunday Morning Service',
)
  .slice()
  .reverse()
  .slice(-7)
  .map((r) => ({
    date: new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    present: r.presentCount,
    visitors: r.visitorCount,
  }))

// ─── Offering pie-chart data ──────────────────────────────────
const pieData = [
  { name: 'Tithe', value: 32500 },
  { name: 'Offering', value: 47750 },
  { name: 'Thanksgiving', value: 18000 },
  { name: 'Building Fund', value: 27500 },
]
const PIE_COLORS = [CHART_COLORS.purple, CHART_COLORS.gold, CHART_COLORS.green, CHART_COLORS.blue]

// ─── Monthly member growth bar-chart data ────────────────────
const growthData = [
  { month: 'Dec', members: 220 },
  { month: 'Jan', members: 228 },
  { month: 'Feb', members: 232 },
  { month: 'Mar', members: 237 },
  { month: 'Apr', members: 241 },
  { month: 'May', members: 248 },
]

// ─── Recent activities ────────────────────────────────────────
const ACTIVITIES = [
  {
    icon: UserPlus,
    color: 'bg-purple-100 text-purple-600',
    text: 'Agnes Worjlah joined Youth Ministry',
    time: '2 hours ago',
  },
  {
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    text: 'Offering recorded: LRD 8,750 – Sunday Service',
    time: '3 hours ago',
  },
  {
    icon: UserCheck,
    color: 'bg-blue-100 text-blue-600',
    text: 'Attendance marked: 186 present (Mother\'s Day)',
    time: '5 hours ago',
  },
  {
    icon: MessageSquare,
    color: 'bg-amber-100 text-amber-600',
    text: 'SMS blast sent to 248 members – Prayer Week',
    time: '1 day ago',
  },
  {
    icon: Calendar,
    color: 'bg-rose-100 text-rose-600',
    text: 'New event created: Annual Convention 2026',
    time: '2 days ago',
  },
]

// ─── Birthday members (birthdays this week) ───────────────────
const birthdayMembers = MEMBERS.filter((m) => {
  const bDay = new Date(m.dateOfBirth + 'T00:00:00')
  const today = new Date()
  const thisWeek = new Date(today)
  thisWeek.setDate(today.getDate() + 7)
  const bDayThisYear = new Date(today.getFullYear(), bDay.getMonth(), bDay.getDate())
  return bDayThisYear >= today && bDayThisYear <= thisWeek
}).slice(0, 3)

// If none fall within the week, use the first 3 members as fallback
const displayBirthdays =
  birthdayMembers.length > 0 ? birthdayMembers : MEMBERS.slice(0, 3)

// ─── Open prayer requests ─────────────────────────────────────
const openPrayers = PRAYER_REQUESTS.filter((p) => p.status === 'open').slice(0, 3)

// ─── Upcoming events ─────────────────────────────────────────
const upcomingEvents = EVENTS.filter((e) => e.status === 'upcoming')
  .sort((a, b) => new Date(a.date) - new Date(b.date))
  .slice(0, 3)

// ─── Scripture of the Day ─────────────────────────────────────
const SCRIPTURE = {
  verse:
    '"For I know the plans I have for you," declares the LORD, "plans to prosper you and not to harm you, plans to give you hope and a future."',
  reference: 'Jeremiah 29:11 (NIV)',
}

// ─── Custom Tooltip ───────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-sm font-bold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

// ─── Custom Pie Label ─────────────────────────────────────────
function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return percent > 0.08 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
      style={{ fontSize: 10, fontWeight: 700 }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null
}

// ─── Section Header ───────────────────────────────────────────
function SectionHeader({ title, action, actionLabel = 'View All' }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {action && (
        <button
          onClick={action}
          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
        >
          {actionLabel}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { church } = useChurch()
  const navigate = useNavigate()

  const displayName =
    user?.user_metadata?.name || user?.name || 'Pastor'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page header ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {getGreeting()}, {displayName.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-purple-600 hover:border-purple-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
            </button>
            <button className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-2.5 rounded-xl shadow-md shadow-purple-500/25 hover:from-violet-700 hover:to-purple-800 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all">
              <FileText className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>

        {/* ── ROW 1 – Stats cards ───────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatsCard
            title="Total Members"
            value={STATS.totalMembers}
            change="+12 this month"
            changeType="up"
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Today's Attendance"
            value={STATS.todayAttendance}
            change="+8% vs last Sunday"
            changeType="up"
            icon={UserCheck}
            color="gold"
          />
          <StatsCard
            title="Total Offerings"
            value={formatCurrency(STATS.totalOfferings, STATS.currency)}
            change="+LRD 14,250"
            changeType="up"
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="First-Time Visitors"
            value={STATS.firstTimeVisitors}
            change="+2 vs last week"
            changeType="up"
            icon={UserPlus}
            color="blue"
          />
        </div>

        {/* ── ROW 2 – Attendance chart + Pie chart ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Attendance area chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Attendance Overview" actionLabel="Full Report" action={() => {}} />
            <p className="text-xs text-slate-400 mb-5">Last 7 Sunday services</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.purple} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS.purple} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="present"
                  name="Present"
                  stroke={CHART_COLORS.purple}
                  strokeWidth={2.5}
                  fill="url(#purpleGrad)"
                  dot={{ r: 4, fill: CHART_COLORS.purple, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Visitors"
                  stroke={CHART_COLORS.gold}
                  strokeWidth={2}
                  fill="url(#goldGrad)"
                  dot={{ r: 3, fill: CHART_COLORS.gold, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Offering pie chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Offering Breakdown" actionLabel="Finance" action={() => {}} />
            <p className="text-xs text-slate-400 mb-4">May 2026</p>
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderPieLabel}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value, 'LRD')}
                    contentStyle={{ borderRadius: 12, border: '1px solid #f1f5f9', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i] }}
                  />
                  <span className="text-xs text-slate-500 truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3 – Activities + Growth chart + Events ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent activities */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Recent Activity" action={() => {}} />
            <div className="space-y-4">
              {ACTIVITIES.map((act, i) => {
                const Icon = act.icon
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${act.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{act.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.time}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Church growth bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Church Growth" action={() => {}} />
            <p className="text-xs text-slate-400 mb-5">Monthly member count (last 6 months)</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={growthData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  domain={[200, 260]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8f5ff' }} />
                <Bar
                  dataKey="members"
                  name="Members"
                  fill={CHART_COLORS.purple}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Upcoming Events" action={() => {}} />
            <div className="space-y-4">
              {upcomingEvents.map((evt) => {
                const d = new Date(evt.date + 'T00:00:00')
                const dayNum = d.getDate()
                const monthAbbr = d.toLocaleDateString('en-US', { month: 'short' })
                return (
                  <div
                    key={evt.id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex flex-col items-center justify-center text-white shadow-md shadow-purple-500/25">
                      <span className="text-[10px] font-semibold leading-none uppercase">{monthAbbr}</span>
                      <span className="text-lg font-extrabold leading-none">{dayNum}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 leading-tight truncate group-hover:text-purple-700 transition-colors">
                        {evt.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{evt.venue}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {evt.type}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── ROW 4 – Birthdays + Prayer requests ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Birthday reminders */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Birthday Reminders" actionLabel="Send Wishes" action={() => {}} />
            <p className="text-xs text-slate-400 mb-5">Members with birthdays this week</p>
            <div className="space-y-4">
              {displayBirthdays.map((member) => {
                const bDay = new Date(member.dateOfBirth + 'T00:00:00')
                const birthdayStr = bDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                return (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <Avatar
                      src={member.profilePhoto}
                      name={member.name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.department}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                        🎂 {birthdayStr}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Prayer requests */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Prayer Requests" action={() => {}} />
            <p className="text-xs text-slate-400 mb-5">Recent open requests from members</p>
            <div className="space-y-4">
              {openPrayers.map((req) => (
                <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <Heart className="w-4.5 h-4.5 text-rose-500" style={{ width: '1.1rem', height: '1.1rem' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800">{req.memberName}</p>
                      <Badge
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          req.type === 'public'
                            ? 'bg-sky-50 text-sky-700 border border-sky-100'
                            : req.type === 'pastor_only'
                            ? 'bg-red-50 text-red-700 border border-red-100'
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}
                      >
                        {req.type === 'pastor_only' ? 'Pastor Only' : req.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{req.request}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{formatDate(req.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 5 – Scripture + Quick Actions ────────── */}
        <div className="space-y-5">

          {/* Scripture of the Day */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-8 shadow-xl shadow-amber-400/25">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-amber-600/20 rounded-full translate-y-1/2 blur-xl" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-amber-950/15 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-amber-950" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-2">
                  Scripture of the Day
                </p>
                <p className="text-base sm:text-lg font-semibold text-amber-950 leading-relaxed mb-2">
                  {SCRIPTURE.verse}
                </p>
                <p className="text-sm font-bold text-amber-800">— {SCRIPTURE.reference}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <h2 className="text-base font-bold text-slate-800 mb-5">Quick Actions</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: UserPlus,
                  label: 'Add Member',
                  desc: 'Register new member',
                  color: 'from-violet-600 to-purple-700',
                  shadow: 'shadow-purple-500/25',
                  onClick: () => navigate('/app/members/new'),
                },
                {
                  icon: CheckCircle2,
                  label: 'Record Attendance',
                  desc: 'Mark today\'s service',
                  color: 'from-amber-500 to-yellow-500',
                  shadow: 'shadow-amber-400/25',
                  onClick: () => navigate('/app/attendance'),
                },
                {
                  icon: DollarSign,
                  label: 'Add Offering',
                  desc: 'Log new offering',
                  color: 'from-emerald-500 to-teal-600',
                  shadow: 'shadow-emerald-500/25',
                  onClick: () => navigate('/app/finance'),
                },
                {
                  icon: MessageSquare,
                  label: 'Send Message',
                  desc: 'Bulk SMS / notification',
                  color: 'from-blue-500 to-indigo-600',
                  shadow: 'shadow-blue-500/25',
                  onClick: () => navigate('/app/messages'),
                },
              ].map(({ icon: Icon, label, desc, color, shadow, onClick }) => (
                <button
                  key={label}
                  onClick={onClick}
                  className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-100 hover:border-transparent bg-slate-50 hover:bg-gradient-to-br hover:${color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:${shadow}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-md ${shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-white transition-colors">
                      {label}
                    </p>
                    <p className="text-xs text-slate-400 group-hover:text-white/70 transition-colors mt-0.5">
                      {desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
