import React from 'react'

const variants = {
  primary:
    'bg-[#8A19FF] text-white shadow-[0_4px_14px_rgba(138,25,255,0.30)] hover:bg-[#5B00B8] hover:shadow-[0_6px_20px_rgba(138,25,255,0.40)] focus:ring-[#8A19FF]',
  secondary:
    'bg-white border border-[#8A19FF] text-[#5B00B8] hover:bg-[#F7F4FF] hover:border-[#5B00B8] focus:ring-[#8A19FF]',
  ghost:
    'bg-transparent text-[#5B00B8] hover:bg-[#F7F4FF] hover:text-[#8A19FF] focus:ring-[#8A19FF]',
  danger:
    'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 focus:ring-red-500',
  gold:
    'bg-amber-400 text-[#151022] shadow-[0_4px_14px_rgba(245,158,11,0.30)] hover:bg-amber-500 hover:shadow-[0_6px_20px_rgba(245,158,11,0.40)] focus:ring-amber-400',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-7 py-3.5 text-base gap-2.5',
}

const iconSizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const Spinner = ({ size }) => (
  <svg
    className={`animate-spin ${iconSizes[size]}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
)

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-semibold rounded-xl',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'select-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        isDisabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {loading ? (
        <>
          <Spinner size={size} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon className={iconSizes[size]} aria-hidden="true" />
          )}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && (
            <Icon className={iconSizes[size]} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  )
}

export default Button
