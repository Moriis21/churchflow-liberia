import React from 'react'

const colorConfig = {
  purple: {
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-700',
    iconText: 'text-white', accent: 'text-purple-600', tint: 'tint-lavender',
  },
  gold: {
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
    iconText: 'text-amber-950', accent: 'text-amber-600', tint: 'tint-cream',
  },
  green: {
    iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    iconText: 'text-white', accent: 'text-emerald-600', tint: 'tint-mint',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    iconText: 'text-white', accent: 'text-blue-600', tint: 'tint-blue',
  },
  navy: {
    iconBg: 'bg-gradient-to-br from-indigo-800 to-[#151022]',
    iconText: 'text-white', accent: 'text-indigo-700', tint: 'tint-violet',
  },
  rose: {
    iconBg: 'bg-gradient-to-br from-rose-400 to-red-600',
    iconText: 'text-white', accent: 'text-rose-600', tint: 'tint-aqua',
  },
}

const TrendUp = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
)

const TrendDown = () => (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 015.814 5.519l2.74 1.22m0 0l-5.94 2.28m5.94-2.28l-2.28-5.941" />
  </svg>
)

const StatsCard = ({
  title,
  value,
  change,
  changeType = 'up',
  icon: Icon,
  color = 'purple',
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const cfg = colorConfig[color] || colorConfig.purple

  return (
    <div
      className={[
        // Pastel-tinted frosted card (matches the glassmorphism reference)
        cfg.tint,
        'rounded-2xl border border-white/70 backdrop-blur-xl p-5 flex flex-col gap-4',
        'transition-all duration-300 ease-out hover:-translate-y-0.5',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        {/* Value + Title */}
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
          <p className="text-2xl font-bold text-slate-800 leading-none tracking-tight">
            {prefix && <span className="text-lg font-semibold text-slate-500">{prefix}</span>}
            {value}
            {suffix && <span className="text-lg font-semibold text-slate-500 ml-0.5">{suffix}</span>}
          </p>
        </div>

        {/* Icon */}
        {Icon && (
          <div
            className={[
              'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
              `shadow-lg ${cfg.glow}`,
              cfg.iconBg,
            ].join(' ')}
          >
            <Icon className={['w-5 h-5', cfg.iconText].join(' ')} aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Trend */}
      {change !== undefined && change !== null && (
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full',
              changeType === 'up'
                ? 'text-emerald-700 bg-emerald-50'
                : 'text-red-600 bg-red-50',
            ].join(' ')}
          >
            {changeType === 'up' ? <TrendUp /> : <TrendDown />}
            {change}
          </span>
          <span className="text-xs text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  )
}

export default StatsCard
