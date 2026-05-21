// ============================================================
// ChurchFlow Liberia — Admin Insights AI
// Smart assistant for church admins and super admins.
// Helps with reports, announcements, SMS, and analysis.
// ============================================================
import React from 'react'
import { BarChart3, Megaphone, MessageSquare, FileText } from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import { GROQ_MODELS } from '../../services/ai/groqClient'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'

// Quick action cards shown above the chat
function QuickActionCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex items-start gap-3 p-3.5 bg-white rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm text-left transition-all group`}>
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

export default function AdminInsightsAI({ className = '', isSuperAdmin = false }) {
  const { user }   = useAuth()
  const { church } = useChurch()

  const assistantType = isSuperAdmin ? 'super_admin' : 'church_admin'
  const assistantName = isSuperAdmin ? 'Platform Intelligence' : 'Church Admin Assistant'

  const quickActions = isSuperAdmin ? [
    { icon: BarChart3,     title: 'Platform Summary',     description: 'Summarize usage this month',             prompt: 'Summarize platform usage, active churches, and key trends this month' },
    { icon: MessageSquare, title: 'Maintenance Notice',   description: 'Draft a system announcement',            prompt: 'Draft a professional maintenance notice for all ChurchFlow churches' },
    { icon: FileText,      title: 'Subscription Report',  description: 'Review subscription health',             prompt: 'Help me think through what to look for in subscription reports and who might need follow-up' },
    { icon: Megaphone,     title: 'Platform Update',      description: 'Write a new feature announcement',       prompt: 'Help me write an announcement about new ChurchFlow features for all churches' },
  ] : [
    { icon: MessageSquare, title: 'SMS Reminder',         description: 'Draft a Sunday service SMS',             prompt: 'Draft a warm SMS reminder for Sunday service this week. Keep it friendly and under 160 characters' },
    { icon: Megaphone,     title: 'Event Announcement',   description: 'Write a church event notice',            prompt: 'Help me write a church event announcement. It should be warm, clear, and include a call to action' },
    { icon: BarChart3,     title: 'Attendance Insight',   description: 'Understand attendance trends',           prompt: 'Explain how I can identify attendance trends in my church and what to do about declining attendance' },
    { icon: FileText,      title: 'Follow-up Message',    description: 'Write a visitor follow-up',              prompt: 'Write a warm follow-up message for first-time visitors to our church. Make it personal and welcoming' },
  ]

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5">
        {quickActions.map((action, i) => (
          <QuickActionCard
            key={i}
            icon={action.icon}
            title={action.title}
            description={action.description}
            color={i % 2 === 0 ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}
            onClick={() => {/* prompt handled inside AIChatPanel via key reset */}}
          />
        ))}
      </div>

      {/* Chat panel */}
      <AIChatPanel
        assistantType={assistantType}
        assistantName={assistantName}
        placeholder={isSuperAdmin
          ? 'Ask about platform data, churches, or announcements…'
          : 'Ask about members, attendance, SMS drafts, or reports…'
        }
        userId={user?.id}
        churchId={church?.id}
        userRole={user?.profile?.role || assistantType}
        model={GROQ_MODELS.BALANCED}
        maxTokens={1024}
        className="min-h-[360px]"
      />
    </div>
  )
}
