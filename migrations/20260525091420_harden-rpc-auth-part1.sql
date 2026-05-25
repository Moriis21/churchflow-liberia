-- Part 1 of 2: auth helpers

CREATE OR REPLACE FUNCTION public._caller_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public._caller_church_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT church_id FROM public.user_profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public._caller_is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT role FROM public.user_profiles WHERE id = auth.uid()) = 'super_admin', false)
$$;

CREATE OR REPLACE FUNCTION public._assert_authed()
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public._caller_can_touch(
  p_target_church_id UUID,
  p_target_user_id   UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_role TEXT;
  v_church UUID;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;
  IF v_uid = p_target_user_id THEN RETURN true; END IF;
  SELECT role, church_id INTO v_role, v_church FROM public.user_profiles WHERE id = v_uid;
  IF v_role = 'super_admin' THEN RETURN true; END IF;
  IF v_church IS NOT NULL AND v_church = p_target_church_id THEN RETURN true; END IF;
  RETURN false;
END; $$;

CREATE OR REPLACE FUNCTION public._caller_is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT role IN ('super_admin','church_admin','pastor','secretary')
       FROM public.user_profiles WHERE id = auth.uid()),
    false)
$$;

GRANT EXECUTE ON FUNCTION public._caller_role()           TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public._caller_church_id()      TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public._caller_is_super_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public._assert_authed()         TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public._caller_can_touch(UUID, UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public._caller_is_staff()       TO authenticated, anon;
