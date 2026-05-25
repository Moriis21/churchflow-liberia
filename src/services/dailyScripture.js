// ============================================================
// ChurchFlow Liberia — Daily Scripture Service
//
// Rules:
//   • Every role gets its own verse for the day, themed to their
//     responsibility (pastor → shepherding, treasurer → integrity,
//     member → faith & growth, etc.).
//   • Same user sees the same verse all day; it changes at midnight.
//   • Selection is deterministic (date-hash into role pool) so two
//     devices for the same role show the same verse, even before
//     the DB row is written.
//   • DB cache (`daily_scriptures`) persists the chosen verse so
//     pools can be expanded without breaking today's pick.
//   • If the DB is unreachable, the deterministic fallback still
//     gives a stable answer for today.
// ============================================================
import { insforge } from '../lib/insforge'

// ─── Local YYYY-MM-DD (avoids UTC drift in Liberia / +0) ─────
export function todayKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ─── Role normalization ──────────────────────────────────────
const ROLE_ALIASES = {
  admin: 'church_admin',
  churchadmin: 'church_admin',
  'church-admin': 'church_admin',
  departmentleader: 'dept_leader',
  department_leader: 'dept_leader',
  'department-leader': 'dept_leader',
  deptleader: 'dept_leader',
}
const VALID_ROLES = new Set([
  'church_admin', 'pastor', 'treasurer',
  'secretary',    'dept_leader', 'member',
])
export function normalizeRole(role) {
  const r = (role || '').toString().trim().toLowerCase().replace(/\s+/g, '_')
  if (VALID_ROLES.has(r)) return r
  if (ROLE_ALIASES[r]) return ROLE_ALIASES[r]
  return 'member'
}

// ─── Fallback scripture pools ────────────────────────────────
// Each entry: { reference, text, theme }
export const FALLBACK_SCRIPTURES = {
  pastor: [
    {
      reference: 'Jeremiah 3:15',
      text: '"And I will give you shepherds after my own heart, who will feed you with knowledge and understanding."',
      theme: 'Shepherding',
    },
    {
      reference: '2 Timothy 4:2',
      text: '"Preach the word; be ready in season and out of season; reprove, rebuke, and exhort, with complete patience and teaching."',
      theme: 'Teaching',
    },
    {
      reference: '1 Peter 5:2-3',
      text: '"Shepherd the flock of God that is among you... not domineering over those in your charge, but being examples to the flock."',
      theme: 'Leadership',
    },
    {
      reference: 'James 1:5',
      text: '"If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him."',
      theme: 'Wisdom',
    },
    {
      reference: 'Colossians 4:2',
      text: '"Continue steadfastly in prayer, being watchful in it with thanksgiving."',
      theme: 'Prayer',
    },
  ],

  church_admin: [
    {
      reference: '1 Corinthians 14:40',
      text: '"But all things should be done decently and in order."',
      theme: 'Order',
    },
    {
      reference: 'Colossians 3:23',
      text: '"Whatever you do, work heartily, as for the Lord and not for men."',
      theme: 'Diligence',
    },
    {
      reference: 'Proverbs 16:3',
      text: '"Commit your work to the Lord, and your plans will be established."',
      theme: 'Stewardship',
    },
    {
      reference: 'Nehemiah 4:6',
      text: '"So we built the wall... for the people had a mind to work."',
      theme: 'Service',
    },
    {
      reference: 'Romans 12:8',
      text: '"The one who leads, with zeal; the one who does acts of mercy, with cheerfulness."',
      theme: 'Leadership',
    },
  ],

  treasurer: [
    {
      reference: 'Luke 16:10',
      text: '"One who is faithful in a very little is also faithful in much, and one who is dishonest in a very little is also dishonest in much."',
      theme: 'Faithfulness',
    },
    {
      reference: 'Proverbs 11:1',
      text: '"A false balance is an abomination to the Lord, but a just weight is his delight."',
      theme: 'Integrity',
    },
    {
      reference: '2 Corinthians 9:7',
      text: '"Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver."',
      theme: 'Stewardship',
    },
    {
      reference: 'Proverbs 27:23',
      text: '"Know well the condition of your flocks, and give attention to your herds."',
      theme: 'Diligence',
    },
    {
      reference: '1 Timothy 6:10',
      text: '"For the love of money is a root of all kinds of evils."',
      theme: 'Honesty',
    },
  ],

  secretary: [
    {
      reference: 'Habakkuk 2:2',
      text: '"Write the vision; make it plain on tablets, so he may run who reads it."',
      theme: 'Communication',
    },
    {
      reference: 'Proverbs 25:11',
      text: '"A word fitly spoken is like apples of gold in a setting of silver."',
      theme: 'Wisdom',
    },
    {
      reference: 'Colossians 4:6',
      text: '"Let your speech always be gracious, seasoned with salt, so that you may know how you ought to answer each person."',
      theme: 'Communication',
    },
    {
      reference: 'Proverbs 22:29',
      text: '"Do you see a man skillful in his work? He will stand before kings."',
      theme: 'Diligence',
    },
    {
      reference: '1 Corinthians 14:40',
      text: '"But all things should be done decently and in order."',
      theme: 'Order',
    },
  ],

  dept_leader: [
    {
      reference: '1 Peter 4:10',
      text: '"As each has received a gift, use it to serve one another, as good stewards of God’s varied grace."',
      theme: 'Service',
    },
    {
      reference: 'Romans 12:6-8',
      text: '"Having gifts that differ according to the grace given to us, let us use them... the one who leads, with zeal."',
      theme: 'Leadership',
    },
    {
      reference: 'Mark 10:45',
      text: '"For even the Son of Man came not to be served but to serve, and to give his life as a ransom for many."',
      theme: 'Humility',
    },
    {
      reference: 'Ecclesiastes 4:9-10',
      text: '"Two are better than one, because they have a good reward for their toil."',
      theme: 'Teamwork',
    },
    {
      reference: 'Philippians 2:3',
      text: '"Do nothing from selfish ambition or conceit, but in humility count others more significant than yourselves."',
      theme: 'Humility',
    },
  ],

  member: [
    {
      reference: 'Proverbs 3:5-6',
      text: '"Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths."',
      theme: 'Faith',
    },
    {
      reference: 'Psalm 119:105',
      text: '"Your word is a lamp to my feet and a light to my path."',
      theme: 'Growth',
    },
    {
      reference: 'Philippians 4:13',
      text: '"I can do all things through him who strengthens me."',
      theme: 'Encouragement',
    },
    {
      reference: '1 Thessalonians 5:17',
      text: '"Pray without ceasing."',
      theme: 'Prayer',
    },
    {
      reference: 'John 13:34',
      text: '"A new commandment I give to you, that you love one another: just as I have loved you, you also are to love one another."',
      theme: 'Love',
    },
    {
      reference: 'James 1:22',
      text: '"But be doers of the word, and not hearers only, deceiving yourselves."',
      theme: 'Obedience',
    },
  ],
}

// ─── Deterministic pick from a pool by date ──────────────────
// Hash YYYY-MM-DD + role → stable index. Same input ⇒ same output.
function hashKey(str) {
  let h = 5381
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function selectScriptureByRole(role, date = todayKey()) {
  const r = normalizeRole(role)
  const pool = FALLBACK_SCRIPTURES[r] || FALLBACK_SCRIPTURES.member
  const idx = hashKey(`${date}|${r}`) % pool.length
  return { ...pool[idx], role: r, date, source: 'fallback' }
}

// ─── Persist today's pick (best-effort, idempotent) ──────────
export async function saveDailyScripture({ role, date, verse, churchId = null }) {
  const r = normalizeRole(role)
  const payload = {
    role:            r,
    date,
    verse_reference: verse.reference,
    verse_text:      verse.text,
    theme:           verse.theme || null,
    church_id:       churchId,
    is_active:       true,
  }
  try {
    const { data, error } = await insforge.database
      .from('daily_scriptures')
      .insert(payload)
      .select()
      .single()
    if (error) {
      // Unique violation → another tab already saved it; not a real error
      if (/duplicate|unique/i.test(error.message || '')) return null
      console.warn('[dailyScripture] save failed:', error.message)
      return null
    }
    return data
  } catch (err) {
    console.warn('[dailyScripture] save threw:', err?.message)
    return null
  }
}

// ─── Public API: get today's scripture for this role ─────────
// 1. look up DB row for (role,date, churchId or null)
// 2. fall back to deterministic pool pick + save it
// Always returns { reference, text, theme, role, date, source }.
export async function getDailyScripture({ role, churchId = null, date = todayKey() } = {}) {
  const r = normalizeRole(role)

  // 1. Try church-scoped row, then platform-default row
  try {
    let q = insforge.database
      .from('daily_scriptures')
      .select('verse_reference, verse_text, theme, role, date, church_id')
      .eq('role', r)
      .eq('date', date)
      .eq('is_active', true)

    if (churchId) {
      q = q.or(`church_id.eq.${churchId},church_id.is.null`)
    } else {
      q = q.is('church_id', null)
    }

    const { data, error } = await q
      .order('church_id', { ascending: false, nullsFirst: false })
      .limit(1)

    if (!error && Array.isArray(data) && data[0]) {
      const row = data[0]
      return {
        reference: row.verse_reference,
        text:      row.verse_text,
        theme:     row.theme,
        role:      row.role,
        date:      row.date,
        source:    'db',
      }
    }
  } catch (err) {
    console.warn('[dailyScripture] read failed, using fallback:', err?.message)
  }

  // 2. Deterministic fallback + best-effort cache write
  const picked = selectScriptureByRole(r, date)
  saveDailyScripture({
    role: r, date, verse: picked, churchId: null,
  }) // fire-and-forget
  return picked
}
