import React from 'react'

const DefaultIcon = () => (
  <svg
    className="w-10 h-10 text-purple-400"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
    />
  </svg>
)

const EmptyState = ({
  title = 'Nothing here yet',
  description,
  icon: Icon,
  action,
  className = '',
}) => {
  const IconComponent = Icon || DefaultIcon

  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6 rounded-2xl',
        'bg-gradient-to-b from-violet-50/60 to-purple-50/30',
        'border border-dashed border-violet-200',
        className,
      ].join(' ')}
    >
      {/* Icon circle */}
      <div className="mb-5 w-20 h-20 rounded-2xl bg-white shadow-[0_4px_20px_-4px_rgba(124,58,237,0.15)] border border-violet-100 flex items-center justify-center">
        {Icon ? (
          <Icon className="w-10 h-10 text-purple-500" aria-hidden="true" />
        ) : (
          <DefaultIcon />
        )}
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-slate-700 mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* CTA */}
      {action && (
        <div className="mt-1">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
