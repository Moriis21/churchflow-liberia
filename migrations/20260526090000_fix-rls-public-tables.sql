-- ─────────────────────────────────────────────────────────────
-- Production hardening: enable RLS on tables that are currently
-- publicly accessible, and tighten church_invites anon policy.
-- ─────────────────────────────────────────────────────────────

-- ─── AI tables: authenticated-only access ────────────────────
ALTER TABLE public.ai_messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_saved_outputs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_feature_settings  ENABLE ROW LEVEL SECURITY;

-- Each user can only see their own AI messages / conversations
DROP POLICY IF EXISTS ai_msg_own   ON public.ai_messages;
CREATE POLICY ai_msg_own ON public.ai_messages
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ai_conv_own  ON public.ai_conversations;
CREATE POLICY ai_conv_own ON public.ai_conversations
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ai_saved_own ON public.ai_saved_outputs;
CREATE POLICY ai_saved_own ON public.ai_saved_outputs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS ai_usage_own ON public.ai_usage_logs;
CREATE POLICY ai_usage_own ON public.ai_usage_logs
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ai_feature_settings: readable by all authenticated, writable only by service_role
DROP POLICY IF EXISTS ai_feat_read ON public.ai_feature_settings;
CREATE POLICY ai_feat_read ON public.ai_feature_settings
  FOR SELECT TO authenticated
  USING (true);

-- ─── community_waitlist: no reads after insert ────────────────
ALTER TABLE public.community_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS waitlist_insert ON public.community_waitlist;
CREATE POLICY waitlist_insert ON public.community_waitlist
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- No SELECT policy → nobody can read the list (only service_role can)

-- ─── church_invites: remove anon read, keep token-lookup via RPC ──
-- The invite redemption flow uses the accept_church_invite() RPC
-- (SECURITY DEFINER), so anon users never need to query the table directly.
DROP POLICY IF EXISTS invites_anon_read ON public.church_invites;

-- Ensure authenticated admins can still manage their own church's invites
DROP POLICY IF EXISTS invites_church_read ON public.church_invites;
CREATE POLICY invites_church_read ON public.church_invites
  FOR SELECT TO authenticated
  USING (
    church_id IN (
      SELECT church_id FROM public.user_profiles WHERE id = auth.uid()
    )
  );
