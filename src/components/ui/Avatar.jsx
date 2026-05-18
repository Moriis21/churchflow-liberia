import React from 'react'

const sizeClasses = {
  xs: { container: 'w-6 h-6', text: 'text-[9px]', status: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8', text: 'text-xs',   status: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10', text: 'text-sm',  status: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12', text: 'text-base', status: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16', text: 'text-xl',  status: 'w-3.5 h-3.5 border-2' },
}

const statusColors = {
  online:  'bg-emerald-400',
  offline: 'bg-slate-300',
  away:    'bg-amber-400',
}

// Generate a consistent color from a name string
const nameToColor = (name = '') => {
  const palette = [
    ['bg-violet-600', 'text-white'],
    ['bg-purple-700', 'text-white'],
    ['bg-indigo-600', 'text-white'],
    ['bg-blue-600',   'text-white'],
    ['bg-teal-600',   'text-white'],
    ['bg-emerald-600','text-white'],
    ['bg-rose-600',   'text-white'],
    ['bg-amber-500',  'text-amber-950'],
    ['bg-pink-600',   'text-white'],
    ['bg-cyan-600',   'text-white'],
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
}) => {
  const sz = sizeClasses[size] || sizeClasses.md
  const initials = getInitials(name)
  const [bgClass, textClass] = nameToColor(name)

  return (
    <div className={['relative inline-flex flex-shrink-0', className].join(' ')}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
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
