-- =============================================================
-- ChurchFlow Liberia — Bible Learning Resources
--
-- A curated catalog of free Bible-study videos and resources from
-- trusted providers. Rows are platform-wide (no church_id) — the
-- super admin maintains the list; everyone can read.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.media_resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  provider        TEXT NOT NULL CHECK (provider IN (
                    'bibleproject','wvbs','youtube','vimeo','churchflow_upload','external'
                  )),
  category        TEXT NOT NULL CHECK (category IN (
                    'video','course','study_guide','download','app',
                    'youtube_channel','children'
                  )),
  -- Resource type marks "kind of asset" so UI knows whether to embed
  -- a player or open externally (apps, channels, etc.).
  resource_type   TEXT NOT NULL DEFAULT 'video' CHECK (resource_type IN (
                    'video','playlist','channel','app','download','website'
                  )),
  thumbnail_url   TEXT,
  embed_url       TEXT,         -- iframe-safe URL for in-app player
  video_url       TEXT,         -- direct MP4 or canonical YouTube/Vimeo URL
  external_url    TEXT,         -- where to send the user when not embeddable
  duration_seconds INT,
  speaker         TEXT,
  tags            TEXT[],
  featured        BOOLEAN NOT NULL DEFAULT false,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_resources_provider_idx ON public.media_resources (provider);
CREATE INDEX IF NOT EXISTS media_resources_category_idx ON public.media_resources (category);
CREATE INDEX IF NOT EXISTS media_resources_active_idx   ON public.media_resources (is_active);

-- Touch trigger
CREATE OR REPLACE FUNCTION public.touch_media_resources_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS trg_media_resources_updated_at ON public.media_resources;
CREATE TRIGGER trg_media_resources_updated_at
  BEFORE UPDATE ON public.media_resources
  FOR EACH ROW EXECUTE FUNCTION public.touch_media_resources_updated_at();

-- ── RLS — public read, writes via super-admin RPC only ──────
ALTER TABLE public.media_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS media_resources_read ON public.media_resources;
CREATE POLICY media_resources_read ON public.media_resources
  FOR SELECT TO authenticated, anon USING (is_active = true);

-- =============================================================
-- Platform feature flags table — single-row settings used to
-- toggle modules platform-wide. We seed one row for the Bible
-- Learning Resources section.
-- =============================================================
CREATE TABLE IF NOT EXISTS public.platform_feature_flags (
  key         TEXT PRIMARY KEY,
  enabled     BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.platform_feature_flags (key, enabled, description) VALUES
  ('bible_learning',         true, 'Free Bible Learning Resources section'),
  ('bible_learning_bibleproject', true, 'BibleProject tab'),
  ('bible_learning_wvbs',         true, 'WVBS tab'),
  ('bible_learning_embedded_player', true, 'In-app video player')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.platform_feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feature_flags_read ON public.platform_feature_flags;
CREATE POLICY feature_flags_read ON public.platform_feature_flags
  FOR SELECT TO authenticated, anon USING (true);

-- Super-admin-only toggle
CREATE OR REPLACE FUNCTION public.set_feature_flag(p_key TEXT, p_enabled BOOLEAN)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public._caller_is_super_admin() THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.platform_feature_flags (key, enabled)
       VALUES (p_key, p_enabled)
  ON CONFLICT (key) DO UPDATE
    SET enabled = EXCLUDED.enabled, updated_at = now();
END; $$;
GRANT EXECUTE ON FUNCTION public.set_feature_flag(TEXT, BOOLEAN) TO authenticated;
