// ============================================================
// ChurchFlow Liberia — Role-Aware AI Insights Panel
//
// Renders the right AI assistant + quick actions based on the
// user's role: super_admin, church_admin, treasurer, secretary,
// dept_leader, or pastor.
// ============================================================
import React, { useState } from 'react'
import {
  BarChart3, Megaphone, MessageSquare, FileText,
  DollarSign, AlertTriangle, ClipboardList, Calendar,
  Mail, Users, BookOpen, Heart, Sparkles, Lightbulb,
} from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import { GROQ_MODELS } from '../../services/ai/groqClient'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'

// ─── Role-specific configurations ─────────────────────────────
const ROLE_CONFIG = {
  super_admin: {
    assistantType: 'super_admin',
    assistantName: 'Platform Intelligence',
    placeholder:   'Ask about platform data, churches, or announcements…',
    actions: [
      { icon: BarChart3,     title: 'Platform Summary',    description: 'Summarize usage this month',          prompt: 'Summarize platform usage, active churches, and key trends this month.' },
      { icon: MessageSquare, title: 'Maintenance Notice',  description: 'Draft a system announcement',         prompt: 'Draft a professional maintenance notice for all ChurchFlow churches.' },
      { icon: FileText,      title: 'Subscription Report', description: 'Review subscription health',          prompt: 'What should I look for in subscription reports and which churches might need follow-up?' },
      { icon: Megaphone,     title: 'Platform Update',     description: 'Announce a new feature',              prompt: 'Help me write an announcement about new ChurchFlow features for all churches.' },
    ],
  },
  church_admin: {
    assistantType: 'church_admin',
    assistantName: 'Church Admin Assistant',
    placeholder:   'Ask about members, attendance, SMS drafts, or reports…',
    actions: [
      { icon: MessageSquare, title: 'SMS Reminder',        description: 'Draft a Sunday service SMS',          prompt: 'Draft a warm SMS reminder for Sunday service. Keep it under 160 characters.' },
      { icon: Megaphone,     title: 'Event Announcement',  description: 'Write a church event notice',         prompt: 'Help me write a warm church event announcement with a clear call to action.' },
      { icon: BarChart3,     title: 'Attendance Insight',  description: 'Understand attendance trends',        prompt: 'How can I identify attendance trends and address declining attendance?' },
      { icon: FileText,      title: 'Visitor Follow-up',   description: 'Welcome a first-time visitor',        prompt: 'Write a warm follow-up message for a first-time visitor to our church.' },
    ],
  },
  pastor: {
    assistantType: 'sermon',
    assistantName: 'Pastor Assistant',
    placeholder:   'Ask for sermon ideas, scripture insights, or prayer guidance…',
    actions: [
      { icon: BookOpen,      title: 'Sermon Theme',        description: 'Suggest a Sunday theme',              prompt: 'Suggest a Sunday sermon theme for this week with main scripture and 3 supporting points.' },
      { icon: Sparkles,      title: 'Sermon Outline',      description: 'Build a sermon outline',              prompt: 'Help me build a full sermon outline. Ask me for the scripture and theme first.' },
      { icon: Heart,         title: 'Prayer Points',       description: 'Generate prayer points',              prompt: 'Give me prayer points for this Sunday service — for the congregation, leaders, and community.' },
      { icon: FileText,      title: 'Devotional Draft',    description: 'Write a short devotional',            prompt: 'Help me write a short, warm devotional for our church members.' },
    ],
  },
  treasurer: {
    assistantType: 'treasurer',
    assistantName: 'Finance Assistant',
    placeholder:   'Ask about offerings, expenses, or finance reports…',
    actions: [
      { icon: DollarSign,    title: 'Offering Summary',    description: 'Summarize this month',                prompt: "Help me think through how to summarize this month's offerings for the church leadership." },
      { icon: BarChart3,     title: 'Expense Categories',  description: 'Group expenses smartly',              prompt: 'Suggest the best way to categorize church expenses for clear reporting.' },
      { icon: FileText,      title: 'Finance Report',      description: 'Draft a monthly report',              prompt: 'Help me draft a clear monthly finance report for the pastor and church board.' },
      { icon: AlertTriangle, title: 'Missing Records',     description: 'Find gaps in entries',                prompt: 'What patterns should I look for to spot missing or unusual entries in church finance records?' },
    ],
  },
  secretary: {
    assistantType: 'secretary',
    assistantName: 'Secretary Assistant',
    placeholder:   'Ask for announcements, letters, schedules, or notes…',
    actions: [
      { icon: Megaphone,     title: 'Sunday Announcement', description: 'Draft service announcements',         prompt: 'Draft this Sunday\'s announcements. Keep them warm, brief, and easy to read aloud.' },
      { icon: Mail,          title: 'Church Letter',       description: 'Write a formal letter',               prompt: 'Help me write a formal church letter. Ask me the purpose and recipient first.' },
      { icon: Calendar,      title: 'Event Schedule',      description: 'Build a weekly schedule',             prompt: 'Help me build a clear weekly church event schedule the team can follow.' },
      { icon: ClipboardList, title: 'Meeting Notes',       description: 'Organize meeting notes',              prompt: 'Help me organize raw meeting notes into a clean, structured summary with action items.' },
    ],
  },
  dept_leader: {
    assistantType: 'dept_leader',
    assistantName: 'Ministry Assistant',
    placeholder:   'Ask for meeting ideas, activities, prayer points, or messages…',
    actions: [
      { icon: Users,         title: 'Meeting Reminder',    description: 'Notify your department',              prompt: 'Draft a warm department meeting reminder for our members. Keep it short and personal.' },
      { icon: Lightbulb,     title: 'Activity Ideas',      description: 'Plan a group activity',               prompt: 'Suggest meaningful activity ideas for our ministry group that grow faith and community.' },
      { icon: Heart,         title: 'Prayer Points',       description: 'Prayer for the department',           prompt: 'Give me focused prayer points for our department this week.' },
      { icon: BarChart3,     title: 'Attendance Summary',  description: 'Reflect on participation',            prompt: 'How should I think about department attendance trends and what to do when participation dips?' },
    ],
  },
}

// ─── Helper: map any user role string → config key ────────────
function resolveRoleKey(role, isSuperAdmin) {
  if (isSuperAdmin) return 'super_admin'
  const r = (role || '').toLowerCase()
  if (ROLE_CONFIG[r]) return r
  return 'church_admin' // safe default
}

// ─── Quick action card ────────────────────────────────────────
function QuickActionCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm text-left transition-all group">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-700 group-hover:text-purple-700 transition-colors">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{description}</p>
      </div>
    </button>
  )
}

export default function AdminInsightsAI({ className = '', isSuperAdmin = false, roleOverride = null }) {
  const { user, isSuperAdmin: ctxSuper }   = useAuth()
  const { church } = useChurch()
  const [seedPrompt, setSeedPrompt] = useState(null)
  const [chatKey, setChatKey]       = useState(0)

  const roleKey = resolveRoleKey(roleOverride || user?.profile?.role, isSuperAdmin || ctxSuper)
  const cfg     = ROLE_CONFIG[roleKey]

  const runAction = (prompt) => {
    setSeedPrompt(prompt)
    setChatKey(k => k + 1) // remount chat with new seed
  }

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5">
        {cfg.actions.map((action, i) => (
          <QuickActionCard
            key={i}
            icon={action.icon}
            title={action.title}
            description={action.description}
            color={i % 2 === 0 ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}
            onClick={() => runAction(action.prompt)}
          />
        ))}
      </div>

      {/* Chat panel */}
      <AIChatPanel
        key={chatKey}
        assistantType={cfg.assistantType}
        assistantName={cfg.assistantName}
        placeholder={cfg.placeholder}
        userId={user?.id}
        churchId={church?.id}
        userRole={user?.profile?.role || roleKey}
        model={GROQ_MODELS.BALANCED}
        maxTokens={1024}
        seedPrompt={seedPrompt}
        className="min-h-[360px]"
      />
    </div>
  )
}
