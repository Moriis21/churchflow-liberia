-- delete_my_account — Article 17 (right to erasure).
--
-- Strategy: SOFT delete + PII anonymization (not hard delete) so:
--   • Church admins keep their attendance/offerings rollups
--   • Audit logs stay intact for forensics
--   • The user themselves is fully scrubbed from the visible system
--
-- After this runs:
--   • user_profiles row: email → null, full_name → 'Deleted User',
--                       is_active=false, access_revoked=true,
--                       status='deleted'
--   • members rows owned by this user: same scrubbing
--   • The InsForge auth user itself is NOT deleted by this RPC —
--     that requires the service role. The user will simply be
--     unable to log in (access_revoked = true at login gate).
CREATE OR REPLACE FUNCTION public.delete_my_account(p_confirm TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_email TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;

  -- Require explicit confirmation string to avoid accidental delete
  IF p_confirm <> 'DELETE MY ACCOUNT' THEN
    RAISE EXCEPTION 'Confirmation phrase mismatch' USING ERRCODE='22023';
  END IF;

  SELECT email INTO v_email FROM public.user_profiles WHERE id = v_uid;

  -- Scrub user_profiles
  UPDATE public.user_profiles
     SET email          = NULL,
         full_name      = 'Deleted User',
         avatar_url     = NULL,
         avatar_path    = NULL,
         is_active      = false,
         access_revoked = true,
         status         = 'deleted',
         updated_at     = now()
   WHERE id = v_uid;

  -- Scrub member rows owned by this user
  UPDATE public.members
     SET full_name           = 'Deleted Member',
         email               = NULL,
         phone               = NULL,
         address             = NULL,
         date_of_birth       = NULL,
         emergency_contact   = NULL,
         notes               = '[account deleted by user request]',
         profile_photo_url   = NULL,
         profile_photo_path  = NULL,
         membership_status   = 'inactive',
         updated_at          = now()
   WHERE user_id = v_uid;

  -- Audit log
  INSERT INTO public.audit_logs (
    actor_user_id, actor_name, actor_role, action, description, created_at
  ) VALUES (
    v_uid, 'Deleted User', 'self', 'account_deleted',
    'User requested GDPR account deletion (' || COALESCE(v_email, 'unknown') || ')',
    now()
  );

  RETURN jsonb_build_object(
    'ok',         true,
    'deleted_at', now(),
    'notice',     'Your data has been scrubbed. To remove the auth record entirely, contact support.'
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.delete_my_account(TEXT) TO authenticated;
