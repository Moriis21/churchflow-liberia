import React from 'react'

const variantClasses = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger:  'bg-red-50 text-red-600 border border-red-200',
  info:    'bg-blue-50 text-blue-700 border border-blue-200',
  purple:  'bg-violet-50 text-violet-700 border border-violet-200',
  gold:    'bg-amber-100 text-amber-800 border border-amber-300',
  gray:    'bg-slate-100 text-slate-600 border border-slate-200',
  navy:    'bg-indigo-950 text-indigo-200 border border-indigo-800',
}

const dotColors = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-violet-600',
  gold:    'bg-amber-500',
  gray:    'bg-slate-400',
  navy:    'bg-indigo-400',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
}

const Badge = ({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full font-medium leading-tight',
        variantClasses[variant] || variantClasses.gray,
        sizeClasses[size] || sizeClasses.md,
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          className={[
            'rounded-full flex-shrink-0',
            size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
            dotColors[variant] || dotColors.gray,
          ].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export default Badge
