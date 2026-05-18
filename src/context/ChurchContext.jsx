// ============================================================
// ChurchFlow Liberia — Church Context
// No default dummy data — everything comes from the database.
// Super admins have no church; church users load their church
// after login via AuthContext → fetchUserProfile.
// ============================================================
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { insforge } from '../lib/insforge'

// ─── Context ─────────────────────────────────────────────────
const ChurchContext = createContext({
  church: null,
  branches: [],
  currentBranch: null,
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
