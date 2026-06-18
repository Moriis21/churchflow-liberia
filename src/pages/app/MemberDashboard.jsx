// ============================================================
// ChurchFlow Liberia — Member Personal Dashboard
//
// Shown to users with role = "member".
// Shows ONLY personal data — no church management tools.
// ============================================================
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, HandHeart, PlaySquare, Radio,
  User, ChevronRight, Clock, Users, Loader2, ClipboardCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'
import { insforge } from '../../lib/insforge'
import { formatDate } from '../../utils/helpers'
import { ScriptureOfTheDayCard } from '../../components/ui'
import BibleStudyAI from '../../components/ai/BibleStudyAI'
import { useAIFeature } from '../../hooks/useAIFeature'

// ─── Quick-link card ─────────────────────────────────────────
function QuickLink({ icon: Icon, label, to, color, description }) {
  const navigate = useNavigate()
  const colors = {
    purple: 'from-violet-500 to-purple-600',
    amber:  'from-amber-400 to-orange-500',
    teal:   'from-teal-500 to-cyan-600',
    rose:   'from-rose-500 to-pink-600',
    indigo: 'from-indigo-500 to-blue-600',
    green:  'from-emerald-500 to-teal-600',
  }
  return (
    <button
      onClick={() => navigate(to)}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-5 text-left flex flex-col gap-3"
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color] || colors.purple} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700 transition-colors">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-purple-400 transition-colors self-end" />
    </button>
  )
}

// ─── Upcoming event item ──────────────────────────────────────
function EventItem({ event }) {
  const title = event.title || event.name || 'Church Event'
  const date  = event.date || event.start_date || event.event_date || ''
  const time  = event.time || event.start_time || ''
  const loc   = event.location || event.venue || ''
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
        <CalendarDays className="w-4.5 h-4.5 text-purple-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {date ? formatDate(date) : '—'}{time ? ` · ${time}` : ''}{loc ? ` · ${loc}` : ''}
        </p>
      </div>
    </div>
  )
}

// ─── Sermon item ─────────────────────────────────────────────
function SermonItem({ sermon }) {
  const title    = sermon.title || 'Sermon'
  const speaker  = sermon.speaker || sermon.preacher || ''
  const date     = sermon.date || sermon.sermon_date || sermon.created_at || ''
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
        <PlaySquare className="w-4.5 h-4.5 text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {speaker && <span>{speaker}</span>}
          {speaker && date && <span> · </span>}
          {date && <span>{formatDate(typeof date === 'string' ? date.split('T')[0] : date)}</span>}
        </p>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function MemberDashboard() {
  const navigate = useNavigate()
  const { user }  = useAuth()
  const { church } = useChurch()
  const { enabled: bibleAiEnabled } = useAIFeature('bible_ai')

  const [events,  setEvents]  = useState([])
  const [sermons, setSermons] = useState([])
  const [loading, setLoading] = useState(true)

  const name     = user?.profile?.full_name || user?.name || user?.email?.split('@')[0] || 'Friend'
  const greeting = getGreeting()
  const churchName = church?.name || 'Your Church'

  function getGreeting() {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    if (!church?.id) { setLoading(false); return }
    async function loadData() {
      setLoading(true)
      try {
        const [evRes, seRes] = await Promise.all([
          insforge.database
            .from('events')
            .select('*')
            .eq('church_id', church.id)
            .gte('date', new Date().toISOString().split('T')[0])
            .order('date', { ascending: true })
            .limit(4),
          insforge.database
            .from('sermons')
            .select('*')
            .eq('church_id', church.id)
            .order('created_at', { ascending: false })
            .limit(4),
        ])
        setEvents(evRes.data  || [])
        setSermons(seRes.data || [])
      } catch { /* show empty */ }
      setLoading(false)
    }
    loadData()
  }, [church?.id])

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Welcome Banner ── */}
        <div className="relative bg-gradient-to-r from-[#151022] via-purple-800 to-violet-700 rounded-2xl p-6 sm:p-8 overflow-hidden shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -bottom-12 -left-8 w-48 h-48 bg-white/5 rounded-full" />
          <div className="relative">
            <p className="text-purple-300 text-sm font-medium mb-1">{greeting},</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1">{name} 👋</h1>
            <p className="text-purple-200 text-sm">{churchName}</p>
          </div>
          {/* Member badge */}
          <div className="relative mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20">
              <Users className="w-3 h-3" />
              Church Member
            </span>
          </div>
        </div>

        {/* ── Scripture of the Day (member-focused, daily) ── */}
        <ScriptureOfTheDayCard />

        {/* ── Quick Links ── */}
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
            <QuickLink to="/app/profile"             icon={User}         color="purple" label="My Profile"       description="View & edit your profile" />
            <QuickLink to="/app/member-attendance"   icon={ClipboardCheck} color="green"  label="My Attendance"   description="View your attendance record" />
            <QuickLink to="/app/events"              icon={CalendarDays}  color="amber"  label="Events"           description="Upcoming church events" />
            <QuickLink to="/app/prayer-requests"     icon={HandHeart}     color="rose"   label="Prayer Requests"  description="Submit & view prayers" />
            <QuickLink to="/app/sermons"             icon={PlaySquare}    color="teal"   label="Sermons"          description="Listen to sermons" />
            <QuickLink to="/app/live-streams"        icon={Radio}         color="indigo" label="Live Streams"     description="Watch live services" />
          </div>
        </div>

        {/* ── Events + Sermons grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-purple-600" />
                  Upcoming Events
                </h3>
                <button
                  onClick={() => navigate('/app/events')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {events.length > 0 ? (
                events.map(e => <EventItem key={e.id} event={e} />)
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No upcoming events scheduled</p>
                </div>
              )}
            </div>

            {/* Recent Sermons */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <PlaySquare className="w-4 h-4 text-amber-600" />
                  Recent Sermons
                </h3>
                <button
                  onClick={() => navigate('/app/sermons')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              {sermons.length > 0 ? (
                sermons.map(s => <SermonItem key={s.id} sermon={s} />)
              ) : (
                <div className="text-center py-8">
                  <PlaySquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">No sermons available yet</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ── Bible Study AI ── */}
        {bibleAiEnabled && (
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Bible Study Assistant</h2>
            <BibleStudyAI />
          </div>
        )}

        {/* ── Member info footer ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700">Need help or have questions?</p>
            <p className="text-xs text-slate-400 mt-0.5">Reach out to your church administrator for assistance with your account.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
