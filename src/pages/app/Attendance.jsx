// ============================================================
// ChurchFlow Liberia — Attendance Management Page
// ============================================================
import { useState, useMemo, useEffect } from 'react'
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Clock,
  UserPlus,
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

import { Button, StatsCard, Badge, Avatar, Input, Modal } from '../../components/ui'
import { formatDate } from '../../utils/helpers'
import { insforge } from '../../lib/insforge'
import { useAuth } from '../../context/AuthContext'

// ─── Palette ─────────────────────────────────────────────────
const PURPLE = '#8A19FF'
const GOLD   = '#F59E0B'
const NAVY   = '#151022'
const GREEN  = '#10B981'
const BLUE   = '#3B82F6'
const ROSE   = '#F43F5E'

// ─── Service Tab Config ───────────────────────────────────────
const SERVICE_TABS = [
  'All Services',
  'Sunday Service',
  'Wednesday Bible Study',
  'Youth Meeting',
  'Choir Rehearsal',
  'Department Meeting',
  'Special Events',
]

// ─── Helper to normalise a record's field names ───────────────
function normRec(r) {
  return {
    ...r,
    id: r.id,
    date: r.date || r.service_date || '',
    serviceType: r.serviceType || r.service_type || '',
    presentCount: r.presentCount ?? r.present_count ?? 0,
    absentCount: r.absentCount ?? r.absent_count ?? 0,
    lateCount: r.lateCount ?? r.late_count ?? 0,
    visitorCount: r.visitorCount ?? r.visitor_count ?? 0,
    notes: r.notes || '',
  }
}

// ─── Weekly bar-chart: last 8 service records combined ────────
const buildWeeklyData = (records = []) =>
  records.slice()
    .reverse()
    .slice(0, 8)
    .reverse()
    .map((r) => {
      const n = normRec(r)
      return {
        label: new Date(n.date + 'T00:00:00').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        Present: n.presentCount,
        Late: n.lateCount,
        Visitors: n.visitorCount,
      }
    })

// ─── Pie data: attendance grouped by service type ─────────────
const buildPieData = (records = []) => {
  const totals = {}
  records.forEach((r) => {
    const n = normRec(r)
    totals[n.serviceType] = (totals[n.serviceType] || 0) + n.presentCount
  })
  return Object.entries(totals).map(([name, value]) => ({ name, value }))
}

const PIE_COLORS = [PURPLE, GOLD, GREEN, BLUE, ROSE, '#8B5CF6', '#06B6D4']

// ─── Present-count colour ─────────────────────────────────────
function presentColor(present, total) {
  const pct = total > 0 ? present / total : 0
  if (pct >= 0.7) return 'text-emerald-600 font-bold'
  if (pct >= 0.5) return 'text-amber-600 font-bold'
  return 'text-rose-600 font-bold'
}

// ─── Custom Tooltip ───────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-100 px-4 py-3 text-sm">
      <p className="font-semibold text-slate-600 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }} className="font-medium">
          {entry.name}: <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── Member checklist row ─────────────────────────────────────
function MemberCheckRow({ member, status, onStatusChange }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <Avatar
        src={member.profile_photo_path || member.profile_photo_url || member.profilePhoto}
        name={member.name || member.full_name}
        size="sm"
        bucket="member-photos"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{member.name}</p>
        <p className="text-xs text-slate-400">{member.department}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {['Present', 'Absent', 'Late'].map((s) => (
          <label
            key={s}
            className={[
              'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer text-xs font-medium border transition-all',
              status === s
                ? s === 'Present'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : s === 'Late'
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300',
            ].join(' ')}
          >
            <input
              type="radio"
              name={`status-${member.id}`}
              value={s}
              checked={status === s}
              onChange={() => onStatusChange(member.id, s)}
              className="sr-only"
            />
            {s}
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Record Attendance Modal ──────────────────────────────────
function RecordAttendanceModal({ isOpen, onClose, onSaved, members = [] }) {
  const { user } = useAuth()
  const [serviceType, setServiceType] = useState('Sunday Service')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [memberSearch, setMemberSearch] = useState('')
  const [memberStatuses, setMemberStatuses] = useState({})

  // Re-initialise statuses when members list changes
  useEffect(() => {
    setMemberStatuses(Object.fromEntries(members.map((m) => [m.id, 'Present'])))
  }, [members])

  const [visitorCount, setVisitorCount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredMembers = useMemo(
    () =>
      members.filter(
        (m) =>
          (m.full_name || m.name || '').toLowerCase().includes(memberSearch.toLowerCase()) ||
          (m.department || '').toLowerCase().includes(memberSearch.toLowerCase())
      ),
    [members, memberSearch]
  )

  const handleStatusChange = (id, status) => {
    setMemberStatuses((prev) => ({ ...prev, [id]: status }))
  }

  const counts = useMemo(() => {
    const present = Object.values(memberStatuses).filter((s) => s === 'Present').length
    const absent = Object.values(memberStatuses).filter((s) => s === 'Absent').length
    const late = Object.values(memberStatuses).filter((s) => s === 'Late').length
    return { present, absent, late }
  }, [memberStatuses])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data, error } = await insforge.database
        .from('attendance')
        .insert([{
          church_id: user?.churchId || user?.profile?.church_id,
          service_type: serviceType,
          service_date: date,
          present_count: counts.present,
          absent_count: counts.absent,
          late_count: counts.late,
          visitor_count: Number(visitorCount) || 0,
          notes,
        }])
        .select()
        .single()
      if (error) throw error
      if (data && onSaved) onSaved(data)
    } catch (err) {
      console.error('Save attendance error:', err)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Attendance"
      size="xl"
      footer={
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">
            {counts.present} present · {counts.absent} absent · {counts.late} late
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
              Save Attendance
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Service Type + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Service Type <span className="text-red-500">*</span>
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
            >
              {SERVICE_TABS.filter((t) => t !== 'All Services').map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        {/* Member checklist */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700">Members Attendance</label>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs text-emerald-600 hover:underline font-medium"
                onClick={() =>
                  setMemberStatuses(Object.fromEntries(members.map((m) => [m.id, 'Present'])))
                }
              >
                Mark All Present
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                className="text-xs text-rose-600 hover:underline font-medium"
                onClick={() =>
                  setMemberStatuses(Object.fromEntries(members.map((m) => [m.id, 'Absent'])))
                }
              >
                Mark All Absent
              </button>
            </div>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search members by name or department…"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
            />
          </div>
          <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-white px-3">
            {filteredMembers.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-6">No members match your search.</p>
            ) : (
              filteredMembers.map((m) => (
                <MemberCheckRow
                  key={m.id}
                  member={m}
                  status={memberStatuses[m.id]}
                  onStatusChange={handleStatusChange}
                />
              ))
            )}
          </div>
        </div>

        {/* Visitor count + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Visitor Count"
            type="number"
            placeholder="0"
            value={visitorCount}
            onChange={(e) => setVisitorCount(e.target.value)}
            icon={UserPlus}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea
              rows={3}
              placeholder="Any special notes about this service…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main Attendance Page ─────────────────────────────────────
export default function Attendance() {
  const { user } = useAuth()
  const [activeTab, setActiveTab]     = useState('All Services')
  const [expandedRow, setExpandedRow] = useState(null)
  const [modalOpen, setModalOpen]     = useState(false)
  const [records, setRecords]         = useState([])
  const [members, setMembers]         = useState([])

  // ── Load records from InsForge ─────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [attRes, mRes] = await Promise.all([
          insforge.database
            .from('attendance')
            .select('*')
            .order('service_date', { ascending: false })
            .limit(50),
          insforge.database
            .from('members')
            .select('id, full_name, department')
            .order('full_name', { ascending: true }),
        ])
        setRecords(attRes.data || [])
        setMembers(mRes.data || [])
      } catch (err) {
        console.error('Attendance load error:', err)
      }
    }
    load()
  }, [])

  // ── Filter records by tab ──────────────────────────────────
  const filteredRecords = useMemo(() => {
    const normalised = records.map(normRec)
    if (activeTab === 'All Services') return normalised
    // Match loosely so "Sunday Service" tab catches "Sunday Morning Service"
    return normalised.filter((r) =>
      r.serviceType.toLowerCase().includes(activeTab.toLowerCase())
    )
  }, [activeTab, records])

  // ── Stats ─────────────────────────────────────────────────
  const normRecords  = useMemo(() => records.map(normRec), [records])
  const todayRecord  = normRecords[0] || normRec({ presentCount: 0, absentCount: 0, lateCount: 0, visitorCount: 0 })
  const weeklyTotal  = normRecords.slice(0, 3).reduce((s, r) => s + r.presentCount, 0)
  const monthAvg     = normRecords.length
    ? Math.round(normRecords.reduce((s, r) => s + r.presentCount, 0) / normRecords.length)
    : 0
  const overallRate  = (() => {
    const totalPresent = normRecords.reduce((s, r) => s + r.presentCount, 0)
    const totalAll     = normRecords.reduce((s, r) => s + r.presentCount + r.absentCount + r.lateCount, 0)
    return totalAll > 0 ? Math.round((totalPresent / totalAll) * 100) : 0
  })()

  const weeklyChartData = useMemo(() => buildWeeklyData(records), [records])
  const pieData         = useMemo(() => buildPieData(records), [records])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              Attendance
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track and manage service attendance across all gatherings
            </p>
          </div>
          <Button
            variant="primary"
            icon={PlusCircle}
            onClick={() => setModalOpen(true)}
          >
            Record Attendance
          </Button>
        </div>

        {/* ── Stats Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          <StatsCard
            title="Today's Service"
            value={todayRecord.presentCount}
            suffix=" present"
            change="+8% vs last Sunday"
            changeType="up"
            icon={UserCheck}
            color="purple"
          />
          <StatsCard
            title="This Week"
            value={weeklyTotal}
            change="+24 vs last week"
            changeType="up"
            icon={Users}
            color="gold"
          />
          <StatsCard
            title="Monthly Average"
            value={monthAvg}
            change="+5% this month"
            changeType="up"
            icon={ClipboardList}
            color="green"
          />
          <StatsCard
            title="Attendance Rate"
            value={overallRate}
            suffix="%"
            change="+2% improvement"
            changeType="up"
            icon={TrendingUp}
            color="blue"
          />
        </div>

        {/* ── Service Tabs ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
          {/* Tab bar */}
          <div className="overflow-x-auto">
            <div className="flex items-center border-b border-slate-100 px-2 min-w-max">
              {SERVICE_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'px-4 py-3.5 text-sm font-semibold whitespace-nowrap transition-all duration-150 border-b-2 -mb-px',
                    activeTab === tab
                      ? 'border-violet-600 text-violet-700'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200',
                  ].join(' ')}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50/70">
                  {['Date', 'Service Type', 'Present', 'Absent', 'Late', 'Visitors', 'Total', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3.5 first:pl-6 last:pr-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      No attendance records for this service type yet.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => {
                    const total = record.presentCount + record.absentCount + record.lateCount
                    const isExpanded = expandedRow === record.id
                    return (
                      <>
                        <tr
                          key={record.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                          onClick={() => setExpandedRow(isExpanded ? null : record.id)}
                        >
                          {/* Date */}
                          <td className="px-5 py-4 pl-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span className="text-slate-700 font-medium">
                                {formatDate(record.date)}
                              </span>
                            </div>
                          </td>

                          {/* Service Type */}
                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                              {record.serviceType}
                            </span>
                          </td>

                          {/* Present */}
                          <td className={`px-5 py-4 ${presentColor(record.presentCount, total)}`}>
                            {record.presentCount}
                          </td>

                          {/* Absent */}
                          <td className="px-5 py-4 text-rose-500 font-medium">
                            {record.absentCount}
                          </td>

                          {/* Late */}
                          <td className="px-5 py-4 text-amber-600 font-medium">
                            {record.lateCount}
                          </td>

                          {/* Visitors */}
                          <td className="px-5 py-4 text-blue-600 font-medium">
                            {record.visitorCount}
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4 text-slate-800 font-semibold">
                            {total}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 pr-6">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedRow(isExpanded ? null : record.id)
                              }}
                              className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-violet-700 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  Hide <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  Details <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded notes row */}
                        {isExpanded && (
                          <tr key={`${record.id}-exp`} className="bg-violet-50/40">
                            <td colSpan={8} className="px-6 py-4">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                  <ClipboardList className="w-4 h-4 text-violet-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">
                                    Service Notes
                                  </p>
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {record.notes || 'No notes recorded for this service.'}
                                  </p>
                                  <div className="flex flex-wrap gap-4 mt-3">
                                    <span className="text-xs text-slate-500">
                                      <span className="font-semibold text-emerald-600">{record.presentCount}</span> present
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      <span className="font-semibold text-rose-600">{record.absentCount}</span> absent
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      <span className="font-semibold text-amber-600">{record.lateCount}</span> late
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      <span className="font-semibold text-blue-600">{record.visitorCount}</span> visitors
                                    </span>
                                    <span className="text-xs text-slate-500">
                                      Rate:{' '}
                                      <span className="font-semibold text-violet-700">
                                        {Math.round(
                                          (record.presentCount /
                                            (record.presentCount + record.absentCount + record.lateCount)) *
                                            100
                                        )}%
                                      </span>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Charts Row ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* Weekly bar chart */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800">Weekly Attendance</h2>
              <span className="text-xs text-slate-400 font-medium">Last 8 services</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Present, Late, and Visitors per service
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={weeklyChartData}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                barCategoryGap="28%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8f5ff' }} />
                <Bar dataKey="Present" name="Present" fill={PURPLE} radius={[5, 5, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Late"    name="Late"    fill={GOLD}   radius={[5, 5, 0, 0]} maxBarSize={28} />
                <Bar dataKey="Visitors" name="Visitors" fill={BLUE} radius={[5, 5, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3 justify-center">
              {[
                { color: PURPLE, label: 'Present' },
                { color: GOLD,   label: 'Late' },
                { color: BLUE,   label: 'Visitors' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-xs text-slate-500">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart by service type */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-800">By Service Type</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">Total attendance share</p>
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
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} attendees`, '']}
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
              {pieData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-slate-500 flex-1 truncate">{item.name}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Record Attendance Modal */}
      <RecordAttendanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={(newRecord) => setRecords((prev) => [newRecord, ...prev])}
        members={members}
      />
    </div>
  )
}
