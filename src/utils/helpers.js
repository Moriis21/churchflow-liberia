// ============================================================
// ChurchFlow Liberia — Utility / Helper Functions
// ============================================================

/**
 * Format a numeric amount with its currency code.
 * @param {number} amount
 * @param {string} currency  'LRD' | 'USD'
 * @returns {string}  e.g. "LRD 125,750" or "USD 89"
 */
export function formatCurrency(amount, currency = 'LRD') {
  const formatted = Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${currency} ${formatted}`
}

/**
 * Format an ISO date string or Date object as a readable date.
 * @param {string|Date} date
 * @returns {string}  e.g. "May 18, 2026"
 */
export function formatDate(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format a 24-hour time string as 12-hour AM/PM.
 * @param {string} time  e.g. "09:00" or "14:30"
 * @returns {string}  e.g. "9:00 AM" or "2:30 PM"
 */
export function formatTime(time) {
  if (!time) return '—'
  const [hourStr, minuteStr] = time.split(':')
  let hours = parseInt(hourStr, 10)
  const minutes = minuteStr || '00'
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${hours}:${minutes} ${meridiem}`
}

/**
 * Return the initials from a full name (up to two letters).
 * @param {string} name  e.g. "James Kollie"
 * @returns {string}  e.g. "JK"
 */
export function getInitials(name) {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Return Tailwind CSS classes for a status badge.
 * Covers membership, follow-up, prayer, and event statuses.
 * @param {string} status
 * @returns {string}  Tailwind class string
 */
export function getStatusColor(status) {
  const map = {
    // Membership
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-600',
    new: 'bg-blue-100 text-blue-800',

    // Follow-up / visitor
    pending: 'bg-yellow-100 text-yellow-800',
    contacted: 'bg-purple-100 text-purple-800',
    converted: 'bg-green-100 text-green-800',

    // Prayer
    open: 'bg-orange-100 text-orange-800',
    answered: 'bg-green-100 text-green-800',

    // Events
    upcoming: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-gray-100 text-gray-600',

    // Finance
    tithe: 'bg-purple-100 text-purple-800',
    offering: 'bg-blue-100 text-blue-800',
    thanksgiving: 'bg-yellow-100 text-yellow-800',
    building_fund: 'bg-orange-100 text-orange-800',
    donation: 'bg-teal-100 text-teal-800',

    // Prayer types
    public: 'bg-sky-100 text-sky-800',
    private: 'bg-gray-100 text-gray-600',
    pastor_only: 'bg-red-100 text-red-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

/**
 * Return a hex colour for a department name.
 * Falls back to a neutral grey.
 * @param {string} dept  Department name
 * @returns {string}  Hex colour string
 */
export function getDepartmentColor(dept) {
  const map = {
    Choir: '#8B5CF6',
    Ushering: '#F59E0B',
    Media: '#3B82F6',
    'Youth Ministry': '#EC4899',
    'Women Ministry': '#F97316',
    'Men Ministry': '#06B6D4',
    'Children Ministry': '#10B981',
    Evangelism: '#EF4444',
    'Prayer Team': '#6366F1',
  }
  return map[dept] ?? '#9CA3AF'
}

/**
 * Calculate a person's age from their date of birth.
 * @param {string|Date} dob  ISO date string or Date object
 * @returns {number}  Age in years, or 0 if invalid
 */
export function calculateAge(dob) {
  if (!dob) return 0
  const birth = typeof dob === 'string' ? new Date(dob) : dob
  if (isNaN(birth.getTime())) return 0
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

/**
 * Return a time-appropriate greeting.
 * @returns {string}  "Good Morning", "Good Afternoon", or "Good Evening"
 */
export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

/**
 * Truncate a string to n characters, appending "…" if needed.
 * @param {string} str
 * @param {number} n   Maximum character count
 * @returns {string}
 */
export function truncate(str, n = 80) {
  if (!str) return ''
  if (str.length <= n) return str
  return str.slice(0, n).trimEnd() + '…'
}

/**
 * Format a Liberian phone number for display.
 * Accepts digits-only or strings with dashes/spaces/+.
 * Outputs: +231 770 123 456 or +231 886 123 456
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '—'
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '')
  // Liberia country code: 231; local numbers are 9 digits (e.g. 0770123456 or 770123456)
  const digits = cleaned.replace(/^\+/, '')
  if (digits.startsWith('231') && digits.length === 12) {
    // +231 XXX XXX XXX
    const network = digits.slice(3, 6)
    const part1 = digits.slice(6, 9)
    const part2 = digits.slice(9, 12)
    return `+231 ${network} ${part1} ${part2}`
  }
  if (!digits.startsWith('231') && digits.length === 9) {
    const network = digits.slice(0, 3)
    const part1 = digits.slice(3, 6)
    const part2 = digits.slice(6, 9)
    return `+231 ${network} ${part1} ${part2}`
  }
  // Return as-is if format is unrecognised
  return phone
}
