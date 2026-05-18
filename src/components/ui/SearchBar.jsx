import React, { useState, useRef } from 'react'

const SearchIcon = () => (
  <svg
    className="w-4.5 h-4.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 10.607z" />
  </svg>
)

const FilterIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
  </svg>
)

const ChevronIcon = ({ open }) => (
  <svg
    className={['w-3.5 h-3.5 transition-transform duration-200', open ? 'rotate-180' : ''].join(' ')}
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  onFilter,
  filters = [],
  className = '',
}) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!filterOpen) return
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [filterOpen])

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter)
    setFilterOpen(false)
    onFilter?.(filter)
  }

  return (
    <div className={['relative flex items-center gap-2', className].join(' ')}>
      {/* Search input */}
      <div className="relative flex-1">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="search"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={[
            'w-full pl-10 pr-4 py-2.5 rounded-xl text-sm',
            'bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400',
            'transition-all duration-200 ease-in-out',
            'focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500',
            'hover:border-slate-300',
          ].join(' ')}
        />
      </div>

      {/* Filter button */}
      {filters.length > 0 && (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className={[
              'inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium',
              'border transition-all duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-purple-100 focus:ring-offset-0',
              activeFilter
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50',
            ].join(' ')}
            aria-expanded={filterOpen}
            aria-haspopup="listbox"
          >
            <FilterIcon />
            <span className="hidden sm:inline">
              {activeFilter ? activeFilter.label || activeFilter : 'Filter'}
            </span>
            <ChevronIcon open={filterOpen} />
          </button>

          {/* Dropdown */}
          {filterOpen && (
            <div
              role="listbox"
              className={[
                'absolute right-0 mt-2 min-w-[160px] bg-white rounded-xl border border-slate-100',
                'shadow-lg shadow-slate-200/70 z-20',
                'overflow-hidden',
                'animate-[fadeSlideIn_0.15s_ease-out]',
              ].join(' ')}
              style={{ animation: 'fadeSlideIn 0.15s ease-out' }}
            >
              {/* Clear option */}
              {activeFilter && (
                <button
                  role="option"
                  aria-selected={false}
                  onClick={() => handleFilterSelect(null)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors duration-100 border-b border-slate-100"
                >
                  Clear filter
                </button>
              )}
              {filters.map((filter, idx) => {
                const label = typeof filter === 'string' ? filter : filter.label
                const isActive = activeFilter === filter
                return (
                  <button
                    key={idx}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleFilterSelect(filter)}
                    className={[
                      'w-full text-left px-4 py-2.5 text-sm transition-colors duration-100',
                      isActive
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default SearchBar
