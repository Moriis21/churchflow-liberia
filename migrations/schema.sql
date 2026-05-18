-- ChurchFlow Liberia — Full Database Schema
-- Applied via: npx @insforge/cli db import migrations/schema.sql

-- ─── 1. CHURCHES ────────────────────────────────────────────
CREATE TABLE churches (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  location     TEXT,
  phone        TEXT,
  email        TEXT,
  website      TEXT,
  logo_url     TEXT,
  currency     TEXT NOT NULL DEFAULT 'LRD',
  founded_date DATE,
  description  TEXT,
  owner_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER churches_updated_at
  BEFORE UPDATE ON churches FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE churches ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_owner_all ON churches
  FOR ALL USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ─── 2. USER PROFILES (must come before branches for RLS refs) ──
CREATE TABLE user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  church_id  UUID REFERENCES churches(id) ON DELETE CASCADE,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'member'
             CHECK (role IN ('super_admin','church_admin','pastor','treasurer','secretary','dept_leader','member')),
  phone      TEXT,
  avatar_url TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_profile_all ON user_profiles
  FOR ALL USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY church_profiles_select ON user_profiles
  FOR SELECT USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 3. BRANCHES ────────────────────────────────────────────
CREATE TABLE branches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  location    TEXT,
  pastor      TEXT,
  phone       TEXT,
  description TEXT,
  established DATE,
  is_main     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER branches_updated_at
  BEFORE UPDATE ON branches FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_branches_all ON branches
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 4. DEPARTMENTS ─────────────────────────────────────────
CREATE TABLE departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  leader_id   UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  leader_name TEXT,
  color       TEXT DEFAULT '#7C3AED',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON departments FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_departments_all ON departments
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 5. MEMBERS ─────────────────────────────────────────────
CREATE TABLE members (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id         UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id         UUID REFERENCES branches(id) ON DELETE SET NULL,
  department_id     UUID REFERENCES departments(id) ON DELETE SET NULL,
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name         TEXT NOT NULL,
  gender            TEXT CHECK (gender IN ('male','female','other')),
  date_of_birth     DATE,
  marital_status    TEXT CHECK (marital_status IN ('single','married','divorced','widowed')),
  profile_photo_url TEXT,
  phone             TEXT,
  email             TEXT,
  address           TEXT,
  membership_status TEXT NOT NULL DEFAULT 'active'
                    CHECK (membership_status IN ('active','inactive','new','transferred')),
  baptism_status    BOOLEAN DEFAULT FALSE,
  join_date         DATE DEFAULT CURRENT_DATE,
  emergency_contact TEXT,
  emergency_phone   TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_church_id     ON members(church_id);
CREATE INDEX idx_members_department_id ON members(department_id);
CREATE INDEX idx_members_status        ON members(membership_status);

CREATE TRIGGER members_updated_at
  BEFORE UPDATE ON members FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_members_all ON members
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 6. ATTENDANCE ──────────────────────────────────────────
CREATE TABLE attendance (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id     UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id     UUID REFERENCES branches(id) ON DELETE SET NULL,
  service_type  TEXT NOT NULL,
  service_date  DATE NOT NULL,
  present_count INT DEFAULT 0,
  absent_count  INT DEFAULT 0,
  late_count    INT DEFAULT 0,
  visitor_count INT DEFAULT 0,
  notes         TEXT,
  recorded_by   UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attendance_church_date ON attendance(church_id, service_date);

CREATE TRIGGER attendance_updated_at
  BEFORE UPDATE ON attendance FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_attendance_all ON attendance
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 7. ATTENDANCE MEMBERS ──────────────────────────────────
CREATE TABLE attendance_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'present'
                CHECK (status IN ('present','absent','late')),
  checked_in_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_att_members_attendance ON attendance_members(attendance_id);
CREATE INDEX idx_att_members_member     ON attendance_members(member_id);

ALTER TABLE attendance_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY att_members_access ON attendance_members
  FOR ALL USING (
    attendance_id IN (
      SELECT a.id FROM attendance a
      INNER JOIN user_profiles up ON up.church_id = a.church_id
      WHERE up.id = auth.uid()
    )
  );

-- ─── 8. OFFERINGS ───────────────────────────────────────────
CREATE TABLE offerings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  member_id   UUID REFERENCES members(id) ON DELETE SET NULL,
  member_name TEXT,
  type        TEXT NOT NULL
              CHECK (type IN ('tithe','offering','thanksgiving','building_fund','donation','special')),
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'LRD',
  amount_usd  NUMERIC(12,2),
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  recorded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_offerings_church_date ON offerings(church_id, date);
CREATE INDEX idx_offerings_type        ON offerings(type);

CREATE TRIGGER offerings_updated_at
  BEFORE UPDATE ON offerings FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_offerings_all ON offerings
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','treasurer','secretary')
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','treasurer','secretary')
  );

-- ─── 9. EXPENSES ────────────────────────────────────────────
CREATE TABLE expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'LRD',
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_by TEXT,
  receipt_url TEXT,
  recorded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_church_date ON expenses(church_id, date);

CREATE TRIGGER expenses_updated_at
  BEFORE UPDATE ON expenses FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY finance_expenses_all ON expenses
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','treasurer','secretary')
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','treasurer','secretary')
  );

-- ─── 10. EVENTS ─────────────────────────────────────────────
CREATE TABLE events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id      UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id      UUID REFERENCES branches(id) ON DELETE SET NULL,
  title          TEXT NOT NULL,
  type           TEXT NOT NULL,
  description    TEXT,
  event_date     DATE NOT NULL,
  start_time     TIME,
  end_time       TIME,
  venue          TEXT,
  expected_count INT,
  actual_count   INT DEFAULT 0,
  volunteers     TEXT[],
  status         TEXT NOT NULL DEFAULT 'upcoming'
                 CHECK (status IN ('upcoming','ongoing','completed','cancelled')),
  created_by     UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_church_date ON events(church_id, event_date);

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_events_all ON events
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 11. VISITORS ───────────────────────────────────────────
CREATE TABLE visitors (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id           UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id           UUID REFERENCES branches(id) ON DELETE SET NULL,
  full_name           TEXT NOT NULL,
  phone               TEXT,
  email               TEXT,
  address             TEXT,
  visit_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  how_found           TEXT,
  follow_up_status    TEXT NOT NULL DEFAULT 'pending'
                      CHECK (follow_up_status IN ('pending','contacted','converted')),
  assigned_to         UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  assigned_name       TEXT,
  notes               TEXT,
  converted_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visitors_church ON visitors(church_id);

CREATE TRIGGER visitors_updated_at
  BEFORE UPDATE ON visitors FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_visitors_all ON visitors
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 12. VISITOR NOTES ──────────────────────────────────────
CREATE TABLE visitor_notes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id    UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
  church_id     UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  note          TEXT NOT NULL,
  added_by      UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  added_by_name TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE visitor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_visitor_notes_all ON visitor_notes
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

-- ─── 13. PRAYER REQUESTS ────────────────────────────────────
CREATE TABLE prayer_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id    UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  member_id    UUID REFERENCES members(id) ON DELETE SET NULL,
  member_name  TEXT,
  request      TEXT NOT NULL,
  visibility   TEXT NOT NULL DEFAULT 'public'
               CHECK (visibility IN ('public','private','pastor_only')),
  status       TEXT NOT NULL DEFAULT 'open'
               CHECK (status IN ('open','answered')),
  response     TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  answered_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_prayer_church ON prayer_requests(church_id);

CREATE TRIGGER prayer_requests_updated_at
  BEFORE UPDATE ON prayer_requests FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY prayer_insert_auth ON prayer_requests
  FOR INSERT WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY prayer_select_policy ON prayer_requests
  FOR SELECT USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (
      visibility = 'public'
      OR member_id IN (SELECT id FROM members WHERE user_id = auth.uid())
      OR (SELECT role FROM user_profiles WHERE id = auth.uid())
         IN ('super_admin','church_admin','pastor','secretary')
    )
  );

CREATE POLICY prayer_update_pastor ON prayer_requests
  FOR UPDATE USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor')
  );

-- ─── 14. SERMONS ────────────────────────────────────────────
CREATE TABLE sermons (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id   UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  branch_id   UUID REFERENCES branches(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  preacher    TEXT,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'video'
              CHECK (type IN ('video','audio','live','devotional')),
  platform    TEXT CHECK (platform IN ('youtube','facebook','zoom','other')),
  url         TEXT,
  thumbnail   TEXT,
  duration    TEXT,
  sermon_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_live     BOOLEAN DEFAULT FALSE,
  views       INT DEFAULT 0,
  created_by  UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sermons_church ON sermons(church_id);

CREATE TRIGGER sermons_updated_at
  BEFORE UPDATE ON sermons FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_sermons_select ON sermons
  FOR SELECT USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY church_sermons_write ON sermons
  FOR INSERT WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','secretary')
  );

CREATE POLICY church_sermons_update ON sermons
  FOR UPDATE USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','secretary')
  );

-- ─── 15. NOTIFICATIONS ──────────────────────────────────────
CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id  UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  type       TEXT DEFAULT 'info'
             CHECK (type IN ('info','success','warning','alert','birthday','event','prayer')),
  is_read    BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_notifications ON notifications
  FOR ALL USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── 16. SMS LOGS ───────────────────────────────────────────
CREATE TABLE sms_logs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  recipient TEXT NOT NULL,
  message   TEXT NOT NULL,
  type      TEXT DEFAULT 'general',
  status    TEXT DEFAULT 'sent'
            CHECK (status IN ('sent','failed','pending')),
  sent_by   UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  sent_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sms_church ON sms_logs(church_id);

ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_sms_access ON sms_logs
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin','pastor','secretary')
  );

-- ─── 17. SETTINGS ───────────────────────────────────────────
CREATE TABLE settings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id      UUID NOT NULL UNIQUE REFERENCES churches(id) ON DELETE CASCADE,
  sms_api_key    TEXT,
  sms_sender_id  TEXT,
  primary_color  TEXT DEFAULT '#7C3AED',
  theme_mode     TEXT DEFAULT 'light',
  backup_enabled BOOLEAN DEFAULT FALSE,
  extra          JSONB DEFAULT '{}',
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY church_settings_admin ON settings
  FOR ALL USING (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin')
  )
  WITH CHECK (
    church_id IN (SELECT church_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role FROM user_profiles WHERE id = auth.uid())
        IN ('super_admin','church_admin')
  );
