import React from 'react'

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
  suffix,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  id,
  name,
  autoComplete,
  ...rest
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-700 flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-red-500 text-base leading-none" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon
              className={[
                'w-4.5 h-4.5 transition-colors duration-200',
                error ? 'text-red-400' : 'text-slate-400',
              ].join(' ')}
              aria-hidden="true"
            />
          </div>
        )}

        <input
          id={inputId}
          name={name || inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={[
            'w-full rounded-xl border text-sm text-slate-800 bg-white',
            inputClassName,
            'placeholder:text-slate-400',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            Icon ? 'pl-10' : 'pl-4',
            suffix ? 'pr-12' : 'pr-4',
            'py-2.5',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-slate-200 focus:border-purple-500 focus:ring-purple-100 hover:border-slate-300',
            disabled
              ? 'bg-slate-50 text-slate-400 cursor-not-allowed opacity-70'
              : '',
          ].join(' ')}
          {...rest}
        />

        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-sm text-slate-400 font-medium">{suffix}</span>
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          className="text-xs text-red-500 flex items-center gap-1 mt-0.5"
          role="alert"
        >
          <svg
            className="w-3.5 h-3.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

export default Input
