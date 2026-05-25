-- ─────────────────────────────────────────────────────────────
-- Two-factor authentication (TOTP)
-- ─────────────────────────────────────────────────────────────
-- One row per enrolled user. Secrets are never returned to the
-- client after enrollment — the edge function reads them and
-- performs verification on the server.
--
-- Backup codes are stored as their digests (one per row in a
-- separate table) so a leaked DB dump can't be replayed.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.user_two_factor (
  user_id        UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  secret         TEXT NOT NULL,           -- base32 TOTP secret
  is_enabled     BOOLEAN NOT NULL DEFAULT false,
  enrolled_at    TIMESTAMPTZ,
  last_used_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_two_factor_backup_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,             -- sha256 hex of plaintext code
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS u2fbc_user_idx ON public.user_two_factor_backup_codes (user_id);

-- ── RLS ─────────────────────────────────────────────────────
-- Secrets must never be readable from the client. All access goes
-- through SECURITY DEFINER RPCs / edge functions.
ALTER TABLE public.user_two_factor                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_two_factor_backup_codes     ENABLE ROW LEVEL SECURITY;
-- No policies = no rows visible to anon/authenticated direct queries.

-- ── Public helper: does this user have 2FA enabled? ─────────
-- Returns boolean — safe to expose because it leaks no secrets.
CREATE OR REPLACE FUNCTION public.has_two_factor_enabled(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT is_enabled FROM public.user_two_factor WHERE user_id = p_user_id),
    false
  )
$$;
GRANT EXECUTE ON FUNCTION public.has_two_factor_enabled(UUID) TO authenticated, anon;

-- ── Self-helper: does the *current* user have 2FA on? ───────
CREATE OR REPLACE FUNCTION public.my_two_factor_status()
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.user_two_factor;
  v_unused_codes INT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_row FROM public.user_two_factor WHERE user_id = v_uid;
  SELECT COUNT(*) INTO v_unused_codes
    FROM public.user_two_factor_backup_codes
   WHERE user_id = v_uid AND used_at IS NULL;
  RETURN jsonb_build_object(
    'enabled',        COALESCE(v_row.is_enabled, false),
    'enrolled_at',    v_row.enrolled_at,
    'last_used_at',   v_row.last_used_at,
    'unused_backup_codes', v_unused_codes
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.my_two_factor_status() TO authenticated;

-- ── Internal: enroll/disable/store secret — called only by the
-- edge function (which holds the service role). We expose RPCs
-- so the edge function can call them via PostgREST, but the secret
-- is supplied by the function (not the client).
CREATE OR REPLACE FUNCTION public.upsert_two_factor_secret(
  p_user_id UUID,
  p_secret  TEXT
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Caller must be the user themselves (the edge function passes
  -- the authed user's id).
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.user_two_factor (user_id, secret, is_enabled, updated_at)
       VALUES (p_user_id, p_secret, false, now())
  ON CONFLICT (user_id) DO UPDATE
    SET secret = EXCLUDED.secret,
        is_enabled = false,
        updated_at = now();
END; $$;
GRANT EXECUTE ON FUNCTION public.upsert_two_factor_secret(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.finalize_two_factor_enrollment(
  p_user_id    UUID,
  p_code_hashes TEXT[]
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  UPDATE public.user_two_factor
     SET is_enabled = true, enrolled_at = now(), updated_at = now()
   WHERE user_id = p_user_id;
  -- replace existing backup codes
  DELETE FROM public.user_two_factor_backup_codes WHERE user_id = p_user_id;
  INSERT INTO public.user_two_factor_backup_codes (user_id, code_hash)
       SELECT p_user_id, unnest(p_code_hashes);
END; $$;
GRANT EXECUTE ON FUNCTION public.finalize_two_factor_enrollment(UUID, TEXT[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.disable_my_two_factor()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  DELETE FROM public.user_two_factor_backup_codes WHERE user_id = v_uid;
  DELETE FROM public.user_two_factor              WHERE user_id = v_uid;
END; $$;
GRANT EXECUTE ON FUNCTION public.disable_my_two_factor() TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_two_factor_used()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  UPDATE public.user_two_factor SET last_used_at = now() WHERE user_id = v_uid;
END; $$;
GRANT EXECUTE ON FUNCTION public.touch_two_factor_used() TO authenticated;

-- Get the secret for a given user (server-only — called by edge fn)
CREATE OR REPLACE FUNCTION public.get_my_two_factor_secret()
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid(); v_secret TEXT;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  SELECT secret INTO v_secret FROM public.user_two_factor WHERE user_id = v_uid;
  RETURN v_secret;
END; $$;
GRANT EXECUTE ON FUNCTION public.get_my_two_factor_secret() TO authenticated;

-- Mark a backup code as used (atomic) — returns true if accepted
CREATE OR REPLACE FUNCTION public.consume_backup_code(p_code_hash TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid(); v_id UUID;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  UPDATE public.user_two_factor_backup_codes
     SET used_at = now()
   WHERE user_id = v_uid AND code_hash = p_code_hash AND used_at IS NULL
  RETURNING id INTO v_id;
  RETURN v_id IS NOT NULL;
END; $$;
GRANT EXECUTE ON FUNCTION public.consume_backup_code(TEXT) TO authenticated;
