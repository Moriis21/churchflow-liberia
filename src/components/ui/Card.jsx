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
        // Frosted-glass surface: high white opacity keeps dense data crisp,
        // thin white border + soft purple shadow give the premium glass feel.
        'bg-white/75 backdrop-blur-xl rounded-[20px] border border-white/70',
        'shadow-[0_8px_28px_-10px_rgba(91,0,184,0.14),inset_0_1px_0_rgba(255,255,255,0.6)]',
        hover
          ? 'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_36px_-8px_rgba(91,0,184,0.22)] cursor-pointer'
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
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#F7F4FF] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#8A19FF]" aria-hidden="true" />
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
