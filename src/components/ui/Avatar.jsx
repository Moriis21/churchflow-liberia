// ============================================================
// ChurchFlow Liberia — Avatar Component
//
// If `bucket` prop is provided:
//   → resolves src/path to a signed URL via imageStorage
//   → signed URLs work in <img> tags without auth headers
// If no bucket:
//   → renders src directly with onError fallback
//
// onError: always falls back to initials — no broken image icon.
// ============================================================
import React, { useState, useEffect } from 'react'
import { getReadableFileUrl } from '../../services/imageStorage'

const sizeClasses = {
  xs: { container: 'w-6 h-6',   text: 'text-[9px]', status: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8',   text: 'text-xs',    status: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', text: 'text-sm',    status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base',  status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-xl',    status: 'w-3.5 h-3.5 border-2' },
}

const statusColors = {
  online:  'bg-emerald-400',
  offline: 'bg-slate-300',
  away:    'bg-amber-400',
}

const nameToColor = (name = '') => {
  const palette = [
    ['bg-violet-600',  'text-white'],
    ['bg-purple-700',  'text-white'],
    ['bg-indigo-600',  'text-white'],
    ['bg-blue-600',    'text-white'],
    ['bg-teal-600',    'text-white'],
    ['bg-emerald-600', 'text-white'],
    ['bg-rose-600',    'text-white'],
    ['bg-amber-500',   'text-amber-950'],
    ['bg-pink-600',    'text-white'],
    ['bg-cyan-600',    'text-white'],
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const Avatar = ({
  src,
  name = '',
  size = 'md',
  showStatus = false,
  status = 'offline',
  className = '',
  // Optional: pass the InsForge storage bucket to get a signed URL
  // Example: bucket="profile-photos" or bucket={BUCKETS.PROFILE_PHOTOS}
  bucket = null,
}) => {
  const sz = sizeClasses[size] || sizeClasses.md
  const initials = getInitials(name)
  const [bgClass, textClass] = nameToColor(name)

  const [resolvedSrc, setResolvedSrc] = useState(null)
  const [imgError,    setImgError]    = useState(false)

  useEffect(() => {
    setImgError(false)

    if (!src) {
      setResolvedSrc(null)
      return
    }

    // Blob / data URIs are immediately displayable
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      setResolvedSrc(src)
      return
    }

    // If a bucket is given, generate a signed URL so the browser
    // can load it without needing custom auth headers.
    if (bucket) {
      getReadableFileUrl(bucket, src)
        .then(url => setResolvedSrc(url || null))
        .catch(() => setResolvedSrc(null))
    } else {
      // No bucket specified — use src directly; onError will catch failures
      setResolvedSrc(src)
    }
  }, [src, bucket])

  const showImage = !!resolvedSrc && !imgError

  return (
    <div className={['relative inline-flex flex-shrink-0', className].join(' ')}>
      {showImage ? (
        <img
          src={resolvedSrc}
          alt={name || 'Avatar'}
          onError={() => setImgError(true)}
          className={[
            sz.container,
            'rounded-full object-cover ring-2 ring-white shadow-sm',
          ].join(' ')}
        />
      ) : (
        <div
          className={[
            sz.container,
            bgClass,
            textClass,
            sz.text,
            'rounded-full flex items-center justify-center font-semibold ring-2 ring-white shadow-sm select-none',
          ].join(' ')}
          aria-label={name || 'User avatar'}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={[
            'absolute bottom-0 right-0 rounded-full border-white',
            sz.status,
            statusColors[status] || statusColors.offline,
          ].join(' ')}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

export default Avatar
