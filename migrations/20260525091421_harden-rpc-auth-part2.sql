-- Part 2 of 2: hardened RPC bodies

-- update_member
CREATE OR REPLACE FUNCTION public.update_member(
  p_member_id uuid, p_full_name text, p_gender text,
  p_phone text DEFAULT NULL, p_email text DEFAULT NULL, p_address text DEFAULT NULL,
  p_date_of_birth date DEFAULT NULL, p_membership_status text DEFAULT 'active',
  p_baptism_status boolean DEFAULT false, p_marital_status text DEFAULT 'single',
  p_notes text DEFAULT NULL, p_emergency_contact text DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_target_church UUID; v_target_user UUID;
BEGIN
  PERFORM public._assert_authed();
  SELECT church_id, user_id INTO v_target_church, v_target_user
    FROM public.members WHERE id = p_member_id;
  IF v_target_church IS NULL THEN
    RAISE EXCEPTION 'Member not found' USING ERRCODE='42704';
  END IF;
  IF NOT public._caller_can_touch(v_target_church, v_target_user) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  UPDATE public.members SET
    full_name=p_full_name, gender=p_gender, phone=p_phone, email=p_email,
    address=p_address, date_of_birth=p_date_of_birth,
    membership_status=p_membership_status, baptism_status=p_baptism_status,
    marital_status=p_marital_status, notes=p_notes,
    emergency_contact=p_emergency_contact, updated_at=now()
  WHERE id=p_member_id;
END; $$;

-- update_member_photo
DROP FUNCTION IF EXISTS public.update_member_photo(uuid, text, text);
DROP FUNCTION IF EXISTS public.update_member_photo(uuid, text);
CREATE FUNCTION public.update_member_photo(
  p_member_id UUID, p_photo_url TEXT, p_photo_path TEXT DEFAULT NULL
) RETURNS public.members
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_member public.members;
BEGIN
  PERFORM public._assert_authed();
  SELECT * INTO v_member FROM public.members WHERE id = p_member_id;
  IF v_member.id IS NULL THEN
    RAISE EXCEPTION 'Member not found' USING ERRCODE='42704';
  END IF;
  IF NOT public._caller_can_touch(v_member.church_id, v_member.user_id) THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  UPDATE public.members
     SET profile_photo_url = p_photo_url,
         profile_photo_path = COALESCE(p_photo_path, profile_photo_path),
         updated_at = now()
   WHERE id = p_member_id RETURNING * INTO v_member;
  IF v_member.user_id IS NOT NULL THEN
    UPDATE public.profiles
       SET avatar_url = p_photo_url,
           avatar_path = COALESCE(p_photo_path, avatar_path),
           updated_at = now()
     WHERE id = v_member.user_id;
  END IF;
  RETURN v_member;
END; $$;
GRANT EXECUTE ON FUNCTION public.update_member_photo(UUID, TEXT, TEXT) TO authenticated, anon, service_role;

-- update_user_role
CREATE OR REPLACE FUNCTION public.update_user_role(p_user_id UUID, p_role TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_caller_role TEXT; v_caller_church UUID; v_target_church UUID;
BEGIN
  PERFORM public._assert_authed();
  v_caller_role  := public._caller_role();
  v_caller_church := public._caller_church_id();
  IF v_caller_role NOT IN ('super_admin','church_admin') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  IF p_role = 'super_admin' AND v_caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'Cannot grant super_admin via RPC' USING ERRCODE='42501';
  END IF;
  SELECT church_id INTO v_target_church FROM public.user_profiles WHERE id = p_user_id;
  IF v_caller_role <> 'super_admin' AND v_target_church IS DISTINCT FROM v_caller_church THEN
    RAISE EXCEPTION 'Cross-church role change denied' USING ERRCODE='42501';
  END IF;
  UPDATE public.user_profiles SET role = p_role, updated_at = now() WHERE id = p_user_id;
END; $$;

-- toggle_user_active
CREATE OR REPLACE FUNCTION public.toggle_user_active(p_user_id UUID, p_is_active BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_caller_role TEXT; v_caller_church UUID; v_target_church UUID; v_target_role TEXT;
BEGIN
  PERFORM public._assert_authed();
  v_caller_role := public._caller_role();
  v_caller_church := public._caller_church_id();
  IF v_caller_role NOT IN ('super_admin','church_admin') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  SELECT church_id, role INTO v_target_church, v_target_role
    FROM public.user_profiles WHERE id = p_user_id;
  IF v_caller_role <> 'super_admin' AND v_target_church IS DISTINCT FROM v_caller_church THEN
    RAISE EXCEPTION 'Cross-church deactivation denied' USING ERRCODE='42501';
  END IF;
  IF v_target_role = 'super_admin' AND v_caller_role <> 'super_admin' THEN
    RAISE EXCEPTION 'Cannot disable super admin' USING ERRCODE='42501';
  END IF;
  UPDATE public.user_profiles SET is_active = p_is_active, updated_at = now() WHERE id = p_user_id;
END; $$;

-- create_church_invite hardened
CREATE OR REPLACE FUNCTION public.create_church_invite(
  p_church_id UUID, p_branch_id UUID DEFAULT NULL, p_role TEXT DEFAULT 'member',
  p_max_uses INT DEFAULT 100, p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS public.church_invites
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_token TEXT; v_row public.church_invites;
BEGIN
  PERFORM public._assert_authed();
  IF p_church_id IS NULL THEN
    RAISE EXCEPTION 'church_id is required' USING ERRCODE='22023';
  END IF;
  IF NOT public._caller_can_touch(p_church_id, NULL) OR NOT public._caller_is_staff() THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  IF p_role = 'pastor' AND public._caller_role() NOT IN ('super_admin','church_admin') THEN
    RAISE EXCEPTION 'Only church admin can issue pastor invites' USING ERRCODE='42501';
  END IF;
  v_token := encode(gen_random_bytes(18), 'base64');
  v_token := replace(replace(replace(v_token, '+', ''), '/', ''), '=', '');
  INSERT INTO public.church_invites (
    invite_token, church_id, branch_id, role,
    max_uses, expires_at, created_by, status
  ) VALUES (
    v_token, p_church_id, p_branch_id, COALESCE(p_role, 'member'),
    COALESCE(p_max_uses, 100), p_expires_at,
    COALESCE(p_created_by, auth.uid()), 'active'
  ) RETURNING * INTO v_row;
  RETURN v_row;
END; $$;

-- set_invite_status hardened
CREATE OR REPLACE FUNCTION public.set_invite_status(p_invite_id UUID, p_status TEXT)
RETURNS public.church_invites
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.church_invites;
BEGIN
  PERFORM public._assert_authed();
  IF p_status NOT IN ('active','disabled') THEN
    RAISE EXCEPTION 'invalid status: %', p_status USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_row FROM public.church_invites WHERE id = p_invite_id;
  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'Invite not found' USING ERRCODE='42704';
  END IF;
  IF NOT public._caller_can_touch(v_row.church_id, NULL) OR NOT public._caller_is_staff() THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  UPDATE public.church_invites SET status = p_status WHERE id = p_invite_id RETURNING * INTO v_row;
  RETURN v_row;
END; $$;
