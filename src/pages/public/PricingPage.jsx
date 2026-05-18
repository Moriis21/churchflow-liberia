// ============================================================
// ChurchFlow Liberia — Pricing Page (/pricing)
// ============================================================
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Star, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import PublicLayout from './PublicLayout'

const PLANS = [
  {
    name: 'Starter',
    lrd: '500',
    usd: '15',
    tagline: 'Perfect for small, growing congregations',
    featured: false,
    features: [
      { text: 'Up to 100 members',            included: true  },
      { text: '1 church branch',               included: true  },
      { text: 'Basic attendance tracking',     included: true  },
      { text: 'Finance & offerings module',    included: true  },
      { text: 'SMS alerts (50/month)',          included: true  },
      { text: 'Email support',                 included: true  },
      { text: 'Standard reports',              included: true  },
      { text: 'Visitor follow-up system',      included: false },
      { text: 'Advanced analytics',            included: false },
      { text: 'Bulk SMS (500+/month)',          included: false },
      { text: 'Event management module',       included: false },
      { text: 'Multi-branch dashboard',        included: false },
      { text: 'Custom branding',               included: false },
      { text: 'API access',                    included: false },
    ],
    cta: 'Get Started',
    ctaLink: '/register',
  },
  {
    name: 'Growth',
    lrd: '1,500',
    usd: '45',
    tagline: 'For mid-sized churches scaling their ministry',
    featured: true,
    badge: 'Most Popular',
    features: [
      { text: 'Up to 500 members',             included: true  },
      { text: 'Up to 3 branches',              included: true  },
      { text: 'Full attendance module',        included: true  },
      { text: 'Full finance module',           included: true  },
      { text: 'Bulk SMS (500/month)',           included: true  },
      { text: 'Priority email & chat support', included: true  },
      { text: 'Advanced reports & analytics',  included: true  },
      { text: 'Visitor follow-up system',      included: true  },
      { text: 'Event management module',       included: true  },
      { text: 'Department management',         included: true  },
      { text: 'Prayer requests module',        included: true  },
      { text: 'Multi-branch dashboard',        included: false },
      { text: 'Custom branding',               included: false },
      { text: 'API access',                    included: false },
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
  },
  {
    name: 'Ministry Pro',
    lrd: '4,000',
    usd: '120',
    tagline: 'For large ministries with multiple branches',
    featured: false,
    features: [
      { text: 'Unlimited members',             included: true  },
      { text: 'Unlimited branches',            included: true  },
      { text: 'All attendance features',       included: true  },
      { text: 'All finance features',          included: true  },
      { text: 'Unlimited SMS',                 included: true  },
      { text: 'Dedicated support manager',     included: true  },
      { text: 'All reports & analytics',       included: true  },
      { text: 'Visitor follow-up system',      included: true  },
      { text: 'Event management module',       included: true  },
      { text: 'Department management',         included: true  },
      { text: 'Multi-branch dashboard',        included: true  },
      { text: 'Custom branding',               included: true  },
      { text: 'API access',                    included: true  },
      { text: 'Full data export',              included: true  },
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
]

const FAQS = [
  {
    q: 'Is there a free trial available?',
    a: 'Yes. All plans include a 14-day free trial with full access to the features of your chosen tier. No credit card is required to start.',
  },
  {
    q: 'Are prices in Liberian Dollars (LRD) or US Dollars (USD)?',
    a: 'Prices are listed in both LRD and USD for your convenience. You can pay in either currency. LRD payments are processed through local mobile money platforms.',
  },
  {
    q: 'Can I change my plan later?',
    a: 'Absolutely. You can upgrade or downgrade your plan at any time from your church settings. Upgrades take effect immediately; downgrades apply at your next billing cycle.',
  },
  {
    q: 'How is billing handled for Liberian churches?',
    a: 'We accept Orange Money, MTN MoMo, and bank transfers in LRD. USD payments are accepted via international bank transfer or card. Monthly and annual billing options are available.',
  },
  {
    q: 'What happens to my data if I cancel?',
    a: 'Your church data remains accessible for 30 days after cancellation. You can export everything in PDF or Excel format before your account closes. We never delete data without notice.',
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="font-semibold text-[#1E1B4B] text-sm sm:text-base">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Transparent Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto leading-relaxed">
            Built for Liberian churches of every size. Start free, scale as your ministry grows. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PLANS.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col ${
                  plan.featured
                    ? 'border-[#7C3AED] shadow-xl ring-2 ring-[#7C3AED]/20 scale-[1.02]'
                    : 'border-slate-200'
                }`}
              >
                {plan.badge && (
                  <div className="bg-[#7C3AED] text-white text-xs font-bold text-center py-2 tracking-wider uppercase flex items-center justify-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-[#1E1B4B] mb-1">{plan.name}</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.tagline}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-[#1E1B4B]">${plan.usd}</span>
                      <span className="text-slate-400 text-sm font-medium">/month</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">approx. LRD {plan.lrd}/month</p>
                  </div>

                  <Link
                    to={plan.ctaLink}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm mb-8 transition-colors ${
                      plan.featured
                        ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md'
                        : 'bg-[#1E1B4B] text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map(f => (
                      <li key={f.text} className="flex items-start gap-2.5">
                        {f.included ? (
                          <CheckCircle className="w-4 h-4 text-[#7C3AED] flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${f.included ? 'text-slate-700' : 'text-slate-400'}`}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-slate-500 text-sm mt-10">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* Comparison note */}
      <section className="py-12 px-4 bg-white border-y border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[#1E1B4B] mb-3">Not sure which plan is right for you?</h2>
          <p className="text-slate-500 mb-6 leading-relaxed">
            Most growing churches start on the Growth plan. If your congregation has under 100 members, Starter is a great fit. For large ministries with multiple campuses, Ministry Pro delivers everything you need.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#7C3AED] text-[#7C3AED] font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            Talk to our team
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#1E1B4B] mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500">Everything you need to know about ChurchFlow pricing.</p>
          </div>
          <div className="space-y-3">
            {FAQS.map(faq => <FAQItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#7C3AED] py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Start your free 14-day trial today
          </h2>
          <p className="text-purple-200 mb-8 leading-relaxed">
            Set up your church in minutes. No contracts. Cancel anytime.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#F59E0B] text-[#1E1B4B] font-bold text-base hover:bg-amber-400 transition-colors shadow-lg"
          >
            Create Your Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
