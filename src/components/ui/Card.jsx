import React from 'react'

const paddingMap = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const paddingClass = paddingMap[padding] ?? paddingMap.md
  const hasHeader = title || Icon || action

  return (
    <div
      className={[
        'bg-white rounded-2xl border border-slate-100',
        'shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]',
        hover
          ? 'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_30px_-4px_rgba(124,58,237,0.15),0_20px_40px_-4px_rgba(0,0,0,0.08)] cursor-pointer'
          : '',
        className,
      ].join(' ')}
    >
      {hasHeader && (
        <div
          className={[
            'flex items-start justify-between',
            paddingClass,
            children ? 'pb-0' : '',
          ].join(' ')}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && (
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-50 to-purple-100 flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-600" aria-hidden="true" />
              </div>
            )}
            {(title || subtitle) && (
              <div className="min-w-0 flex-1">
                {title && (
                  <h3 className="text-base font-semibold text-slate-800 truncate leading-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-slate-500 mt-0.5 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )}

      {children && (
        <div className={paddingClass}>
          {children}
        </div>
      )}
    </div>
  )
}

export default Card
