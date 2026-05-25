-- =============================================================
-- ChurchFlow Liberia — Member photo persistence
--
-- Adds:
--   • members.profile_photo_path  (permanent storage path)
--   • members.updated_at          (kept fresh on photo updates)
--   • update_member_photo()       RPC — sets photo url+path, bumps
--                                 updated_at, mirrors to profiles
--                                 if the member is linked to a user.
-- =============================================================

-- ── Columns ──────────────────────────────────────────────────
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS profile_photo_path TEXT,
  ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ NOT NULL DEFAULT now();

-- Profiles already have avatar_url; add avatar_path if missing
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- ── RPC: update_member_photo ─────────────────────────────────
-- SECURITY DEFINER so pastors/admins can update via PostgREST
-- without RLS friction. Mirrors the photo to the linked profile
-- when members.user_id is set.
CREATE OR REPLACE FUNCTION public.update_member_photo(
  p_member_id  UUID,
  p_photo_url  TEXT,
  p_photo_path TEXT
) RETURNS public.members
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member public.members;
  v_user_id UUID;
BEGIN
  UPDATE public.members
     SET profile_photo_url  = p_photo_url,
         profile_photo_path = p_photo_path,
         updated_at         = now()
   WHERE id = p_member_id
  RETURNING * INTO v_member;

  IF v_member.id IS NULL THEN
    RAISE EXCEPTION 'Member % not found', p_member_id;
  END IF;

  -- Mirror to profiles if linked
  v_user_id := v_member.user_id;
  IF v_user_id IS NOT NULL THEN
    UPDATE public.profiles
       SET avatar_url  = p_photo_url,
           avatar_path = p_photo_path,
           updated_at  = now()
     WHERE id = v_user_id;
  END IF;

  RETURN v_member;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_member_photo(UUID, TEXT, TEXT)
  TO authenticated, anon, service_role;

-- ── Keep updated_at fresh on any member update ───────────────
CREATE OR REPLACE FUNCTION public.touch_members_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_members_updated_at ON public.members;
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW EXECUTE FUNCTION public.touch_members_updated_at();
