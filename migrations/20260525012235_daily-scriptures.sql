-- =============================================================
-- ChurchFlow Liberia — Daily Scripture
--
-- Each (role, date, church_id?) combo gets one verse for the day.
-- A church_id of NULL means "platform default for this role/date".
-- =============================================================
CREATE TABLE IF NOT EXISTS public.daily_scriptures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role            TEXT NOT NULL CHECK (role IN (
                    'church_admin','pastor','treasurer',
                    'secretary','dept_leader','member'
                  )),
  verse_reference TEXT NOT NULL,
  verse_text      TEXT NOT NULL,
  theme           TEXT,
  date            DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  church_id       UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One verse per (role, date) globally, or per (role, date, church) when scoped
CREATE UNIQUE INDEX IF NOT EXISTS daily_scriptures_role_date_church_uq
  ON public.daily_scriptures (role, date, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS daily_scriptures_date_idx
  ON public.daily_scriptures (date DESC);

-- updated_at touch trigger (reuses helper if it exists)
CREATE OR REPLACE FUNCTION public.touch_daily_scriptures_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_daily_scriptures_updated_at ON public.daily_scriptures;
CREATE TRIGGER trg_daily_scriptures_updated_at
  BEFORE UPDATE ON public.daily_scriptures
  FOR EACH ROW EXECUTE FUNCTION public.touch_daily_scriptures_updated_at();

-- Read access for any signed-in user; writes via service code (anon allowed
-- so first-fetch-of-the-day cache write works for any logged-in role).
ALTER TABLE public.daily_scriptures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS daily_scriptures_read  ON public.daily_scriptures;
DROP POLICY IF EXISTS daily_scriptures_write ON public.daily_scriptures;

CREATE POLICY daily_scriptures_read  ON public.daily_scriptures
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY daily_scriptures_write ON public.daily_scriptures
  FOR INSERT TO authenticated WITH CHECK (true);
