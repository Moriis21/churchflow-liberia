// ============================================================
// ChurchFlow Liberia — Main App Dashboard
// ============================================================
import { useNavigate, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  Wifi,
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
import { formatCurrency, formatDate, getGreeting } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import AdminInsightsAI from '../../components/ai/AdminInsightsAI'
import { useAIFeature } from '../../hooks/useAIFeature'

// ─── Palette ─────────────────────────────────────────────────
const CHART_COLORS = {
  purple: '#7C3AED',
  gold: '#F59E0B',
  navy: '#1E1B4B',
  green: '#10B981',
  blue: '#3B82F6',
  rose: '#F43F5E',
}

// ─── Attendance area-chart data builder ──────────────────────
function buildAttendanceChartData(records) {
  return records
    .filter((r) => (r.serviceType || r.service_type || '').includes('Sunday'))
    .slice()
    .reverse()
    .slice(-7)
    .map((r) => ({
      date: new Date((r.date || r.service_date) + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      present: r.presentCount ?? r.present_count ?? 0,
      visitors: r.visitorCount ?? r.visitor_count ?? 0,
    }))
}

const PIE_COLORS = [CHART_COLORS.purple, CHART_COLORS.gold, CHART_COLORS.green, CHART_COLORS.blue]

// ─── Build offering pie data from real DB records ─────────────
function buildPieData(offeringsList) {
  const grouped = {}
  ;(offeringsList || []).forEach((o) => {
    const key = o.type || 'Other'
    grouped[key] = (grouped[key] || 0) + Number(o.amount || 0)
  })
  return Object.entries(grouped).map(([name, value]) => ({ name, value }))
}

// ─── Build member growth data from real DB records ────────────
function buildGrowthData(membersList) {
  const months = {}
  ;(membersList || []).forEach((m) => {
    if (!m.created_at) return
    const d = new Date(m.created_at)
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    months[key] = (months[key] || 0) + 1
  })
  // Return last 6 months
  const result = Object.entries(months)
    .map(([label, count]) => ({ month: label.split(' ')[0], members: count }))
    .slice(-6)
  return result
}

// ─── Birthday members helper ──────────────────────────────────
function getBirthdayMembers(membersList) {
  const candidates = membersList.filter((m) => {
    const dob = m.dateOfBirth || m.date_of_birth
    if (!dob) return false
    const bDay = new Date(dob + 'T00:00:00')
    const today = new Date()
    const thisWeek = new Date(today)
    thisWeek.setDate(today.getDate() + 7)
    const bDayThisYear = new Date(today.getFullYear(), bDay.getMonth(), bDay.getDate())
    return bDayThisYear >= today && bDayThisYear <= thisWeek
  }).slice(0, 3)
  return candidates.length > 0 ? candidates : membersList.slice(0, 3)
}

// ─── Open prayer requests helper ─────────────────────────────
function getOpenPrayers(prayerList) {
  return prayerList.filter((p) => p.status === 'open').slice(0, 3)
}

// ─── Upcoming events helper ───────────────────────────────────
function getUpcomingEvents(eventsList) {
  return eventsList
    .filter((e) => e.status === 'upcoming')
    .sort((a, b) => new Date(a.date || a.event_date) - new Date(b.date || b.event_date))
    .slice(0, 3)
}

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
  const { user, isSuperAdmin } = useAuth()
  const { church } = useChurch()
  const navigate = useNavigate()
  const { enabled: adminAiEnabled } = useAIFeature('admin_ai')

  // ── Live data state (empty — populated from InsForge on mount) ──
  const [stats, setStats] = useState({
    totalMembers: 0,
    newThisMonth: 0,
    todayAttendance: 0,
    firstTimeVisitors: 0,
    totalOfferings: 0,
    currency: 'LRD',
  })
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [offerings, setOfferings] = useState([])
  const [attendance, setAttendance] = useState([])
  const [prayerReqs, setPrayerReqs] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [membersRes, eventsRes, offeringsRes, attendanceRes, prayerRes] = await Promise.all([
          insforge.database.from('members').select('*').order('created_at', { ascending: false }),
          insforge.database.from('events').select('*').order('event_date', { ascending: true }),
          insforge.database.from('offerings').select('*').order('date', { ascending: false }).limit(20),
          insforge.database.from('attendance').select('*').order('service_date', { ascending: false }).limit(10),
          insforge.database.from('prayer_requests').select('*').order('submitted_at', { ascending: false }).limit(5),
        ])

        // Members
        const memberData = membersRes.data || []
        setMembers(memberData)
        const now = new Date()
        const thisMonth = memberData.filter((m) => {
          const d = new Date(m.created_at)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        const totalOfferings = (offeringsRes.data || []).reduce(
          (sum, o) => sum + Number(o.amount || 0), 0
        )
        const todayAtt = (attendanceRes.data || [])[0]
        setStats((prev) => ({
          ...prev,
          totalMembers: memberData.length,
          newThisMonth: thisMonth.length,
          todayAttendance: todayAtt?.present_count ?? 0,
          totalOfferings,
          firstTimeVisitors: prev.firstTimeVisitors ?? 0,
        }))

        // Events
        setEvents(eventsRes.data || [])

        // Offerings
        setOfferings(offeringsRes.data || [])

        // Attendance + chart
        const attData = attendanceRes.data || []
        setAttendance(attData)
        setChartData(buildAttendanceChartData(attData))

        // Prayer requests
        setPrayerReqs(prayerRes.data || [])
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setDataLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Super admin safety guard — Layout redirects them, but belt-and-suspenders
  // Placed after all hooks to satisfy React Rules of Hooks
  if (isSuperAdmin) {
    return <Navigate to="/app/super-admin" replace />
  }

  // ── Derived display values ─────────────────────────────────
  const displayBirthdays = getBirthdayMembers(members)
  const openPrayers = getOpenPrayers(prayerReqs)
  const upcomingEvents = getUpcomingEvents(events)
  const pieData = buildPieData(offerings)
  const growthData = buildGrowthData(members)

  const displayName =
    user?.profile?.full_name || user?.user_metadata?.name || user?.name || 'Pastor'
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
            {dataLoading ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full animate-pulse">
                <Wifi className="w-3.5 h-3.5" />
                Syncing...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                <Wifi className="w-3.5 h-3.5" />
                Live data
              </span>
            )}
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
            value={stats.totalMembers}
            change={`+${stats.newThisMonth || 0} this month`}
            changeType="up"
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            change="+8% vs last Sunday"
            changeType="up"
            icon={UserCheck}
            color="gold"
          />
          <StatsCard
            title="Total Offerings"
            value={formatCurrency(stats.totalOfferings, stats.currency)}
            change="+LRD 14,250"
            changeType="up"
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="First-Time Visitors"
            value={stats.firstTimeVisitors}
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
            <SectionHeader title="Attendance Overview" actionLabel="Full Report" action={() => navigate('/app/attendance')} />
            <p className="text-xs text-slate-400 mb-5">Last 7 Sunday services</p>
            {chartData.length === 0 && !dataLoading && (
              <div className="py-10 text-center">
                <UserCheck className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No attendance records yet</p>
                <p className="text-xs text-slate-300 mt-0.5">Mark attendance to see your chart</p>
              </div>
            )}
            {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
            )}
          </div>

          {/* Offering pie chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Offering Breakdown" actionLabel="Finance" action={() => navigate('/app/finance')} />
            <p className="text-xs text-slate-400 mb-4">By offering type</p>
            {pieData.length === 0 && !dataLoading ? (
              <div className="py-10 text-center">
                <DollarSign className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No offerings recorded yet</p>
                <p className="text-xs text-slate-300 mt-0.5">Record your first offering to see the breakdown</p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* ── ROW 3 – Activities + Growth chart + Events ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent member activity */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Recent Members" action={() => navigate('/app/members')} actionLabel="View All" />
            {members.length === 0 && !dataLoading && (
              <div className="py-8 text-center">
                <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No members yet</p>
                <p className="text-xs text-slate-300 mt-0.5">Add your first member to get started</p>
              </div>
            )}
            <div className="space-y-4">
              {members.slice(0, 5).map((m) => (
                <div key={m.id} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase">
                      {(m.full_name || 'M').charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 leading-snug font-medium truncate">
                      {m.full_name || '—'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {m.created_at
                        ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Church growth bar chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Church Growth" action={() => navigate('/app/members')} />
            <p className="text-xs text-slate-400 mb-5">New members by month</p>
            {growthData.length === 0 && !dataLoading ? (
              <div className="py-10 text-center">
                <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No growth data yet</p>
                <p className="text-xs text-slate-300 mt-0.5">Add members to see your church growth</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <SectionHeader title="Upcoming Events" action={() => navigate('/app/events')} />
            {upcomingEvents.length === 0 && !dataLoading && (
              <div className="py-8 text-center">
                <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No upcoming events</p>
                <p className="text-xs text-slate-300 mt-0.5">Create your first event to get started</p>
              </div>
            )}
            <div className="space-y-4">
              {upcomingEvents.map((evt) => {
                const evtDate = evt.date || evt.event_date || ''
                const d = new Date(evtDate + 'T00:00:00')
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
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{evt.venue || evt.location || ''}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {evt.type || evt.event_type || ''}
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
            {displayBirthdays.length === 0 && !dataLoading && (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-400">No birthdays this week</p>
              </div>
            )}
            <div className="space-y-4">
              {displayBirthdays.map((member) => {
                const dob = member.dateOfBirth || member.date_of_birth
                const bDay = dob ? new Date(dob + 'T00:00:00') : null
                const birthdayStr = bDay
                  ? bDay.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
                  : '—'
                const memberName = member.name || member.full_name || '—'
                const dept = member.department || member.departments?.name || ''
                return (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <Avatar
                      src={member.profilePhoto || member.profile_photo}
                      name={memberName}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{memberName}</p>
                      <p className="text-xs text-slate-400">{dept}</p>
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
            <SectionHeader title="Prayer Requests" action={() => navigate('/app/prayer-requests')} />
            <p className="text-xs text-slate-400 mb-5">Recent open requests from members</p>
            {openPrayers.length === 0 && !dataLoading && (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-400">No open prayer requests</p>
              </div>
            )}
            <div className="space-y-4">
              {openPrayers.map((req) => {
                const reqMemberName = req.memberName || req.member_name || 'Anonymous'
                const reqType = req.type || req.visibility || 'public'
                const reqRequest = req.request || req.content || ''
                const reqDate = req.date || req.submitted_at || ''
                return (
                  <div key={req.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                      <Heart className="w-4.5 h-4.5 text-rose-500" style={{ width: '1.1rem', height: '1.1rem' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{reqMemberName}</p>
                        <Badge
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            reqType === 'public'
                              ? 'bg-sky-50 text-sky-700 border border-sky-100'
                              : reqType === 'pastor_only'
                              ? 'bg-red-50 text-red-700 border border-red-100'
                              : 'bg-slate-50 text-slate-600 border border-slate-100'
                          }`}
                        >
                          {reqType === 'pastor_only' ? 'Pastor Only' : reqType}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{reqRequest}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{formatDate(reqDate)}</p>
                    </div>
                  </div>
                )
              })}
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

      {/* ── AI Assistant Section ── */}
      {adminAiEnabled && !isSuperAdmin && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h2 className="text-base font-bold text-slate-800">Church Admin Assistant</h2>
            <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">AI</span>
          </div>
          <AdminInsightsAI isSuperAdmin={false} />
        </div>
      )}

      </div>
    </div>
  )
}
