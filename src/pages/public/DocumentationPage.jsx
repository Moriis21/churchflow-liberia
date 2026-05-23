// ============================================================
// ChurchFlow Liberia — Documentation Page (/docs)
// ============================================================
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Users, CalendarCheck, DollarSign, CalendarDays,
  BarChart2, Code2, HelpCircle, ChevronRight, Rocket,
  Building2, UserPlus, ListChecks, CheckCircle2, MessageSquare,
  Mic2, CreditCard, Smartphone, Download, FileText
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const SIDEBAR_SECTIONS = [
  {
    label: 'Getting Started',
    icon: Rocket,
    items: [
      { label: 'Introduction',            anchor: 'intro'        },
      { label: 'Create your account',     anchor: 'create'       },
      { label: 'Set up church profile',   anchor: 'profile'      },
      { label: 'Add your first members',  anchor: 'members'      },
      { label: 'Record attendance',       anchor: 'attendance'   },
      { label: 'Add first offering',      anchor: 'offering'     },
    ],
  },
  {
    label: 'Core Guides',
    icon: BookOpen,
    items: [
      { label: 'Managing members',        anchor: 'g-members'    },
      { label: 'Recording attendance',    anchor: 'g-attendance' },
      { label: 'Recording offerings',     anchor: 'g-offerings'  },
      { label: 'Creating events',         anchor: 'g-events'     },
      { label: 'Sending SMS messages',    anchor: 'g-sms'        },
      { label: 'Sermon management',       anchor: 'g-sermons'    },
      { label: 'Member portal',           anchor: 'g-portal'     },
      { label: 'Exporting your data',     anchor: 'g-export'     },
      { label: 'Billing & plans',         anchor: 'g-billing'    },
    ],
  },
  {
    label: 'FAQs',
    icon: HelpCircle,
    items: [
      { label: 'Frequently asked questions', anchor: 'faq'      },
    ],
  },
]

// ─── Full guides (rendered as articles below getting-started) ──
const FULL_GUIDES = [
  {
    anchor: 'g-members',
    icon: Users,
    title: 'Managing church members',
    intro: 'Members are the heart of ChurchFlow. This guide covers everything from adding a single member to importing your entire congregation.',
    sections: [
      {
        h: 'Adding a single member',
        p: 'Go to Members → "Add Member". Fill in the required fields (full name, phone, gender) and any optional ones (email, date of birth, address, baptism date, department). Click Save — the member is immediately available across attendance, offerings, and prayer requests.',
      },
      {
        h: 'Importing members in bulk',
        p: 'On the Members page, click "Import" and upload a CSV file. ChurchFlow accepts: Full Name, Phone, Email, Gender, Date of Birth, Address, Department, Status. Download the sample template if you\'re not sure of the format.',
      },
      {
        h: 'Departments and groups',
        p: 'Open Departments to create groups like Choir, Ushers, Youth, Women\'s Fellowship. Assign each member to one or more departments. Department leaders see only their group\'s members in their assistant view.',
      },
      {
        h: 'Membership status',
        p: 'Set each member as Active, Inactive, Visitor, or Transferred. Inactive members stay in your records but don\'t count in active membership totals. Use the bulk-edit tool to reclassify many members at once after an annual review.',
      },
    ],
    tip: 'Keep phone numbers in international format (+231...) — this lets the SMS feature work without extra cleanup.',
  },
  {
    anchor: 'g-attendance',
    icon: CalendarCheck,
    title: 'Recording attendance',
    intro: 'Track who shows up to Sunday service, mid-week meetings, youth groups, and special events. Three ways to record: roll call, QR code, or quick counts.',
    sections: [
      {
        h: 'Quick attendance count',
        p: 'For services where you just need a head count, go to Attendance → "Quick Count". Enter the date, service type, number present, number of visitors, and notes. Done in 10 seconds.',
      },
      {
        h: 'Roll call (member-by-member)',
        p: 'Go to Attendance → "Roll Call". Select the date and service type. ChurchFlow shows your full member list — tick the ones present. The system saves automatically as you go.',
      },
      {
        h: 'QR code check-in',
        p: 'Each member gets a unique QR code under their profile. Print on a card or save to phone. Set up a tablet at the entrance running ChurchFlow in QR Check-in mode — members scan as they walk in.',
      },
      {
        h: 'Service types',
        p: 'Standard service types: Sunday Morning, Sunday Evening, Mid-week, Youth, Women\'s, Men\'s, Choir Rehearsal, Special Event. Customize the list in Settings → Attendance.',
      },
    ],
    tip: 'Assign a department leader to take attendance for their group — distributes the work and improves accuracy.',
  },
  {
    anchor: 'g-offerings',
    icon: DollarSign,
    title: 'Recording offerings & finance',
    intro: 'Track tithes, offerings, special funds, and expenses. ChurchFlow handles both LRD and USD with proper currency formatting.',
    sections: [
      {
        h: 'Recording a Sunday offering',
        p: 'Go to Finance → "Record Offering". Pick the category (Tithe, General Offering, Building Fund, Missions, Special), enter the amount and currency. Optionally link to a member if it\'s their personal tithe.',
      },
      {
        h: 'Categories',
        p: 'Default categories: Tithe, General Offering, Building Fund, Missions, Special, Pledges, Thanksgiving, Other. Add custom categories in Settings → Finance → Categories. Each category gets its own running total and report.',
      },
      {
        h: 'Currency (LRD ↔ USD)',
        p: 'Set your church\'s default currency in Settings. Individual entries can override — useful for missionary support tracked in USD. Reports can be filtered by currency.',
      },
      {
        h: 'Receipts',
        p: 'ChurchFlow auto-generates a receipt number for every offering. Click any offering record to view, print, or email a receipt to the member.',
      },
      {
        h: 'Monthly summary',
        p: 'Go to Finance → Reports for an automatic monthly summary by category. Export to CSV from Settings → Backup & Export.',
      },
    ],
    tip: 'Set up all your offering categories before the first Sunday so every report categorizes correctly from day one.',
  },
  {
    anchor: 'g-events',
    icon: CalendarDays,
    title: 'Creating and managing events',
    intro: 'Plan revivals, conferences, weddings, youth nights, and prayer meetings. Track RSVPs and send reminders.',
    sections: [
      {
        h: 'Creating an event',
        p: 'Go to Events → "New Event". Fill in title, date, time, venue, type (Conference, Service, Wedding, Outreach, etc.), and description. Set status to Upcoming.',
      },
      {
        h: 'Accepting RSVPs',
        p: 'Toggle "Accept RSVPs" on the event. Share the event URL via WhatsApp or SMS — members tap the link and confirm attendance from their phone. You see live RSVP counts.',
      },
      {
        h: 'Event reminders',
        p: 'Schedule SMS reminders for 1 week, 1 day, and 2 hours before the event. ChurchFlow sends to all RSVPs automatically.',
      },
      {
        h: 'Attendance at events',
        p: 'On the event day, mark attendance directly from the event page. Records flow into the main attendance database.',
      },
    ],
    tip: 'Create recurring events (Sunday service, mid-week prayer) once with "Repeat weekly" — ChurchFlow generates the future instances automatically.',
  },
  {
    anchor: 'g-sms',
    icon: MessageSquare,
    title: 'Sending SMS messages',
    intro: 'Reach your members instantly with SMS for service reminders, birthday wishes, event announcements, and follow-ups.',
    sections: [
      {
        h: 'Setting up SMS',
        p: 'Go to Settings → SMS. Add your SMS provider credentials (Orange, MTN, or international). Top up your SMS balance — pricing varies by provider and message length.',
      },
      {
        h: 'Sending a one-time blast',
        p: 'Go to Messages → "New SMS". Pick recipients (all members, a department, or individuals). Type your message (160 characters per SMS, multi-part allowed). Preview and send.',
      },
      {
        h: 'Using AI to draft messages',
        p: 'Click the AI Assistant icon next to the message box. Ask "Draft a Sunday service reminder" — the AI writes warm, on-brand SMS copy you can edit and send.',
      },
      {
        h: 'Visitor follow-ups',
        p: 'Mark a visitor in attendance. ChurchFlow can auto-send a welcome SMS Sunday evening — configure the template under Settings → SMS → Auto-replies.',
      },
    ],
    tip: 'Keep SMS under 160 characters when possible — single-part messages cost half of multi-part ones.',
  },
  {
    anchor: 'g-sermons',
    icon: Mic2,
    title: 'Sermon management',
    intro: 'Store sermons, share them with members, and let the AI help prepare new ones.',
    sections: [
      {
        h: 'Uploading a sermon',
        p: 'Go to Sermons → "Add Sermon". Fill in title, preacher, date, scripture reference, and a short summary. Upload the audio or video file (MP3, MP4, M4A). The recording is available to members in their portal immediately.',
      },
      {
        h: 'Live streaming',
        p: 'Set up Live Streams to broadcast Sunday service. ChurchFlow integrates with YouTube Live and Facebook Live — paste the stream URL and members watch directly from the app.',
      },
      {
        h: 'AI sermon builder',
        p: 'In the Pastor dashboard, use Sermon Builder AI. Give it a scripture and a theme — it produces a full outline with main points, applications, and altar call direction. Edit to fit your style.',
      },
      {
        h: 'Sermon series',
        p: 'Group related sermons into series (e.g., "Walking by Faith — 6-week series"). Members can binge the whole series from one place.',
      },
    ],
    tip: 'Add a 1-sentence sermon summary for every upload — it dramatically improves search and lets members find old sermons.',
  },
  {
    anchor: 'g-portal',
    icon: Smartphone,
    title: 'The Member Portal',
    intro: 'Every member can log in to their personal portal — view sermons, submit prayer requests, give online, and update their own profile.',
    sections: [
      {
        h: 'Inviting members to register',
        p: 'Share your church join link (Settings → Church Profile → Copy invite link). Members open it, create a password, and they\'re in — automatically linked to your church.',
      },
      {
        h: 'What members can do',
        p: 'View their attendance history, submit prayer requests (public or private), watch sermons and live streams, browse the events calendar, update their profile photo and contact info, and chat with the Bible Study AI assistant.',
      },
      {
        h: 'Privacy controls',
        p: 'Prayer requests can be marked "Pastor only" — only pastors and admins see them. Personal data (DOB, address) is never visible to other members.',
      },
      {
        h: 'Mobile app',
        p: 'ChurchFlow works as a Progressive Web App. Members can install it to their home screen from any browser — looks and behaves like a native app, no app store needed.',
      },
    ],
    tip: 'Print the join link as a QR code on bulletin handouts — easiest way to get visitors registered after their first Sunday.',
  },
  {
    anchor: 'g-export',
    icon: Download,
    title: 'Exporting your data',
    intro: 'Your data is yours. Download any time as CSV files that open in Excel, Google Sheets, or Numbers.',
    sections: [
      {
        h: 'Where to export',
        p: 'Go to Settings → Backup & Export. You\'ll see export buttons for Members, Offerings, Attendance, Events, and Prayer Requests, plus a "Full Data Backup" that bundles everything into one file.',
      },
      {
        h: 'What you get',
        p: 'CSV files with one row per record and a header row of column names. Open directly in Excel — no formatting issues. Dates are in YYYY-MM-DD format for easy sorting.',
      },
      {
        h: 'Regular backups',
        p: 'ChurchFlow auto-backs up to InsForge continuously. The export feature is for personal/offline copies. We recommend a manual full backup quarterly, stored in your church\'s cloud drive.',
      },
    ],
    tip: 'After exporting Finance, save it to a folder named YYYY-MM so you build up an annual archive your accountant can use.',
  },
  {
    anchor: 'g-billing',
    icon: CreditCard,
    title: 'Billing & plans',
    intro: 'ChurchFlow has 3 plans: Starter, Growth, and Ministry Pro. Pay monthly or yearly (save 20%).',
    sections: [
      {
        h: 'The plans',
        p: 'Starter ($15/mo, LRD 2,760) — up to 100 members, 1 branch. Growth ($45/mo, LRD 8,280) — up to 500 members, 3 branches. Ministry Pro ($120/mo, LRD 22,080) — unlimited everything.',
      },
      {
        h: 'How to pay',
        p: 'Orange Money, MTN MoMo, or direct bank transfer. Get payment details from Settings → Billing. Send proof of payment to morrisldorleyjr21@gmail.com and your subscription activates within 24 hours.',
      },
      {
        h: 'Upgrading or downgrading',
        p: 'Change plans any time from Settings → Billing. Upgrades take effect immediately. Downgrades take effect at the start of your next billing cycle.',
      },
      {
        h: 'Cancellation',
        p: 'Email morrisldorleyjr21@gmail.com to cancel. Your data stays in ChurchFlow for 30 days after cancellation so you can export it. After that, it\'s permanently deleted.',
      },
    ],
    tip: 'Yearly billing saves 20% — that\'s nearly 3 free months. Most growing churches save by paying upfront.',
  },
]

const GETTING_STARTED_STEPS = [
  {
    number: '01',
    icon: Building2,
    title: 'Create Your Church Account',
    anchor: 'create',
    content: `Navigate to churchflow.lr and click "Get Started". You will be asked to enter your church name, denomination, city, country, and an admin email address. A verification email will be sent to confirm your account. Once verified, you are in.`,
    code: null,
    tip: 'Use an email address that your church leadership team can access — this will be the primary admin account.',
  },
  {
    number: '02',
    icon: Building2,
    title: 'Set Up Your Church Profile',
    anchor: 'profile',
    content: `After logging in for the first time, you will be guided through the church profile setup wizard. Provide your church logo, address, service schedule, default currency (LRD or USD), and time zone. These details appear on all reports and receipts generated by ChurchFlow.`,
    code: null,
    tip: 'Take 5 minutes to fill in all profile fields completely. This information pre-fills receipts and reports, saving you time every month.',
  },
  {
    number: '03',
    icon: UserPlus,
    title: 'Add Your First Members',
    anchor: 'members',
    content: `Go to the Members module from the sidebar. Click "Add Member" to create an individual profile. Fill in: full name, phone number, email (optional), date of birth, gender, joining date, department, baptism status, and membership status. You can also bulk-import members using a CSV file by clicking "Import".`,
    code: `// CSV format for bulk import
Name, Phone, Email, Gender, DOB, Department, Status
Samuel Kollie, +231770001234, s@example.com, Male, 1990-05-10, Choir, Active
Grace Flomo, +231770005678, , Female, 1985-08-22, Ushers, Active`,
    tip: 'Start with your key leaders and department heads so you can assign roles immediately.',
  },
  {
    number: '04',
    icon: CalendarCheck,
    title: 'Record Your First Attendance',
    anchor: 'attendance',
    content: `Open the Attendance module and click "New Attendance Record". Select the service type (Sunday Service, Mid-week, Youth, etc.), the date, and the branch. You can then mark attendance by ticking member names from the list, or scanning QR codes if members have their codes printed or saved. Hit "Save Record" when done.`,
    code: null,
    tip: 'Assign a department leader to take attendance for their group — this distributes the work and improves accuracy.',
  },
  {
    number: '05',
    icon: DollarSign,
    title: 'Add Your First Offering',
    anchor: 'offering',
    content: `Go to the Finance module and click "Record Offering". Select the offering category (Tithe, Building Fund, Special, Missions, etc.), enter the amount, select the currency (LRD or USD), and add any notes. ChurchFlow will automatically generate a receipt number and timestamp the record. You can also record envelope-based offerings by entering the envelope number and member name.`,
    code: null,
    tip: 'Set up all your offering categories before recording the first Sunday so reports are properly categorised from day one.',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Can I use ChurchFlow on my phone?',
    a: 'Yes. ChurchFlow is a Progressive Web App. Open your browser, navigate to the app, and select "Add to Home Screen" to install it like a native app on any Android or iPhone device.',
  },
  {
    q: 'Does ChurchFlow work without internet?',
    a: 'Core features like member lookup and attendance marking have limited offline capability. Full offline support is included in the roadmap for a future release. For best results, use on a stable data connection.',
  },
  {
    q: 'How do I add a second branch?',
    a: 'Go to Settings, then Branches, and click "Add Branch". Assign a branch administrator and they will receive an invitation email to manage their branch dashboard.',
  },
  {
    q: 'Can I export all my data?',
    a: 'Yes. From Settings, navigate to "Data & Privacy" and select "Export All Data". You will receive a ZIP file containing all your church records in both CSV and PDF format.',
  },
  {
    q: 'How do I reset my password?',
    a: 'On the login page, click "Forgot password?" and enter your admin email. You will receive a password reset link within a few minutes.',
  },
]

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('intro')

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] to-[#312e81] py-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-purple-300 text-sm mb-3">
            <Link to="/landing" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Documentation</h1>
          <p className="text-purple-200 text-base max-w-xl">
            Everything you need to get the most out of ChurchFlow. Guides, references, and FAQs.
          </p>
        </div>
      </section>

      {/* Doc layout */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10">

        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <nav className="lg:sticky lg:top-20 space-y-6">
            {SIDEBAR_SECTIONS.map(section => {
              const Icon = section.icon
              return (
                <div key={section.label}>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Icon className="w-3.5 h-3.5" />
                    {section.label}
                  </div>
                  <ul className="space-y-0.5 pl-1">
                    {section.items.map(item => (
                      <li key={item.anchor}>
                        <a
                          href={`#${item.anchor}`}
                          onClick={() => setActiveSection(item.anchor)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeSection === item.anchor
                              ? 'bg-purple-50 text-[#7C3AED] font-semibold'
                              : 'text-slate-600 hover:text-[#7C3AED] hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">

          {/* Intro */}
          <div id="intro" className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Getting Started</p>
                <h2 className="text-2xl font-extrabold text-[#1E1B4B]">Getting Started with ChurchFlow</h2>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mb-4">
              Welcome to ChurchFlow Liberia. This guide will walk you through everything you need to do to have your church fully set up and running on ChurchFlow. From creating your account to recording your first offering, follow each step in order for the smoothest onboarding experience.
            </p>
            <div className="flex flex-wrap gap-3">
              {['5 setup steps', '~15 minutes', 'No technical knowledge required'].map(tag => (
                <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-[#7C3AED] rounded-full text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-12">
            {GETTING_STARTED_STEPS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={step.anchor} id={step.anchor} className="scroll-mt-20">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7C3AED] to-violet-700 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#1E1B4B]">{step.title}</h3>
                    </div>
                  </div>

                  <div className="ml-14">
                    <p className="text-slate-600 leading-relaxed mb-5">{step.content}</p>

                    {step.code && (
                      <div className="bg-[#1E1B4B] rounded-xl overflow-hidden mb-5">
                        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
                          <span className="text-xs text-slate-400 font-mono">Example</span>
                        </div>
                        <pre className="p-4 text-xs text-green-300 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                          {step.code}
                        </pre>
                      </div>
                    )}

                    {step.tip && (
                      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <ListChecks className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Tip</p>
                          <p className="text-amber-700 text-sm leading-relaxed">{step.tip}</p>
                        </div>
                      </div>
                    )}

                    {idx < GETTING_STARTED_STEPS.length - 1 && (
                      <div className="mt-8 pt-8 border-t border-slate-100" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Full guides ── */}
          <div className="mt-20 mb-12">
            <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-3">Core Guides</h2>
            <p className="text-slate-500 mb-10 max-w-2xl">
              Step-by-step guides for the essential things you'll do every week in ChurchFlow.
            </p>

            <div className="space-y-16">
              {FULL_GUIDES.map(guide => {
                const Icon = guide.icon
                return (
                  <article key={guide.anchor} id={guide.anchor} className="scroll-mt-20">
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#7C3AED]" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-[#1E1B4B] leading-tight">{guide.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mt-1.5">{guide.intro}</p>
                      </div>
                    </div>

                    <div className="ml-15 sm:ml-15 space-y-5">
                      {guide.sections.map((s, i) => (
                        <div key={i}>
                          <h4 className="font-bold text-slate-800 text-base mb-1.5 flex items-center gap-2">
                            <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                            {s.h}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed pl-5">{s.p}</p>
                        </div>
                      ))}

                      {guide.tip && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mt-4">
                          <ListChecks className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Tip</p>
                            <p className="text-amber-700 text-sm leading-relaxed">{guide.tip}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          {/* FAQ */}
          <div id="faq" className="mt-16 scroll-mt-20">
            <h2 className="text-2xl font-extrabold text-[#1E1B4B] mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {FAQ_ITEMS.map(item => (
                <div key={item.q} className="border-b border-slate-100 pb-6 last:border-0">
                  <h4 className="font-bold text-[#1E1B4B] mb-2 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                    {item.q}
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed pl-6">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
            <Link
              to="/help"
              className="flex items-center gap-2 text-sm text-[#7C3AED] font-semibold hover:underline"
            >
              Visit Help Centre
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="flex items-center gap-2 text-sm text-[#7C3AED] font-semibold hover:underline"
            >
              Contact Support
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
      </div>
    </PublicLayout>
  )
}
