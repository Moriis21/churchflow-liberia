-- ─────────────────────────────────────────────────────────────
-- Security hardening (2026-06-07)
--   1. Close the church_invites token-enumeration hole
--   2. Add tenant / owner guards to unguarded SECURITY DEFINER fns
-- ─────────────────────────────────────────────────────────────

-- ── 1. church_invites: drop the permissive anon/auth read ─────
-- A leftover policy let ANYONE read every invite token. The
-- redemption flow uses validate_church_invite() (SECURITY DEFINER),
-- so direct table reads are never needed by anon users. Admins keep
-- access to their own church's invites via invites_church_read.
DROP POLICY IF EXISTS church_invites_read ON public.church_invites;

-- ── 2a. Cross-tenant WRITE guards (_caller_can_touch) ─────────
CREATE OR REPLACE FUNCTION public.insert_member(p_church_id uuid, p_branch_id uuid, p_full_name text, p_gender text, p_phone text, p_email text, p_address text, p_date_of_birth date, p_membership_status text, p_baptism_status boolean, p_marital_status text, p_join_date date, p_notes text, p_emergency_contact text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_result jsonb; BEGIN
  IF NOT public._caller_can_touch(p_church_id, NULL) THEN RAISE EXCEPTION 'Not authorized for this church' USING ERRCODE='42501'; END IF;
  INSERT INTO members (church_id, branch_id, full_name, gender, phone, email, address, date_of_birth, membership_status, baptism_status, marital_status, join_date, notes, emergency_contact) VALUES (p_church_id, p_branch_id, p_full_name, p_gender, p_phone, p_email, p_address, p_date_of_birth, p_membership_status, p_baptism_status, p_marital_status, p_join_date, p_notes, p_emergency_contact) RETURNING to_jsonb(members.*) INTO v_result; RETURN v_result; END; $function$;

CREATE OR REPLACE FUNCTION public.insert_department(p_church_id uuid, p_branch_id uuid, p_name text, p_description text, p_color text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_result jsonb; BEGIN
  IF NOT public._caller_can_touch(p_church_id, NULL) THEN RAISE EXCEPTION 'Not authorized for this church' USING ERRCODE='42501'; END IF;
  INSERT INTO departments (church_id, branch_id, name, description, color) VALUES (p_church_id, p_branch_id, p_name, p_description, p_color) RETURNING to_jsonb(departments.*) INTO v_result; RETURN v_result; END; $function$;

CREATE OR REPLACE FUNCTION public.insert_live_stream(p_church_id uuid, p_branch_id uuid, p_title text, p_description text, p_platform text, p_stream_url text, p_thumbnail_url text, p_start_time timestamp with time zone, p_end_time timestamp with time zone, p_status text, p_created_by uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_result jsonb; BEGIN
  IF NOT public._caller_can_touch(p_church_id, NULL) THEN RAISE EXCEPTION 'Not authorized for this church' USING ERRCODE='42501'; END IF;
  INSERT INTO live_streams (church_id, branch_id, title, description, platform, stream_url, thumbnail_url, start_time, end_time, status, created_by) VALUES (p_church_id, p_branch_id, p_title, p_description, p_platform, p_stream_url, p_thumbnail_url, p_start_time, p_end_time, p_status, p_created_by) RETURNING to_jsonb(live_streams.*) INTO v_result; RETURN v_result; END; $function$;

CREATE OR REPLACE FUNCTION public.update_church(p_church_id uuid, p_name text, p_location text, p_phone text, p_email text, p_website text, p_currency text, p_founded_date text, p_logo_url text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_result jsonb; BEGIN
  IF NOT public._caller_can_touch(p_church_id, NULL) THEN RAISE EXCEPTION 'Not authorized for this church' USING ERRCODE='42501'; END IF;
  UPDATE churches SET name = COALESCE(p_name, name), location = p_location, phone = p_phone, email = p_email, website = p_website, currency = COALESCE(p_currency, currency), founded_date = CASE WHEN p_founded_date = '' THEN NULL ELSE p_founded_date::date END, logo_url = COALESCE(p_logo_url, logo_url), updated_at = now() WHERE id = p_church_id RETURNING to_jsonb(churches.*) INTO v_result; RETURN v_result; END; $function$;

CREATE OR REPLACE FUNCTION public.update_church(p_church_id uuid, p_name text, p_location text, p_phone text, p_email text, p_website text, p_currency text, p_founded_date text, p_logo_url text, p_logo_path text DEFAULT NULL::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_result jsonb; BEGIN
  IF NOT public._caller_can_touch(p_church_id, NULL) THEN RAISE EXCEPTION 'Not authorized for this church' USING ERRCODE='42501'; END IF;
  UPDATE churches SET name = COALESCE(p_name, name), location = p_location, phone = p_phone, email = p_email, website = p_website, currency = COALESCE(p_currency, currency), founded_date = CASE WHEN p_founded_date = '' THEN NULL ELSE p_founded_date::date END, logo_url = COALESCE(p_logo_url, logo_url), logo_path = COALESCE(p_logo_path, logo_path), updated_at = now() WHERE id = p_church_id RETURNING to_jsonb(churches.*) INTO v_result; RETURN v_result; END; $function$;

-- ── 2b. Self-only guards (auth.uid() = p_user_id) ─────────────
CREATE OR REPLACE FUNCTION public.update_my_profile(p_user_id uuid, p_full_name text, p_phone text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_result jsonb; BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Can only update your own profile' USING ERRCODE='42501'; END IF;
  UPDATE user_profiles SET full_name = p_full_name, phone = p_phone WHERE id = p_user_id RETURNING to_jsonb(user_profiles.*) INTO v_result; IF v_result IS NULL THEN INSERT INTO user_profiles (id, full_name, phone) VALUES (p_user_id, p_full_name, p_phone) ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone RETURNING to_jsonb(user_profiles.*) INTO v_result; END IF; RETURN v_result; END; $function$;

CREATE OR REPLACE FUNCTION public.update_profile_avatar(p_user_id uuid, p_avatar_url text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Can only update your own avatar' USING ERRCODE='42501'; END IF;
  UPDATE user_profiles SET avatar_url = p_avatar_url WHERE id = p_user_id; IF NOT FOUND THEN INSERT INTO user_profiles (id, avatar_url) VALUES (p_user_id, p_avatar_url) ON CONFLICT (id) DO UPDATE SET avatar_url = EXCLUDED.avatar_url; END IF; END; $function$;

CREATE OR REPLACE FUNCTION public.update_profile_avatar(p_user_id uuid, p_avatar_url text, p_avatar_path text DEFAULT NULL::text)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Can only update your own avatar' USING ERRCODE='42501'; END IF;
  UPDATE user_profiles SET avatar_url = p_avatar_url, avatar_path = COALESCE(p_avatar_path, avatar_path), updated_at = now() WHERE id = p_user_id; END; $function$;

CREATE OR REPLACE FUNCTION public.get_my_profile(p_user_id uuid)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_profile jsonb; v_church jsonb; v_church_id uuid; BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Can only read your own profile' USING ERRCODE='42501'; END IF;
  SELECT to_jsonb(u.*) INTO v_profile FROM user_profiles u WHERE u.id = p_user_id; IF v_profile IS NOT NULL THEN v_church_id := (v_profile->>'church_id')::uuid; IF v_church_id IS NOT NULL THEN SELECT to_jsonb(c.*) INTO v_church FROM churches c WHERE c.id = v_church_id; END IF; END IF; RETURN jsonb_build_object('profile', v_profile, 'church', v_church); END; $function$;

CREATE OR REPLACE FUNCTION public.log_ai_usage(p_user_id uuid, p_church_id uuid, p_feature_name text, p_tokens_used integer DEFAULT 0)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  INSERT INTO ai_usage_logs (user_id, church_id, feature_name, tokens_used) VALUES (p_user_id, p_church_id, p_feature_name, p_tokens_used); END; $function$;

CREATE OR REPLACE FUNCTION public.save_ai_output(p_user_id uuid, p_church_id uuid, p_output_type text, p_title text, p_content text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_id uuid; BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  INSERT INTO ai_saved_outputs (user_id, church_id, output_type, title, content, metadata) VALUES (p_user_id, p_church_id, p_output_type, p_title, p_content, p_metadata) RETURNING id INTO v_id; RETURN v_id; END; $function$;

-- ── 2c. Onboarding: you may only set up your OWN account ──────
CREATE OR REPLACE FUNCTION public.create_church_setup(p_user_id uuid, p_user_email text, p_church_name text, p_full_name text, p_role text DEFAULT 'church_admin'::text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$ DECLARE v_church_id uuid; v_existing_church_id uuid; v_church jsonb; v_profile jsonb; BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN RAISE EXCEPTION 'Can only set up your own account' USING ERRCODE='42501'; END IF;
  SELECT church_id INTO v_existing_church_id FROM user_profiles WHERE id = p_user_id; IF v_existing_church_id IS NOT NULL THEN SELECT to_jsonb(c.*) INTO v_church FROM churches c WHERE c.id = v_existing_church_id; SELECT to_jsonb(u.*) INTO v_profile FROM user_profiles u WHERE u.id = p_user_id; RETURN jsonb_build_object('success', true, 'church', v_church, 'profile', v_profile, 'already_setup', true); END IF; INSERT INTO churches (name, owner_id, currency) VALUES (p_church_name, p_user_id, 'LRD') RETURNING id INTO v_church_id; INSERT INTO user_profiles (id, email, church_id, full_name, role, is_active) VALUES (p_user_id, p_user_email, v_church_id, p_full_name, p_role, true) ON CONFLICT (id) DO UPDATE SET church_id = EXCLUDED.church_id, full_name = EXCLUDED.full_name, role = EXCLUDED.role, email = COALESCE(EXCLUDED.email, user_profiles.email); SELECT to_jsonb(c.*) INTO v_church FROM churches c WHERE c.id = v_church_id; SELECT to_jsonb(u.*) INTO v_profile FROM user_profiles u WHERE u.id = p_user_id; RETURN jsonb_build_object('success', true, 'church', v_church, 'profile', v_profile); END; $function$;
