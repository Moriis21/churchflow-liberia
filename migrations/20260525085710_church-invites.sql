-- =============================================================
-- ChurchFlow Liberia — Church invite-link system
--
-- Each church can mint signed invite tokens with expiry + max use
-- limits.  Public landing page /invite/:token validates them and,
-- on accept, registers a real auth user, mints a member profile,
-- and bumps used_count.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.church_invites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_token   TEXT NOT NULL UNIQUE,
  church_id      UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  branch_id      UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  role           TEXT NOT NULL DEFAULT 'member' CHECK (role IN
                   ('member','dept_leader','secretary','treasurer','pastor')),
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN
                   ('active','disabled')),
  max_uses       INT  NOT NULL DEFAULT 100 CHECK (max_uses > 0),
  used_count     INT  NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  created_by     UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS church_invites_church_idx ON public.church_invites (church_id);
CREATE INDEX IF NOT EXISTS church_invites_token_idx  ON public.church_invites (invite_token);

CREATE OR REPLACE FUNCTION public.touch_church_invites_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_church_invites_updated_at ON public.church_invites;
CREATE TRIGGER trg_church_invites_updated_at
  BEFORE UPDATE ON public.church_invites
  FOR EACH ROW EXECUTE FUNCTION public.touch_church_invites_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
-- Token is the secret: anyone with the token can validate, but only
-- service code (SECURITY DEFINER funcs below) can write.
ALTER TABLE public.church_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS church_invites_read ON public.church_invites;
CREATE POLICY church_invites_read ON public.church_invites
  FOR SELECT TO authenticated, anon USING (true);

-- ── RPC: create_church_invite ────────────────────────────────
-- Mints a new invite for the caller's church. SECURITY DEFINER so it
-- bypasses RLS write blocks. Caller passes their church_id/user_id.
CREATE OR REPLACE FUNCTION public.create_church_invite(
  p_church_id  UUID,
  p_branch_id  UUID DEFAULT NULL,
  p_role       TEXT DEFAULT 'member',
  p_max_uses   INT  DEFAULT 100,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS public.church_invites
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_token TEXT;
  v_row   public.church_invites;
BEGIN
  IF p_church_id IS NULL THEN
    RAISE EXCEPTION 'church_id is required';
  END IF;

  -- 24-char URL-safe token
  v_token := encode(gen_random_bytes(18), 'base64');
  v_token := replace(replace(replace(v_token, '+', ''), '/', ''), '=', '');

  INSERT INTO public.church_invites (
    invite_token, church_id, branch_id, role,
    max_uses, expires_at, created_by, status
  ) VALUES (
    v_token, p_church_id, p_branch_id, COALESCE(p_role, 'member'),
    COALESCE(p_max_uses, 100), p_expires_at, p_created_by, 'active'
  ) RETURNING * INTO v_row;

  RETURN v_row;
END; $$;
GRANT EXECUTE ON FUNCTION public.create_church_invite(UUID,UUID,TEXT,INT,TIMESTAMPTZ,UUID)
  TO authenticated, anon;

-- ── RPC: validate_church_invite ──────────────────────────────
-- Returns invite + church row (or null fields) so the landing page
-- can render church name without exposing a JOIN to anon writes.
CREATE OR REPLACE FUNCTION public.validate_church_invite(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invite public.church_invites;
  v_church RECORD;
BEGIN
  SELECT * INTO v_invite FROM public.church_invites
   WHERE invite_token = p_token LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_invite.status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'disabled');
  END IF;
  IF v_invite.expires_at IS NOT NULL AND v_invite.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;
  IF v_invite.used_count >= v_invite.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'error', 'exhausted');
  END IF;

  SELECT id, name, location, logo_url INTO v_church
    FROM public.churches WHERE id = v_invite.church_id LIMIT 1;

  RETURN jsonb_build_object(
    'ok',     true,
    'invite', to_jsonb(v_invite),
    'church', CASE WHEN v_church.id IS NULL THEN NULL ELSE to_jsonb(v_church) END
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.validate_church_invite(TEXT)
  TO authenticated, anon;

-- ── RPC: consume_church_invite ───────────────────────────────
-- Atomically bumps used_count after a successful registration.
CREATE OR REPLACE FUNCTION public.consume_church_invite(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_invite public.church_invites;
BEGIN
  UPDATE public.church_invites
     SET used_count = used_count + 1
   WHERE invite_token = p_token
     AND status      = 'active'
     AND (expires_at IS NULL OR expires_at > now())
     AND used_count < max_uses
  RETURNING * INTO v_invite;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_or_exhausted');
  END IF;
  RETURN jsonb_build_object('ok', true, 'invite', to_jsonb(v_invite));
END; $$;
GRANT EXECUTE ON FUNCTION public.consume_church_invite(TEXT)
  TO authenticated, anon;

-- ── RPC: list_church_invites ────────────────────────────────
CREATE OR REPLACE FUNCTION public.list_church_invites(p_church_id UUID)
RETURNS SETOF public.church_invites
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT * FROM public.church_invites
   WHERE church_id = p_church_id
   ORDER BY created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.list_church_invites(UUID)
  TO authenticated, anon;

-- ── RPC: set_invite_status ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_invite_status(
  p_invite_id UUID, p_status TEXT
) RETURNS public.church_invites
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.church_invites;
BEGIN
  IF p_status NOT IN ('active','disabled') THEN
    RAISE EXCEPTION 'invalid status: %', p_status;
  END IF;
  UPDATE public.church_invites SET status = p_status
   WHERE id = p_invite_id RETURNING * INTO v_row;
  RETURN v_row;
END; $$;
GRANT EXECUTE ON FUNCTION public.set_invite_status(UUID,TEXT)
  TO authenticated, anon;
