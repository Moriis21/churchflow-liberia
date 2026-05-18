// ============================================================
// ChurchFlow Liberia — Member Profile Page
// ============================================================
import React, { useState, useRef, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Heart,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
  Pencil,
  MessageSquare,
  UserCheck,
  BookOpen,
  ShieldCheck,
  AlertCircle,
  X,
  ChevronRight,
  Droplets,
} from 'lucide-react'
import {
  Button,
  Badge,
  Avatar,
  Modal,
  Input,
} from '../../components/ui'
import { MEMBERS, DEPARTMENTS, ATTENDANCE_RECORDS, OFFERINGS, PRAYER_REQUESTS } from '../../data/dummyData'
import {
  formatDate,
  getInitials,
  getStatusColor,
  formatPhone,
  calculateAge,
} from '../../utils/helpers'

// TODO: import { db } from '../../lib/insforge'

// ─── Constants ───────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',         icon: UserCheck },
  { id: 'attendance', label: 'Attendance',        icon: CheckCircle2 },
  { id: 'giving',     label: 'Giving',            icon: DollarSign },
  { id: 'prayer',     label: 'Prayer Requests',   icon: Heart },
]

const STATUS_OPTIONS = ['active', 'inactive', 'new']
const GENDER_OPTIONS = ['male', 'female']
const MARITAL_OPTIONS = ['single', 'married', 'widowed', 'divorced']
const DEPT_NAMES = DEPARTMENTS.map((d) => d.name)

// ─── Mock per-member attendance ───────────────────────────────
function getMemberAttendance(memberId) {
  // In real use, query: db.memberAttendance().select().where({ memberId })
  // Here we generate deterministic mock data based on the real ATTENDANCE_RECORDS
  const statuses = ['present', 'present', 'present', 'absent', 'late', 'present', 'present', 'present']
  return ATTENDANCE_RECORDS.map((rec, i) => ({
    id: `${memberId}-att-${rec.id}`,
    date: rec.date,
    serviceType: rec.serviceType,
    status: statuses[i % statuses.length],
  }))
}

// ─── Mock per-member offerings ────────────────────────────────
function getMemberOfferings(memberName) {
  return OFFERINGS.filter(
    (o) => o.member === memberName || o.member.toLowerCase().includes(memberName.split(' ')[0].toLowerCase())
  )
}

// ─── Mock per-member prayer requests ─────────────────────────
function getMemberPrayers(memberId) {
  return PRAYER_REQUESTS.filter((p) => p.memberId === memberId)
}

// ─── Toast ────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  return (
    <div
      className={[
        'fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl',
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white',
      ].join(' ')}
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="text-sm font-semibold">{message}</span>
      <button onClick={onClose} className="ml-2 opacity-80 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── Member Form (same as Members.jsx) ───────────────────────
function MemberForm({ form, onChange, errors }) {
  const fileRef = useRef(null)

  const handleField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    onChange({ ...form, [key]: value })
  }

  return (
    <div className="space-y-5">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3 pb-2">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-dashed border-purple-300 flex items-center justify-center">
            {form.profilePhoto ? (
              <img src={form.profilePhoto} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-purple-400">
                {form.name ? getInitials(form.name) : '?'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md hover:bg-purple-700 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onChange({ ...form, profilePhoto: URL.createObjectURL(file) })
          }}
        />
        <p className="text-xs text-slate-400">Click camera icon to upload photo</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Full Name"
            required
            value={form.name}
            onChange={handleField('name')}
            placeholder="e.g. James Kollie"
            error={errors?.name}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Gender</label>
          <div className="flex gap-5 mt-1">
            {GENDER_OPTIONS.map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input
                  type="radio"
                  name="gender-edit"
                  value={g}
                  checked={form.gender === g}
                  onChange={handleField('gender')}
                  className="accent-purple-600 w-4 h-4"
                />
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Marital Status</label>
          <select
            value={form.maritalStatus}
            onChange={handleField('maritalStatus')}
            className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
          >
            {MARITAL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone"
          required
          value={form.phone}
          onChange={handleField('phone')}
          placeholder="+231-770-000-000"
          error={errors?.phone}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={handleField('email')}
          placeholder="email@example.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={handleField('dateOfBirth')}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Department</label>
          <select
            value={form.department}
            onChange={handleField('department')}
            className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
          >
            <option value="">— Select Department —</option>
            {DEPT_NAMES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Membership Status</label>
          <select
            value={form.membershipStatus}
            onChange={handleField('membershipStatus')}
            className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Baptism</label>
          <label className="flex items-center gap-3 cursor-pointer mt-1">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.baptismStatus}
                onChange={handleField('baptismStatus')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-purple-600 transition-colors" />
              <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <span className="text-sm text-slate-700">
              {form.baptismStatus ? 'Baptized' : 'Not baptized'}
            </span>
          </label>
        </div>
      </div>

      <Input
        label="Address"
        value={form.address}
        onChange={handleField('address')}
        placeholder="e.g. Sinkor, Monrovia, Liberia"
      />
      <Input
        label="Emergency Contact"
        value={form.emergencyContact}
        onChange={handleField('emergencyContact')}
        placeholder="Name — Phone"
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Notes</label>
        <textarea
          value={form.notes}
          onChange={handleField('notes')}
          placeholder="Any additional notes..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 hover:border-slate-300 transition-all resize-none"
        />
      </div>
    </div>
  )
}

// ─── Info Row ─────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value, color = 'text-slate-400' }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3">
      <div className={`flex-shrink-0 mt-0.5 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 break-words">{value}</p>
      </div>
    </div>
  )
}

// ─── Quick Stat Pill ──────────────────────────────────────────
function QuickStat({ label, value, highlight }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 flex-1">
      <span
        className={[
          'text-lg font-extrabold leading-none',
          highlight ? 'text-purple-600' : 'text-slate-800',
        ].join(' ')}
      >
        {value}
      </span>
      <span className="text-[10px] text-slate-400 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

// ─── Attendance Status Icon ───────────────────────────────────
function AttendanceStatusIcon({ status }) {
  if (status === 'present') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  if (status === 'late')    return <Clock className="w-4 h-4 text-amber-500" />
  return <XCircle className="w-4 h-4 text-slate-300" />
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ member, attendance, offerings, prayers }) {
  const recentAtt = attendance.slice(0, 3)
  const recentOff = offerings.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-600 to-purple-700" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Full Name</p>
            <p className="text-sm font-semibold text-slate-800">{member.name}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Gender</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">{member.gender}</p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Marital Status</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {member.maritalStatus || '—'}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Date of Birth</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatDate(member.dateOfBirth)}{' '}
              {member.dateOfBirth && (
                <span className="text-slate-400 font-normal">
                  (Age {calculateAge(member.dateOfBirth)})
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Membership Status</p>
            <p className="text-sm font-semibold text-slate-800 capitalize">
              {member.membershipStatus}
            </p>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Baptism Status</p>
            <p className="text-sm font-semibold text-slate-800">
              {member.baptismStatus ? 'Baptized' : 'Not Baptized'}
            </p>
          </div>
          <div className="sm:col-span-2 flex flex-col gap-0.5">
            <p className="text-xs text-slate-400">Notes</p>
            <p className="text-sm text-slate-600 leading-relaxed">{member.notes || '—'}</p>
          </div>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-yellow-500" />
            Recent Attendance
          </h3>
          <span className="text-xs text-slate-400">Last 3 services</span>
        </div>
        {recentAtt.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No attendance records found.</p>
        ) : (
          <div className="space-y-2">
            {recentAtt.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AttendanceStatusIcon status={a.status} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{a.serviceType}</p>
                    <p className="text-xs text-slate-400">{formatDate(a.date)}</p>
                  </div>
                </div>
                <span
                  className={[
                    'text-xs font-semibold px-2 py-0.5 rounded-full capitalize',
                    a.status === 'present'
                      ? 'bg-emerald-50 text-emerald-700'
                      : a.status === 'late'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-500',
                  ].join(' ')}
                >
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Giving */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-600" />
            Recent Giving
          </h3>
          <span className="text-xs text-slate-400">Last 3 contributions</span>
        </div>
        {recentOff.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No giving records found.</p>
        ) : (
          <div className="space-y-2">
            {recentOff.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 capitalize truncate">
                      {o.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(o.date)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-800 flex-shrink-0">
                  {o.currency} {o.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Attendance Tab ───────────────────────────────────────────
function AttendanceTab({ attendance }) {
  const total = attendance.length
  const present = attendance.filter((a) => a.status === 'present').length
  const late = attendance.filter((a) => a.status === 'late').length
  const absent = attendance.filter((a) => a.status === 'absent').length
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Services', value: total, highlight: false },
          { label: 'Present', value: present, highlight: false },
          { label: 'Late',    value: late,    highlight: false },
          { label: 'Rate',    value: `${rate}%`, highlight: true },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-4 flex flex-col items-center gap-1"
          >
            <span
              className={[
                'text-2xl font-extrabold',
                s.highlight ? 'text-purple-600' : 'text-slate-800',
              ].join(' ')}
            >
              {s.value}
            </span>
            <span className="text-xs text-slate-400 font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Attendance rate bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Attendance Rate</p>
          <span className="text-sm font-bold text-purple-600">{rate}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-700 transition-all duration-700"
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-1.5">
          {present + late} attended out of {total} recorded services
        </p>
      </div>

      {/* Full table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">All Attendance Records</h3>
        </div>
        {attendance.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No attendance records for this member.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {['Date', 'Service', 'Status'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-600 whitespace-nowrap">
                      {formatDate(a.date)}
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-700 whitespace-nowrap">
                      {a.serviceType}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <AttendanceStatusIcon status={a.status} />
                        <span
                          className={[
                            'text-xs font-semibold capitalize',
                            a.status === 'present'
                              ? 'text-emerald-600'
                              : a.status === 'late'
                              ? 'text-amber-600'
                              : 'text-slate-400',
                          ].join(' ')}
                        >
                          {a.status}
                        </span>
                      </div>
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

// ─── Giving Tab ───────────────────────────────────────────────
function GivingTab({ offerings }) {
  const currentYear = new Date().getFullYear()
  const thisYearOfferings = offerings.filter((o) => {
    const y = new Date(o.date + 'T00:00:00').getFullYear()
    return y === currentYear
  })

  const totalLRD = thisYearOfferings
    .filter((o) => o.currency === 'LRD')
    .reduce((sum, o) => sum + o.amount, 0)
  const totalUSD = thisYearOfferings
    .filter((o) => o.currency === 'USD')
    .reduce((sum, o) => sum + o.amount, 0)

  const typeColors = {
    tithe: 'bg-violet-100 text-violet-700',
    offering: 'bg-blue-100 text-blue-700',
    thanksgiving: 'bg-amber-100 text-amber-700',
    building_fund: 'bg-orange-100 text-orange-700',
    donation: 'bg-teal-100 text-teal-700',
  }

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Total (LRD) — {currentYear}</p>
          <p className="text-2xl font-extrabold text-slate-800">
            LRD {totalLRD.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Total (USD) — {currentYear}</p>
          <p className="text-2xl font-extrabold text-slate-800">
            USD {totalUSD.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5">
          <p className="text-xs font-medium text-slate-500 mb-1">Contributions</p>
          <p className="text-2xl font-extrabold text-slate-800">{offerings.length}</p>
        </div>
      </div>

      {/* Offerings list */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-700">All Giving Records</h3>
        </div>
        {offerings.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No giving records found for this member.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {offerings.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={[
                          'inline-block text-[10px] font-bold px-2 py-0.5 rounded-full capitalize',
                          typeColors[o.type] || 'bg-slate-100 text-slate-600',
                        ].join(' ')}
                      >
                        {o.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{o.notes || formatDate(o.date)}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(o.date)}</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-base font-bold text-slate-800">
                    {o.currency} {o.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Prayer Tab ───────────────────────────────────────────────
function PrayerTab({ prayers }) {
  const typeLabels = {
    public: { label: 'Public', color: 'bg-sky-100 text-sky-700' },
    private: { label: 'Private', color: 'bg-slate-100 text-slate-600' },
    pastor_only: { label: 'Pastor Only', color: 'bg-red-100 text-red-700' },
  }
  const statusLabels = {
    open: { label: 'Open', color: 'bg-orange-100 text-orange-700' },
    answered: { label: 'Answered', color: 'bg-emerald-100 text-emerald-700' },
  }

  return (
    <div className="space-y-4">
      {prayers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-violet-200 p-12 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No prayer requests yet</p>
          <p className="text-xs text-slate-400">Prayer requests from this member will appear here.</p>
        </div>
      ) : (
        prayers.map((req) => {
          const typeInfo = typeLabels[req.type] || typeLabels.public
          const statusInfo = statusLabels[req.status] || statusLabels.open

          return (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className={[
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        typeInfo.color,
                      ].join(' ')}
                    >
                      {typeInfo.label}
                    </span>
                    <span
                      className={[
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        statusInfo.color,
                      ].join(' ')}
                    >
                      {statusInfo.label}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(req.date)}</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{req.request}</p>
                  {req.response && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Response / Testimony</p>
                      <p className="text-xs text-emerald-700 leading-relaxed">{req.response}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────
export default function MemberProfile() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Find member
  const [member, setMember] = useState(() => MEMBERS.find((m) => m.id === id) || null)

  // Tab state
  const [activeTab, setActiveTab] = useState('overview')

  // Edit modal
  const [showEdit, setShowEdit] = useState(false)
  const [form, setForm] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)

  // Derived data
  const attendance = useMemo(() => (member ? getMemberAttendance(member.id) : []), [member])
  const offerings = useMemo(() => (member ? getMemberOfferings(member.name) : []), [member])
  const prayers = useMemo(() => (member ? getMemberPrayers(member.id) : []), [member])

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Open edit modal
  const handleOpenEdit = () => {
    if (!member) return
    setForm({
      name: member.name || '',
      gender: member.gender || 'male',
      phone: member.phone || '',
      email: member.email || '',
      address: member.address || '',
      dateOfBirth: member.dateOfBirth || '',
      department: member.department || '',
      membershipStatus: member.membershipStatus || 'active',
      baptismStatus: member.baptismStatus || false,
      maritalStatus: member.maritalStatus || 'single',
      emergencyContact: member.emergencyContact || '',
      notes: member.notes || '',
      profilePhoto: member.profilePhoto || '',
    })
    setFormErrors({})
    setShowEdit(true)
  }

  // Save edits
  const handleSaveEdit = async () => {
    const errs = {}
    if (!form.name?.trim()) errs.name = 'Full name is required'
    if (!form.phone?.trim()) errs.phone = 'Phone number is required'
    if (Object.keys(errs).length) { setFormErrors(errs); return }

    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))

    // TODO: await db.members().update({ id: member.id }, form)
    setMember((prev) => ({ ...prev, ...form }))
    setSaving(false)
    setShowEdit(false)
    showToast('Profile updated successfully.')
  }

  // Not found
  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 mb-1">Member Not Found</h2>
          <p className="text-sm text-slate-500">The member with ID "{id}" could not be found.</p>
        </div>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/app/members')}>
          Back to Members
        </Button>
      </div>
    )
  }

  const statusMap = { active: 'success', inactive: 'gray', new: 'info' }
  const age = calculateAge(member.dateOfBirth)
  const presentCount = attendance.filter((a) => a.status === 'present' || a.status === 'late').length
  const attendanceRate = attendance.length > 0
    ? Math.round((presentCount / attendance.length) * 100)
    : 0

  const thisYearTotalLRD = offerings
    .filter((o) => o.currency === 'LRD' && new Date(o.date + 'T00:00:00').getFullYear() === new Date().getFullYear())
    .reduce((s, o) => s + o.amount, 0)

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Back button ─────────────────────────────────── */}
        <Link
          to="/app/members"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Members
        </Link>

        {/* ── Main layout ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ═══ LEFT SIDEBAR ═══ */}
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4">

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
              {/* Gradient header */}
              <div className="relative h-24 bg-gradient-to-r from-violet-600 to-purple-700">
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 70% 50%, #F59E0B 0%, transparent 50%)',
                  }}
                />
              </div>

              {/* Avatar + info */}
              <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
                <div className="relative mb-3">
                  {member.profilePhoto ? (
                    <img
                      src={member.profilePhoto}
                      alt={member.name}
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full ring-4 ring-white shadow-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
                      <span className="text-2xl font-extrabold text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                  )}
                  <button
                    onClick={handleOpenEdit}
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center shadow-md hover:bg-amber-500 transition-colors"
                    title="Edit profile"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h1 className="text-xl font-extrabold text-slate-800">{member.name}</h1>

                <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
                  {member.department && (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-full">
                      {member.department}
                    </span>
                  )}
                  <Badge
                    variant={statusMap[member.membershipStatus] || 'gray'}
                    dot
                    size="sm"
                  >
                    {member.membershipStatus.charAt(0).toUpperCase() +
                      member.membershipStatus.slice(1)}
                  </Badge>
                </div>

                {/* Quick stats */}
                <div className="flex gap-2 w-full mt-4">
                  <QuickStat
                    label="Age"
                    value={member.dateOfBirth ? age : '—'}
                  />
                  <QuickStat
                    label="Attendance"
                    value={`${attendanceRate}%`}
                    highlight
                  />
                  <QuickStat
                    label="Given (LRD)"
                    value={thisYearTotalLRD > 0 ? `${(thisYearTotalLRD / 1000).toFixed(0)}k` : '0'}
                  />
                </div>

                {/* Additional quick stats row */}
                <div className="flex gap-2 w-full mt-2">
                  <QuickStat
                    label="Member Since"
                    value={member.joinDate
                      ? new Date(member.joinDate + 'T00:00:00').getFullYear()
                      : '—'}
                  />
                  <QuickStat
                    label="Baptized"
                    value={member.baptismStatus ? 'Yes' : 'No'}
                    highlight={member.baptismStatus}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 w-full mt-5">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Pencil}
                    onClick={handleOpenEdit}
                    className="flex-1"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={MessageSquare}
                    className="flex-1"
                  >
                    Message
                  </Button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-600 to-purple-700" />
                Contact Information
              </h3>
              <InfoRow icon={Phone} label="Phone" value={formatPhone(member.phone)} color="text-purple-400" />
              <InfoRow icon={Mail} label="Email" value={member.email} color="text-blue-400" />
              <InfoRow icon={MapPin} label="Address" value={member.address} color="text-amber-400" />
              <InfoRow
                icon={Calendar}
                label="Join Date"
                value={formatDate(member.joinDate)}
                color="text-emerald-400"
              />
            </div>

            {/* Emergency Contact */}
            {member.emergencyContact && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-gradient-to-b from-red-500 to-rose-600" />
                  Emergency Contact
                </h3>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  <p className="text-sm text-red-800 font-medium">{member.emergencyContact}</p>
                </div>
              </div>
            )}

            {/* Baptism + Marital */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-yellow-500" />
                Additional Info
              </h3>
              <div className="flex items-center gap-3">
                <Droplets className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Baptism Status</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {member.baptismStatus ? 'Baptized' : 'Not Baptized'}
                  </p>
                </div>
                {member.baptismStatus && (
                  <ShieldCheck className="w-4 h-4 text-emerald-500 ml-auto" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Marital Status</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">
                    {member.maritalStatus || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ RIGHT MAIN AREA ═══ */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Tab bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] p-1.5 flex gap-1 overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0',
                      isActive
                        ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-md shadow-purple-500/25'
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <OverviewTab
                member={member}
                attendance={attendance}
                offerings={offerings}
                prayers={prayers}
              />
            )}
            {activeTab === 'attendance' && (
              <AttendanceTab attendance={attendance} />
            )}
            {activeTab === 'giving' && (
              <GivingTab offerings={offerings} />
            )}
            {activeTab === 'prayer' && (
              <PrayerTab prayers={prayers} />
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Member Modal ───────────────────────────────── */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title={`Edit — ${member.name}`}
        size="xl"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowEdit(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={saving}
              onClick={handleSaveEdit}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <MemberForm form={form} onChange={setForm} errors={formErrors} />
      </Modal>

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
