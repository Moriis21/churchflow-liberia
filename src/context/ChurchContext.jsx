// ============================================================
// ChurchFlow Liberia — Church Context
// ============================================================
import { createContext, useContext, useState } from 'react'
import { BRANCHES } from '../data/dummyData'

// ─── Default church configuration ────────────────────────────
const DEFAULT_CHURCH = {
  id: 'church-001',
  name: 'Grace Community Church',
  location: 'Monrovia, Liberia',
  currency: 'LRD',
  logo: null,
  phone: '+231-770-000-001',
  email: 'info@gracechurch.lr',
  website: 'www.gracechurch.lr',
  founded: '2005-01-15',
  denomination: 'Pentecostal',
  motto: 'Building Lives, Transforming Communities',
}

// ─── Context creation ─────────────────────────────────────────
const ChurchContext = createContext({
  church: DEFAULT_CHURCH,
  setChurch: () => {},
  currentBranch: null,
  setCurrentBranch: () => {},
  branches: BRANCHES,
})

// ─── Provider ────────────────────────────────────────────────
export function ChurchProvider({ children }) {
  const [church, setChurch] = useState(DEFAULT_CHURCH)

  // Default to the Main Campus branch (index 0)
  const [currentBranch, setCurrentBranch] = useState(BRANCHES[0])

  /**
   * Update church details (e.g. after fetching from the database).
   * Merges partial updates rather than replacing the whole object.
   * @param {Partial<typeof DEFAULT_CHURCH>} updates
   */
  function updateChurch(updates) {
    setChurch((prev) => ({ ...prev, ...updates }))
  }

  /**
   * Switch the active branch by branch id.
   * Falls back to the first branch if not found.
   * @param {string} branchId
   */
  function switchBranch(branchId) {
    const found = BRANCHES.find((b) => b.id === branchId)
    setCurrentBranch(found ?? BRANCHES[0])
  }

  // ─────────────────────────────────────────────────────────
  return (
    <ChurchContext.Provider
      value={{
        church,
        setChurch,
        updateChurch,
        currentBranch,
        setCurrentBranch,
        switchBranch,
        branches: BRANCHES,
      }}
    >
      {children}
    </ChurchContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────
export function useChurch() {
  const context = useContext(ChurchContext)
  if (!context) {
    throw new Error('useChurch must be used within a ChurchProvider')
  }
  return context
}

export default ChurchContext
