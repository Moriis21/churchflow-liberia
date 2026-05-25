// ============================================================
// ChurchFlow Liberia — In-app Media Player Modal
//
// Renders a responsive video player for a media_resources row.
// Supports YouTube, Vimeo, and direct MP4. Falls back to an
// "Open Externally" CTA when the resource isn't embeddable
// (apps, websites, channels).
// ============================================================
import React, { useEffect, useState } from 'react'
import { X, ExternalLink, Bookmark, Share2, Sparkles, MessageCircleQuestion, BookOpen, Loader2 } from 'lucide-react'
import { resolveEmbed } from '../../services/mediaService'
import { getOrGenerateAi, aiKindLabel } from '../../services/ai/videoAi'
import toast from 'react-hot-toast'

const AI_TABS = [
  { kind: 'summary',    icon: Sparkles,             label: 'Summary' },
  { kind: 'questions',  icon: MessageCircleQuestion, label: 'Discussion' },
  { kind: 'devotional', icon: BookOpen,             label: 'Devotional' },
]

export default function MediaPlayerModal({ resource, onClose }) {
  const [aiTab,    setAiTab]    = useState(null)   // null = AI panel collapsed
  const [aiBusy,   setAiBusy]   = useState(false)
  const [aiError,  setAiError]  = useState('')
  const [aiContent,setAiContent]= useState('')
  const [aiCached, setAiCached] = useState(false)

  // Esc to close
  useEffect(() => {
    if (!resource) return
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [resource, onClose])

  // Reset AI panel state when resource changes
  useEffect(() => {
    setAiTab(null); setAiBusy(false); setAiError(''); setAiContent(''); setAiCached(false)
  }, [resource?.id])

  async function openAiTab(kind) {
    setAiTab(kind); setAiError(''); setAiContent('')
    if (!resource) return
    setAiBusy(true)
    try {
      const { content, cached } = await getOrGenerateAi(resource, kind)
      setAiContent(content)
      setAiCached(!!cached)
    } catch (err) {
      setAiError(err?.userMessage || err?.message || 'AI failed.')
    } finally {
      setAiBusy(false)
    }
  }

  if (!resource) return null

  const embed = resolveEmbed(resource)
  const canEmbed = embed && resource.resource_type !== 'app' && resource.resource_type !== 'website' && resource.resource_type !== 'channel' && resource.resource_type !== 'download'
  // External URL we can attempt to iframe in-app when no proper video embed exists.
  // Some sites set X-Frame-Options: DENY and will show blank — the "Open in new tab"
  // link below the iframe is the graceful fallback for those cases.
  const externalUrl = resource.external_url || resource.video_url || ''
  const canIframeExternal = !canEmbed && /^https:\/\//i.test(externalUrl)

  async function handleShare() {
    const url = resource.external_url || resource.video_url || resource.embed_url || window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, text: resource.description, url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard.')
      }
    } catch { /* user cancelled */ }
  }

  function handleSave() {
    // Lightweight local favorites — persists per-device in localStorage
    try {
      const raw = localStorage.getItem('cf_saved_resources') || '[]'
      const ids = new Set(JSON.parse(raw))
      if (ids.has(resource.id)) {
        ids.delete(resource.id)
        toast.success('Removed from saved.')
      } else {
        ids.add(resource.id)
        toast.success('Saved.')
      }
      localStorage.setItem('cf_saved_resources', JSON.stringify(Array.from(ids)))
    } catch {
      toast.error('Could not save.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog" aria-modal="true"
    >
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600">
              {(resource.provider || '').replace('_', ' ')}
            </p>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 truncate">
              {resource.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Player area */}
        <div className="bg-black flex-shrink-0">
          {canEmbed && embed?.type === 'mp4' ? (
            <video
              key={embed.src}
              src={embed.src}
              controls
              className="w-full aspect-video bg-black"
            />
          ) : canEmbed && embed ? (
            <div className="relative w-full aspect-video">
              <iframe
                key={embed.src}
                src={embed.src}
                title={resource.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : canIframeExternal ? (
            <div className="relative w-full bg-white" style={{ height: 'min(70vh, 640px)' }}>
              <iframe
                key={externalUrl}
                src={externalUrl}
                title={resource.title}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
              />
              <a
                href={externalUrl}
                target="_blank" rel="noopener noreferrer"
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/90 hover:bg-white text-[#5B00B8] shadow-md backdrop-blur-sm"
              >
                Open in new tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-[#151022] to-[#5B00B8] text-white">
              <p className="text-sm font-semibold mb-2">This resource isn't embeddable.</p>
              <p className="text-xs text-white/70 mb-4 max-w-md">
                No preview is available for this {(resource.resource_type || 'item').replace('_', ' ')}.
              </p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto">
          {resource.description && (
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{resource.description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            {resource.speaker && <span><strong className="text-slate-700">{resource.speaker}</strong></span>}
            {Array.isArray(resource.tags) && resource.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {resource.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-semibold">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI panel */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-500" /> AI Companion
            </span>
            {AI_TABS.map((t) => {
              const Icon = t.icon
              const active = aiTab === t.kind
              return (
                <button
                  key={t.kind}
                  onClick={() => openAiTab(t.kind)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-gradient-to-r from-[#151022] to-[#5B00B8] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> {t.label}
                </button>
              )
            })}
          </div>

          {aiTab && (
            <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50/40 to-white p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-slate-800">{aiKindLabel(aiTab)}</p>
                {aiCached && !aiBusy && !aiError && (
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">cached</span>
                )}
              </div>
              {aiBusy ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating…
                </div>
              ) : aiError ? (
                <p className="text-xs text-red-600">{aiError}</p>
              ) : (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {aiContent}
                </div>
              )}
              <p className="text-[10px] text-slate-400 mt-3 italic">
                AI-generated · review for accuracy before teaching from it.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center gap-2 justify-end">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <Bookmark className="w-3.5 h-3.5" /> Save
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          {(resource.external_url || resource.video_url) && (
            <a
              href={resource.external_url || resource.video_url}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-600 hover:bg-purple-50"
            >
              Open externally <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
