// ============================================================
// ChurchFlow Liberia — Bible Study AI
// Helps church members explore, understand, and apply
// the Bible in a friendly, conversational way.
// ============================================================
import React, { useState } from 'react'
import { motion } from 'motion/react'
import { BookOpen, Sparkles, Heart } from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import { GROQ_MODELS } from '../../services/ai/groqClient'
import { useAuth } from '../../context/AuthContext'
import { useChurch } from '../../context/ChurchContext'

// Quick-topic buttons for common Bible themes
const QUICK_TOPICS = [
  { emoji: '🙏', label: 'Prayer',        prompt: 'What does the Bible say about prayer and how should I pray?' },
  { emoji: '💪', label: 'Faith',         prompt: 'Explain what faith means in the Bible, especially Hebrews 11' },
  { emoji: '❤️',  label: 'Love',          prompt: 'What does the Bible teach about love? Explain 1 Corinthians 13' },
  { emoji: '🕊️', label: 'Forgiveness',   prompt: 'What does the Bible say about forgiveness and how do I forgive others?' },
  { emoji: '✨',  label: 'Grace',         prompt: 'Explain grace in the Bible in simple terms' },
  { emoji: '🎯',  label: 'Purpose',       prompt: 'What does the Bible say about finding my purpose in life?' },
  { emoji: '📖',  label: 'Reading Plan',  prompt: 'Give me a simple 7-day Bible reading plan for a new believer' },
  { emoji: '🌟',  label: 'Salvation',     prompt: 'Explain what salvation means in the Bible simply' },
]

export default function BibleStudyAI({ className = '' }) {
  const { user }   = useAuth()
  const { church } = useChurch()
  const [activePrompt, setActivePrompt] = useState(null)

  return (
    <div className={`space-y-4 ${className}`}>

      {/* Quick topic pills */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2.5">
          Explore a topic
        </p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TOPICS.map(t => (
            <motion.button
              key={t.label}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActivePrompt(t.prompt)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                activePrompt === t.prompt
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50'
              }`}
            >
              <span>{t.emoji}</span>
              {t.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      <AIChatPanel
        assistantType="bible"
        assistantName="Bible Companion"
        placeholder="Ask about any verse, book, character, or topic…"
        userId={user?.id}
        churchId={church?.id}
        userRole={user?.profile?.role || 'member'}
        model={GROQ_MODELS.SMART}
        maxTokens={1024}
        className="min-h-[400px]"
        key={activePrompt} // reset chat when topic changes
      />

      {/* Encouragement footer */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
        <Heart className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          The Bible Companion is here to help you understand scripture. For personal spiritual guidance, always speak with your pastor or a trusted church leader.
        </p>
      </div>
    </div>
  )
}
