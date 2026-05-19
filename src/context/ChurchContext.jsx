// ============================================================
// ChurchFlow Liberia — Church Context
// No default dummy data — everything comes from the database.
// Super admins have no church; church users load their church
// after login via AuthContext → fetchUserProfile.
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { insforge } from '../lib/insforge'

// ─── Exchange rates (LRD base) ────────────────────────────────
const EXCHANGE_RATES = { LRD: 1, USD: 194, EUR: 212, GBP: 248, NGN: 0.13 }
const CURRENCY_SYMBOLS = { LRD: 'LRD', USD: '$', EUR: '€', GBP: '£', NGN: '₦' }

// ─── Context ─────────────────────────────────────────────────
const ChurchContext = createContext({
  church: null,
  branches: [],
  currentBranch: null,
  displayCurrency: 'LRD',
  setDisplayCurrency: () => {},
  formatMoney: (n) => `LRD ${n}`,
  convertAmount: (n) => n,
  setCurrentBranch: () => {},
  updateChurch: () => {},
  switchBranch: () => {},
  loadingChurch: false,
})

// ─── Provider ────────────────────────────────────────────────
export function ChurchProvider({ children }) {
  const { user, churchData, isSuperAdmin } = useAuth()

  const [church, setChurch] = useState(null)
  const [branches, setBranches] = useState([])
  const [currentBranch, setCurrentBranch] = useState(null)
  const [loadingChurch, setLoadingChurch] = useState(false)
  const [displayCurrency, setDisplayCurrency] = useState('LRD')

  // Sync display currency to church's preferred currency
  useEffect(() => {
    if (church?.currency) setDisplayCurrency(church.currency)
  }, [church?.currency])

  /** Convert amount FROM its stored currency TO the currently displayed currency */
  function convertAmount(amount, fromCurrency = 'LRD') {
    if (!amount) return 0
    const inLRD = Number(amount) * (EXCHANGE_RATES[fromCurrency] || 1)
    return inLRD / (EXCHANGE_RATES[displayCurrency] || 1)
  }

  /** Format amount with currency symbol */
  function formatMoney(amount, fromCurrency = 'LRD') {
    const val = convertAmount(amount, fromCurrency)
    const sym = CURRENCY_SYMBOLS[displayCurrency] || displayCurrency
    const fmt = val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    return displayCurrency === 'LRD' ? `LRD ${fmt}` : `${sym}${fmt}`
  }

  // ── When churchData arrives from AuthContext, set it ─────
  useEffect(() => {
    if (isSuperAdmin) {
      // Super admin sees platform-wide data — no church context
      setChurch(null)
      setBranches([])
      setCurrentBranch(null)
      return
    }

    if (churchData) {
      setChurch(churchData)
      // Load branches for this church
      loadBranches(churchData.id)
    } else {
      setChurch(null)
      setBranches([])
      setCurrentBranch(null)
    }
  }, [churchData, isSuperAdmin])

  // ── Load branches from InsForge ──────────────────────────
  async function loadBranches(churchId) {
    if (!churchId) return
    setLoadingChurch(true)
    try {
      // Also try to refresh church data via SECURITY DEFINER RPC
      // This ensures logo_url and other fields persist after page reload
      const { data: freshChurch } = await insforge.database
        .rpc('get_church_by_id', { p_church_id: churchId })
      if (freshChurch) setChurch(freshChurch)

      const { data } = await insforge.database
        .from('branches')
        .select('*')
        .eq('church_id', churchId)
        .order('is_main', { ascending: false })

      if (data?.length) {
        setBranches(data)
        // Default to main branch
        const main = data.find(b => b.is_main) || data[0]
        setCurrentBranch(main)
      }
    } catch (err) {
      console.error('[ChurchContext] loadBranches error:', err.message)
    } finally {
      setLoadingChurch(false)
    }
  }

  function updateChurch(updates) {
    setChurch(prev => prev ? { ...prev, ...updates } : updates)
  }

  function switchBranch(branchId) {
    const found = branches.find(b => b.id === branchId)
    if (found) setCurrentBranch(found)
  }

  return (
    <ChurchContext.Provider
      value={{
        church,
        branches,
        currentBranch,
        displayCurrency,
        setDisplayCurrency,
        formatMoney,
        convertAmount,
        setCurrentBranch,
        updateChurch,
        switchBranch,
        loadingChurch,
      }}
    >
      {children}
    </ChurchContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────
export function useChurch() {
  const context = useContext(ChurchContext)
  if (!context) throw new Error('useChurch must be used within a ChurchProvider')
  return context
}

export default ChurchContext
