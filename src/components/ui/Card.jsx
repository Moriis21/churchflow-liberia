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
        'bg-white rounded-[20px] border border-[#E4E7EC]',
        'shadow-[0_1px_2px_rgba(21,16,34,0.04),0_1px_3px_rgba(21,16,34,0.06)]',
        hover
          ? 'transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(21,16,34,0.10)] cursor-pointer'
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
