// ============================================================
// ChurchFlow Liberia — Sitemap generator
//
// Writes public/sitemap.xml from the static marketing routes plus
// every published blog post (fetched live from InsForge). Run after
// publishing new blog posts:
//
//   node scripts/generate-sitemap.mjs
//
// Falls back to a built-in slug list if the backend is unreachable so
// the build never breaks.
// ============================================================
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = join(__dirname, '..')
const SITE      = 'https://churchflow.innova-lib.com'

// ── Read InsForge creds from .env (best-effort) ──────────────
function readEnv(key) {
  if (process.env[key]) return process.env[key]
  try {
    const env = readFileSync(join(ROOT, '.env'), 'utf8')
    const m = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
    return m ? m[1].trim() : ''
  } catch { return '' }
}

const BASE_URL = (readEnv('VITE_INSFORGE_URL') || '').replace(/\/+$/, '')
const ANON_KEY = readEnv('VITE_INSFORGE_ANON_KEY')

// Static public routes (path, changefreq, priority)
const STATIC = [
  ['/',          'weekly',  '1.0'],
  ['/features',  'monthly', '0.9'],
  ['/pricing',   'monthly', '0.9'],
  ['/blog',      'weekly',  '0.8'],
  ['/about',     'monthly', '0.7'],
  ['/contact',   'monthly', '0.7'],
  ['/tutorials', 'weekly',  '0.7'],
  ['/webinars',  'weekly',  '0.7'],
  ['/docs',      'monthly', '0.6'],
  ['/help',      'monthly', '0.6'],
  ['/community', 'monthly', '0.5'],
  ['/careers',   'monthly', '0.5'],
  ['/press',     'monthly', '0.4'],
  ['/changelog', 'monthly', '0.4'],
  ['/roadmap',   'monthly', '0.4'],
  ['/status',    'weekly',  '0.3'],
  ['/privacy',   'yearly',  '0.3'],
  ['/terms',     'yearly',  '0.3'],
  ['/cookies',   'yearly',  '0.3'],
  ['/gdpr',      'yearly',  '0.3'],
]

// Fallback blog slugs (used only if the backend is unreachable)
const FALLBACK_SLUGS = [
  'best-church-management-software-liberia',
  'church-attendance-tracking-liberia',
  'church-tithe-offering-management-liberia',
  'how-to-grow-church-liberia',
  'church-member-management-system',
  'church-sms-communication-liberia',
  'church-data-security-africa',
  'prayer-request-management-church',
  'church-event-planning-liberia',
  'church-technology-west-africa-2026',
  '5-reasons-digital-records',
  'monthly-finance-report',
  'digital-transformation-african-churches',
  'visitor-follow-up-guide',
].map((slug) => ({ slug, published_at: null }))

async function fetchPosts() {
  if (!BASE_URL || !ANON_KEY) return FALLBACK_SLUGS
  try {
    const url = `${BASE_URL}/api/database/records/blog_posts?select=slug,published_at&published=eq.true&order=published_at.desc`
    const res = await fetch(url, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const rows = await res.json()
    return Array.isArray(rows) && rows.length ? rows : FALLBACK_SLUGS
  } catch (e) {
    console.warn(`[sitemap] backend unreachable (${e.message}) — using fallback slug list`)
    return FALLBACK_SLUGS
  }
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')
}

const today = new Date().toISOString().slice(0, 10)
const posts = await fetchPosts()

const entries = [
  ...STATIC.map(([path, freq, pri]) => urlEntry(`${SITE}${path}`, today, freq, pri)),
  ...posts.map((p) =>
    urlEntry(`${SITE}/blog/${p.slug}`, (p.published_at || '').slice(0, 10) || today, 'monthly', '0.6')
  ),
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

writeFileSync(join(ROOT, 'public', 'sitemap.xml'), xml, 'utf8')
console.log(`[sitemap] wrote public/sitemap.xml — ${STATIC.length} pages + ${posts.length} blog posts`)
