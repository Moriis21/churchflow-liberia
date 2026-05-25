-- ─────────────────────────────────────────────────────────────
-- Seed curated Bible Learning resources
-- ─────────────────────────────────────────────────────────────

-- BibleProject
INSERT INTO public.media_resources
(title, description, provider, category, resource_type, embed_url, external_url, thumbnail_url, speaker, tags, featured, sort_order) VALUES
('Genesis 1–11 Overview',
 'A 9-minute animated overview of the first eleven chapters of Genesis.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/F4isSyennFo',
 'https://bibleproject.com/explore/video/genesis-1-11/',
 'https://img.youtube.com/vi/F4isSyennFo/maxresdefault.jpg',
 'BibleProject', ARRAY['old testament','overview'], true, 10),

('Gospel of Matthew Overview',
 'A two-part animated overview of Matthew''s account of Jesus.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/3Dv4-n6OYGI',
 'https://bibleproject.com/explore/video/matthew/',
 'https://img.youtube.com/vi/3Dv4-n6OYGI/maxresdefault.jpg',
 'BibleProject', ARRAY['new testament','gospels'], true, 20),

('What Is the Bible? — Series Intro',
 'BibleProject introduction to what the Bible is, and how to read it.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/ak06MSETeo4',
 'https://bibleproject.com/explore/how-to-read-the-bible/',
 'https://img.youtube.com/vi/ak06MSETeo4/maxresdefault.jpg',
 'BibleProject', ARRAY['intro','how to read'], false, 30),

('Word Study: Shalom',
 'BibleProject word study on "shalom" — peace, completeness, wholeness.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/oLYORLZOaZE',
 'https://bibleproject.com/explore/video/shalom-peace/',
 'https://img.youtube.com/vi/oLYORLZOaZE/maxresdefault.jpg',
 'BibleProject', ARRAY['word study','peace'], false, 40),

('BibleProject — All Videos Hub',
 'Browse the full BibleProject video library on YouTube.',
 'bibleproject', 'youtube_channel', 'channel',
 NULL,
 'https://www.youtube.com/@bibleproject/videos',
 NULL,
 'BibleProject', ARRAY['library'], false, 100),

('BibleProject Classroom',
 'Free in-depth Bible courses from BibleProject.',
 'bibleproject', 'course', 'website',
 NULL, 'https://bibleproject.com/classroom/', NULL,
 'BibleProject', ARRAY['courses'], false, 110),

('BibleProject Downloads',
 'Free downloadable posters, study notes, and reading plans.',
 'bibleproject', 'download', 'download',
 NULL, 'https://bibleproject.com/downloads/', NULL,
 'BibleProject', ARRAY['downloads','study notes'], false, 120),

('BibleProject App — Google Play',
 'Install the BibleProject app on Android.',
 'bibleproject', 'app', 'app',
 NULL, 'https://play.google.com/store/apps/details?id=com.bibleproject.bible', NULL,
 'BibleProject', ARRAY['android','app'], false, 130),

('BibleProject App — App Store',
 'Install the BibleProject app on iPhone / iPad.',
 'bibleproject', 'app', 'app',
 NULL, 'https://apps.apple.com/us/app/bibleproject/id1320435329', NULL,
 'BibleProject', ARRAY['ios','app'], false, 140),

('BibleProject — YouTube Channel',
 'Subscribe to BibleProject on YouTube for animated Bible teaching.',
 'bibleproject', 'youtube_channel', 'channel',
 NULL, 'https://www.youtube.com/@bibleproject', NULL,
 'BibleProject', ARRAY['channel'], false, 150),

-- WVBS (World Video Bible School)
('WVBS: Searching for Truth',
 'A 12-part series presenting the Bible''s teaching on salvation.',
 'wvbs', 'video', 'video',
 'https://www.youtube.com/embed/Yk_l8Yo04hA',
 'https://video.wvbs.org/video/searching-for-truth-english/',
 'https://img.youtube.com/vi/Yk_l8Yo04hA/maxresdefault.jpg',
 'WVBS', ARRAY['salvation','series'], true, 10),

('WVBS: How We Got the Bible',
 'A study of how the Bible came to us in its present form.',
 'wvbs', 'video', 'video',
 'https://www.youtube.com/embed/L33MhrEH2NU',
 'https://video.wvbs.org/video/how-we-got-the-bible/',
 'https://img.youtube.com/vi/L33MhrEH2NU/maxresdefault.jpg',
 'WVBS', ARRAY['apologetics','bible history'], true, 20),

('WVBS Online Bible School',
 'Free online Bible courses from WVBS for systematic study.',
 'wvbs', 'course', 'website',
 NULL, 'https://walkingwith.wvbs.org/', NULL,
 'WVBS', ARRAY['courses'], false, 100),

('WVBS — YouTube Channel',
 'WVBS video Bible lessons on YouTube.',
 'wvbs', 'youtube_channel', 'channel',
 NULL, 'https://www.youtube.com/@WVBSVideos', NULL,
 'WVBS', ARRAY['channel'], false, 110),

('WVBS Bible Study Videos',
 'Free Bible study video library — every video on every book of the Bible.',
 'wvbs', 'video', 'website',
 NULL, 'https://video.wvbs.org/', NULL,
 'WVBS', ARRAY['library'], false, 120),

('WVBS Children''s Bible Lessons',
 'Age-appropriate animated Bible lessons for kids.',
 'wvbs', 'children', 'website',
 NULL, 'https://video.wvbs.org/category/all-videos/', NULL,
 'WVBS', ARRAY['kids','children'], false, 130),

('WVBS Reading Plan Resources',
 'Bible reading plans + companion videos.',
 'wvbs', 'study_guide', 'website',
 NULL, 'https://walkingwith.wvbs.org/courses/wbs-monthly-bible-reading-plan/', NULL,
 'WVBS', ARRAY['reading plan','study guide'], false, 140),

-- Apps & YouTube — extra picks
('YouVersion Bible App — Google Play',
 'The most popular Bible app, free with hundreds of translations and reading plans.',
 'youtube', 'app', 'app',
 NULL, 'https://play.google.com/store/apps/details?id=com.sirma.mobile.bible.android', NULL,
 'YouVersion', ARRAY['android','app'], false, 200),

('YouVersion Bible App — App Store',
 'YouVersion Bible app for iPhone / iPad.',
 'youtube', 'app', 'app',
 NULL, 'https://apps.apple.com/us/app/bible/id282935706', NULL,
 'YouVersion', ARRAY['ios','app'], false, 210);
