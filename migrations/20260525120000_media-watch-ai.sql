-- ─────────────────────────────────────────────────────────────
-- Watch history (per-user view log)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_watch_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  resource_id   UUID NOT NULL REFERENCES public.media_resources(id) ON DELETE CASCADE,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  position_seconds INT,
  completed     BOOLEAN NOT NULL DEFAULT false,
  view_count    INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);
CREATE INDEX IF NOT EXISTS mwh_user_idx ON public.media_watch_history (user_id, last_watched_at DESC);

ALTER TABLE public.media_watch_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mwh_read  ON public.media_watch_history;
DROP POLICY IF EXISTS mwh_write ON public.media_watch_history;
CREATE POLICY mwh_read  ON public.media_watch_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY mwh_write ON public.media_watch_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Atomic upsert via RPC (so client can call it without dealing with conflict)
CREATE OR REPLACE FUNCTION public.log_media_view(p_resource_id UUID, p_position INT DEFAULT NULL, p_completed BOOLEAN DEFAULT false)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  INSERT INTO public.media_watch_history (user_id, resource_id, position_seconds, completed)
       VALUES (v_uid, p_resource_id, p_position, p_completed)
  ON CONFLICT (user_id, resource_id) DO UPDATE
    SET last_watched_at  = now(),
        position_seconds = COALESCE(EXCLUDED.position_seconds, public.media_watch_history.position_seconds),
        completed        = public.media_watch_history.completed OR EXCLUDED.completed,
        view_count       = public.media_watch_history.view_count + 1;
END; $$;
GRANT EXECUTE ON FUNCTION public.log_media_view(UUID, INT, BOOLEAN) TO authenticated;

-- Get the caller's recently watched (joined with resource data)
CREATE OR REPLACE FUNCTION public.list_my_watch_history(p_limit INT DEFAULT 8)
RETURNS TABLE (
  resource_id UUID, last_watched_at TIMESTAMPTZ, view_count INT, completed BOOLEAN,
  title TEXT, description TEXT, provider TEXT, category TEXT, resource_type TEXT,
  thumbnail_url TEXT, embed_url TEXT, video_url TEXT, external_url TEXT,
  speaker TEXT, tags TEXT[]
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT m.id, h.last_watched_at, h.view_count, h.completed,
         m.title, m.description, m.provider, m.category, m.resource_type,
         m.thumbnail_url, m.embed_url, m.video_url, m.external_url,
         m.speaker, m.tags
    FROM public.media_watch_history h
    JOIN public.media_resources m ON m.id = h.resource_id
   WHERE h.user_id = v_uid AND m.is_active = true
   ORDER BY h.last_watched_at DESC
   LIMIT p_limit;
END; $$;
GRANT EXECUTE ON FUNCTION public.list_my_watch_history(INT) TO authenticated;

-- ─────────────────────────────────────────────────────────────
-- AI outputs cache (summary / questions / devotional per resource)
-- ─────────────────────────────────────────────────────────────
-- Shared across all users since it's content about the same video.
-- Keyed by (resource_id, kind). Anyone can read; first user to ask
-- triggers generation and persists.
CREATE TABLE IF NOT EXISTS public.media_ai_outputs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES public.media_resources(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('summary','questions','devotional')),
  content     TEXT NOT NULL,
  model       TEXT,
  created_by  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (resource_id, kind)
);

ALTER TABLE public.media_ai_outputs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mao_read ON public.media_ai_outputs;
CREATE POLICY mao_read ON public.media_ai_outputs FOR SELECT TO authenticated, anon USING (true);

-- Atomic upsert
CREATE OR REPLACE FUNCTION public.save_media_ai_output(p_resource_id UUID, p_kind TEXT, p_content TEXT, p_model TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  IF p_kind NOT IN ('summary','questions','devotional') THEN
    RAISE EXCEPTION 'invalid kind: %', p_kind USING ERRCODE='22023';
  END IF;
  INSERT INTO public.media_ai_outputs (resource_id, kind, content, model, created_by)
       VALUES (p_resource_id, p_kind, p_content, p_model, auth.uid())
  ON CONFLICT (resource_id, kind) DO UPDATE
    SET content = EXCLUDED.content, model = EXCLUDED.model, created_at = now();
END; $$;
GRANT EXECUTE ON FUNCTION public.save_media_ai_output(UUID, TEXT, TEXT, TEXT) TO authenticated;
