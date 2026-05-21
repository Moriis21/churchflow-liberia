// ============================================================
// ChurchFlow Liberia — AI Conversation Service
// Handles saving conversations, messages, outputs, and usage.
// ============================================================
import { insforge } from '../../lib/insforge'

// ─── Start a new conversation ────────────────────────────────
export async function startConversation({ userId, churchId, role, assistantType, title }) {
  try {
    const { data } = await insforge.database.rpc('save_ai_conversation', {
      p_user_id:      userId || null,
      p_church_id:    churchId || null,
      p_role:         role || 'visitor',
      p_assistant_type: assistantType,
      p_title:        title || 'New conversation',
    })
    return data
  } catch { return null }
}

// ─── Save a message to an existing conversation ───────────────
export async function saveMessage({ conversationId, sender, message, metadata = {} }) {
  if (!conversationId) return
  try {
    await insforge.database.rpc('save_ai_message', {
      p_conversation_id: conversationId,
      p_sender:          sender,
      p_message:         message,
      p_metadata:        metadata,
    })
  } catch { /* non-blocking */ }
}

// ─── Save an AI output (sermon, devotional, etc.) ────────────
export async function saveOutput({ userId, churchId, outputType, title, content, metadata = {} }) {
  try {
    const { data } = await insforge.database.rpc('save_ai_output', {
      p_user_id:     userId || null,
      p_church_id:   churchId || null,
      p_output_type: outputType,
      p_title:       title,
      p_content:     content,
      p_metadata:    metadata,
    })
    return data
  } catch { return null }
}

// ─── Log usage for feature tracking ──────────────────────────
export async function logUsage({ userId, churchId, featureName, tokensUsed = 0 }) {
  try {
    await insforge.database.rpc('log_ai_usage', {
      p_user_id:     userId || null,
      p_church_id:   churchId || null,
      p_feature_name: featureName,
      p_tokens_used:  tokensUsed,
    })
  } catch { /* non-blocking */ }
}

// ─── Load saved outputs for a user ───────────────────────────
export async function getSavedOutputs({ userId, outputType }) {
  try {
    let query = insforge.database
      .from('ai_saved_outputs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (userId)    query = query.eq('user_id', userId)
    if (outputType) query = query.eq('output_type', outputType)

    const { data } = await query
    return data || []
  } catch { return [] }
}

// ─── Check if an AI feature is enabled ───────────────────────
export async function isFeatureEnabled(featureName) {
  try {
    const { data } = await insforge.database
      .from('ai_feature_settings')
      .select('enabled')
      .eq('feature_name', featureName)
      .single()
    return data?.enabled !== false
  } catch { return true } // fail open
}
