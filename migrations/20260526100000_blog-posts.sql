-- ─────────────────────────────────────────────────────────────
-- Blog posts table + seed with the 4 existing hardcoded posts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  excerpt      TEXT NOT NULL,
  body         TEXT NOT NULL DEFAULT '',
  author_name  TEXT NOT NULL DEFAULT 'ChurchFlow Team',
  author_role  TEXT NOT NULL DEFAULT '',
  category     TEXT NOT NULL DEFAULT 'General',
  cover_url    TEXT,
  read_time    TEXT NOT NULL DEFAULT '5 min read',
  published    BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_slug_idx   ON public.blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_pub_idx    ON public.blog_posts (published, published_at DESC);

-- RLS: anyone can read published posts; only super admin can write
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS blog_public_read ON public.blog_posts;
CREATE POLICY blog_public_read ON public.blog_posts
  FOR SELECT TO authenticated, anon
  USING (published = true);

DROP POLICY IF EXISTS blog_admin_all ON public.blog_posts;
CREATE POLICY blog_admin_all ON public.blog_posts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Seed the 4 existing hardcoded posts
INSERT INTO public.blog_posts (slug, title, excerpt, body, author_name, author_role, category, read_time, published, published_at) VALUES

('5-reasons-digital-records',
 '5 Reasons Liberian Churches Are Switching to Digital Record-Keeping',
 'Paper attendance sheets and handwritten ledgers have served Liberian churches for decades. But as congregations grow and administrative complexity increases, more and more ministries are making the switch to dedicated software. Here is why — and what to look for.',
 E'Paper attendance sheets and handwritten ledgers have served Liberian churches for decades. But as congregations grow and administrative complexity increases, more ministries are making the switch to dedicated software.\n\n## 1. Accuracy and accountability\n\nHandwritten records are prone to errors, smudges, and loss. Digital systems timestamp every entry, flag duplicates, and keep a full audit trail. When your treasurer presents the monthly finance report, every figure traces back to a specific transaction on a specific date.\n\n## 2. Time savings for leadership\n\nChurch administrators often spend hours each week manually compiling attendance totals, calculating tithes, or searching through filing cabinets for a member''s contact details. A digital system reduces that to seconds.\n\n## 3. Better member care\n\nWhen a pastor knows that a member has missed three Sundays in a row, they can reach out. Digital attendance tracking surfaces patterns that paper records never could.\n\n## 4. Financial transparency\n\nCongregations expect accountability from their leadership. Generating a clear, itemised finance report at the push of a button builds trust and removes any suspicion of mismanagement.\n\n## 5. Disaster recovery\n\nFire, flooding, and theft are real risks in Liberia. A cloud-based system means your church records are safe even if the building is not.\n\n---\n\n*ChurchFlow Liberia is built specifically for Liberian churches — from Monrovia to Buchanan, from small fellowships to large congregations.*',
 'Grace Kollie', 'Head of Product', 'Church Management', '5 min read', true, '2026-05-15 08:00:00+00'),

('monthly-finance-report',
 'How to Run a Successful Church Finance Report Every Month',
 'Transparent financial reporting builds trust between church leadership and the congregation. This guide walks through the monthly finance report process step by step — from recording offerings to presenting the report to your board.',
 E'Transparent financial reporting builds trust between church leadership and the congregation. This step-by-step guide covers everything from recording the first offering to presenting a polished report to your church board.\n\n## Step 1: Record all income\n\nEvery offering — Sunday tithes, special collections, and designated gifts — should be entered into your system within 24 hours of collection. Record the amount, date, service, and whether it is a tithe, offering, or special gift.\n\n## Step 2: Record all expenses\n\nFrom electricity bills to pastoral salaries, every outgoing payment needs a category, amount, date, and receipt. ChurchFlow lets you attach a photo of the receipt directly to the expense entry.\n\n## Step 3: Reconcile with your bank\n\nOnce a month, compare your recorded transactions against your church bank statement. Every line should match. Unexplained discrepancies need to be investigated before the board meeting.\n\n## Step 4: Generate the report\n\nA good monthly finance report includes: total income by category, total expenses by category, net surplus or deficit, year-to-date comparisons, and any significant variances explained in plain language.\n\n## Step 5: Present to the board\n\nPresent the report in writing at least 48 hours before the meeting. Walk through each section clearly. Be ready to answer questions. Transparency is not weakness — it is leadership.\n\n---\n\n*ChurchFlow generates all of these reports automatically from your recorded data.*',
 'Samuel Kwame', 'CEO', 'Finance', '7 min read', true, '2026-05-08 08:00:00+00'),

('digital-transformation-african-churches',
 'Digital Transformation in African Churches: Where Are We Now?',
 'Across sub-Saharan Africa, churches are at very different stages of their digital journey. This article surveys the current state of technology adoption among African congregations and what the next five years are likely to look like.',
 E'Across sub-Saharan Africa, churches are at very different stages of their digital journey. From large Pentecostal megachurches in Lagos and Nairobi to small rural fellowships in Liberia and Sierra Leone, the picture is complex.\n\n## The early adopters\n\nLarge urban churches with professional administrators and significant budgets have been using software since the early 2010s. Most started with generic tools — Excel, WhatsApp groups, Google Forms — before graduating to dedicated church management software.\n\n## The majority: still on paper\n\nThe majority of African churches, particularly those with fewer than 200 members, still rely entirely on paper records. The barriers are cost, complexity, and connectivity — not willingness. When the right tool exists at the right price point, adoption happens quickly.\n\n## What is changing\n\nThree forces are accelerating digital adoption: smartphone penetration (now above 50% in West Africa), mobile money normalisation, and a generation of young church administrators who have grown up digital.\n\n## The next five years\n\nBy 2030, we expect the majority of urban African churches with more than 100 members to be using some form of digital management software. The key competitive frontier will be localisation — tools built for African currencies, languages, and church governance structures.\n\n---\n\n*ChurchFlow Liberia is built specifically for Liberian congregations, with Liberian dollars, Liberian naming conventions, and Liberian church structures.*',
 'Emmanuel Gbaye', 'Head of Engineering', 'Industry', '8 min read', true, '2026-04-28 08:00:00+00'),

('visitor-follow-up-guide',
 'The Complete Guide to Visitor Follow-Up in Your Church',
 'Studies show that churches that contact first-time visitors within 36 hours see dramatically higher retention rates. This practical guide covers exactly how to build a visitor follow-up system — from the welcome desk to membership.',
 E'Studies consistently show that churches that contact first-time visitors within 36 hours see dramatically higher retention rates. Yet most churches have no formal follow-up system at all. Here is how to build one.\n\n## At the welcome desk\n\nEvery first-time visitor should be warmly greeted and offered a visitor card. Keep the card short: name, phone number, email, and how they heard about the church. Do not ask for too much — you want them to fill it in, not feel interrogated.\n\n## Same day: the warm handoff\n\nBefore the visitor leaves the building, introduce them to a pastor or senior member. A 60-second human connection makes the difference between a visitor who returns and one who does not.\n\n## Within 24 hours: the first contact\n\nA brief SMS or WhatsApp message: "It was great to have you with us today. We hope to see you again soon." Signed by a real person, not "The Church Office."\n\n## Within one week: the pastoral visit or call\n\nA phone call from the pastor or a deacon to check in. Ask if they have any questions. Invite them to a midweek Bible study or small group.\n\n## Within one month: the membership pathway\n\nIf they have attended two or three times, invite them to a membership class. Explain what it means to be a member, what the church believes, and what is expected.\n\n---\n\n*ChurchFlow''s visitor management module tracks every touchpoint and reminds your team when follow-ups are overdue.*',
 'Grace Kollie', 'Head of Product', 'Ministry Growth', '6 min read', true, '2026-04-20 08:00:00+00')

ON CONFLICT (slug) DO NOTHING;
