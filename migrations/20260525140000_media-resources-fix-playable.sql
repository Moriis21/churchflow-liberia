-- ─────────────────────────────────────────────────────────────
-- Replace BibleProject "website" entries with real, playable
-- YouTube videos from their current 10 Commandments series.
-- Remove WVBS "website" entries that won't iframe (X-Frame-Options).
-- ─────────────────────────────────────────────────────────────

-- Remove the 10 BibleProject + 7 WVBS website-only rows from the
-- previous seed migration so we can replace them with real videos.
DELETE FROM public.media_resources
WHERE provider IN ('bibleproject','wvbs')
  AND resource_type = 'website'
  AND embed_url IS NULL
  AND sort_order BETWEEN 30 AND 99;

-- ─── BibleProject: real, working YouTube videos ──────────────
-- All IDs sourced live from the BibleProject channel feed.
INSERT INTO public.media_resources
(title, description, provider, category, resource_type, embed_url, external_url, thumbnail_url, speaker, tags, featured, sort_order) VALUES

('How You Approach the 10 Commandments Really Matters',
 'BibleProject explores how the way we read the 10 Commandments shapes everything that follows.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/4M9BsOvx6cs',
 'https://www.youtube.com/watch?v=4M9BsOvx6cs',
 'https://img.youtube.com/vi/4M9BsOvx6cs/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','old testament'], true, 50),

('1st Commandment: No Other Gods',
 'What is the 1st Commandment really asking us to do? A look at exclusive loyalty to Yahweh.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/JGI8nNVkZpA',
 'https://www.youtube.com/watch?v=JGI8nNVkZpA',
 'https://img.youtube.com/vi/JGI8nNVkZpA/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','worship'], true, 51),

('Wisdom in the 1st Commandment',
 'A deeper look at what putting Yahweh first actually means for everyday life.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/w0iZ-hc7G9M',
 'https://www.youtube.com/watch?v=w0iZ-hc7G9M',
 'https://img.youtube.com/vi/w0iZ-hc7G9M/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','wisdom'], false, 52),

('2nd Commandment: No Idols',
 'Why God told Israel not to make idols — and what idolatry looks like today.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/vXHDUs28rPM',
 'https://www.youtube.com/watch?v=vXHDUs28rPM',
 'https://img.youtube.com/vi/vXHDUs28rPM/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','idolatry'], true, 53),

('Wisdom in the 2nd Commandment',
 'A deeper study of the 2nd Commandment and the human heart''s tendency toward idols.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/V_UL7evhaBg',
 'https://www.youtube.com/watch?v=V_UL7evhaBg',
 'https://img.youtube.com/vi/V_UL7evhaBg/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','wisdom'], false, 54),

('3rd Commandment: Do Not Take God''s Name in Vain',
 'The 3rd Commandment is not really about swearing — here''s what it''s actually about.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/elhazm4fZeE',
 'https://www.youtube.com/watch?v=elhazm4fZeE',
 'https://img.youtube.com/vi/elhazm4fZeE/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','holiness'], true, 55),

('In the Studio: 3rd Commandment',
 'A behind-the-scenes conversation with the BibleProject scholars on the 3rd Commandment.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/eiJbjmqOD54',
 'https://www.youtube.com/watch?v=eiJbjmqOD54',
 'https://img.youtube.com/vi/eiJbjmqOD54/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','podcast'], false, 56),

('4th Commandment: Remember the Sabbath',
 'Why Sabbath rest matters and what it means for followers of Jesus today.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/VsAmFJ6quZk',
 'https://www.youtube.com/watch?v=VsAmFJ6quZk',
 'https://img.youtube.com/vi/VsAmFJ6quZk/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','sabbath','rest'], true, 57),

('In the Studio: 4th Commandment',
 'Behind the scenes — how the BibleProject team studied Sabbath together.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/npkMrWPDpWI',
 'https://www.youtube.com/watch?v=npkMrWPDpWI',
 'https://img.youtube.com/vi/npkMrWPDpWI/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','podcast'], false, 58),

('5th Commandment: Honor Your Father and Mother',
 'What honoring parents looks like at every stage of life — childhood through adulthood.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/Q7PgVAN2MPo',
 'https://www.youtube.com/watch?v=Q7PgVAN2MPo',
 'https://img.youtube.com/vi/Q7PgVAN2MPo/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','family'], true, 59),

('In the Studio: 5th Commandment',
 'A scholar conversation about honoring parents in the biblical world and today.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/EgF5fMp4RNM',
 'https://www.youtube.com/watch?v=EgF5fMp4RNM',
 'https://img.youtube.com/vi/EgF5fMp4RNM/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','podcast'], false, 60),

('6th Commandment: Do Not Kill',
 'A deep dive into what the 6th Commandment forbids — and what it positively calls us to.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/uAQ5KaEd98Q',
 'https://www.youtube.com/watch?v=uAQ5KaEd98Q',
 'https://img.youtube.com/vi/uAQ5KaEd98Q/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','life'], true, 61),

('In the Studio: 6th Commandment',
 'Behind the scenes on the 6th Commandment — life, anger, and the heart.',
 'bibleproject', 'video', 'video',
 'https://www.youtube.com/embed/AKmdcNfnvjc',
 'https://www.youtube.com/watch?v=AKmdcNfnvjc',
 'https://img.youtube.com/vi/AKmdcNfnvjc/maxresdefault.jpg',
 'BibleProject', ARRAY['10 commandments','podcast'], false, 62);
