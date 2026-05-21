// ============================================================
// ChurchFlow Liberia — useAIFeature hook
// Checks if an AI feature is enabled before rendering.
// ============================================================
import { useState, useEffect } from 'react'
import { isFeatureEnabled } from '../services/ai/conversationService'

export function useAIFeature(featureName) {
  const [enabled, setEnabled] = useState(true)  // optimistic default
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    isFeatureEnabled(featureName)
      .then(result => { setEnabled(result); setLoading(false) })
      .catch(() => { setEnabled(true); setLoading(false) })
  }, [featureName])

  return { enabled, loading }
}
