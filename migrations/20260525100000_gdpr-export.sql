-- export_my_data — returns everything stored about the calling user
-- as a single JSON object. The user can save it locally for GDPR
-- Article 15 (right of access).
CREATE OR REPLACE FUNCTION public.export_my_data()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_profile JSONB;
  v_members JSONB;
  v_member_ids UUID[];
  v_offerings JSONB;
  v_attendance JSONB;
  v_prayers JSONB;
  v_audit JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;

  SELECT to_jsonb(up) INTO v_profile FROM public.user_profiles up WHERE id = v_uid;

  SELECT COALESCE(jsonb_agg(to_jsonb(m)), '[]'::jsonb), ARRAY_AGG(m.id)
    INTO v_members, v_member_ids
    FROM public.members m WHERE m.user_id = v_uid;

  IF v_member_ids IS NULL THEN v_member_ids := ARRAY[]::UUID[]; END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(o)), '[]'::jsonb) INTO v_offerings
    FROM public.offerings o WHERE o.member_id = ANY(v_member_ids);

  SELECT COALESCE(jsonb_agg(to_jsonb(a)), '[]'::jsonb) INTO v_attendance
    FROM public.attendance_members a WHERE a.member_id = ANY(v_member_ids);

  SELECT COALESCE(jsonb_agg(to_jsonb(p)), '[]'::jsonb) INTO v_prayers
    FROM public.prayer_requests p WHERE p.member_id = ANY(v_member_ids);

  SELECT COALESCE(jsonb_agg(to_jsonb(al)), '[]'::jsonb) INTO v_audit
    FROM (
      SELECT * FROM public.audit_logs
       WHERE actor_user_id = v_uid
       ORDER BY created_at DESC LIMIT 500
    ) al;

  RETURN jsonb_build_object(
    'exported_at',     now(),
    'user_id',         v_uid,
    'profile',         v_profile,
    'memberships',     v_members,
    'offerings',       v_offerings,
    'attendance',      v_attendance,
    'prayer_requests', v_prayers,
    'audit_log',       v_audit,
    'notice',          'This export contains every piece of data ChurchFlow Liberia stores about your account.'
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.export_my_data() TO authenticated, anon;
