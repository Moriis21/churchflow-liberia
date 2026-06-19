// ============================================================
// ChurchFlow Liberia, Press Page (/press)
// ============================================================
import React from 'react'
import { Link } from 'react-router-dom'
import {
  Download, Mail, Palette, Type, Square,
  ExternalLink, Calendar, ArrowRight, Image
} from 'lucide-react'
import PublicLayout from './PublicLayout'

const BRAND_COLORS = [
  { name: 'Brand Purple',   hex: '#8A19FF', var: '--color-brand-purple',  usage: 'Primary brand, CTAs, links'    },
  { name: 'Brand Gold',     hex: '#F59E0B', var: '--color-brand-gold',    usage: 'Accents, highlights, awards'   },
  { name: 'Brand Navy',     hex: '#151022', var: '--color-brand-navy',    usage: 'Headings, dark backgrounds'    },
  { name: 'White',          hex: '#FFFFFF', var: '--color-white',          usage: 'Backgrounds, reversed text'    },
  { name: 'Slate 50',       hex: '#F8FAFC', var: '--color-slate-50',      usage: 'Page backgrounds'              },
]

const TYPOGRAPHY = [
  { label: 'Primary Font',      value: 'Poppins',             usage: 'All body text, UI elements'          },
  { label: 'Heading Weight',    value: 'Extra Bold (800)',   usage: 'Page headings and feature titles'    },
  { label: 'Body Weight',       value: 'Regular (400)',      usage: 'Paragraphs and descriptions'         },
  { label: 'Button Weight',     value: 'Semi Bold (600)',    usage: 'CTA buttons and navigation links'    },
  { label: 'Caption Size',      value: '12px / 0.75rem',    usage: 'Labels, badges, metadata'            },
]

const MEDIA_MENTIONS = [
  {
    outlet: 'Liberian Technology Review',
    headline: 'ChurchFlow Brings Digital Transformation to Liberian Churches',
    date: 'May 2026',
    type: 'Feature Article',
    url: '#',
  },
  {
    outlet: 'Faith and Innovation Podcast',
    headline: 'Episode 47: How ChurchFlow Is Solving Church Admin in West Africa',
    date: 'April 2026',
    type: 'Podcast Feature',
    url: '#',
  },
  {
    outlet: 'Monrovia Business Daily',
    headline: 'Liberian SaaS Startup Targets 1,000 Churches by End of 2026',
    date: 'March 2026',
    type: 'News Article',
    url: '#',
  },
]

const USAGE_RULES = [
  'Use the full logo with wordmark for all press and editorial use.',
  'Maintain minimum clear space of 16px around the logo on all sides.',
  'Do not rotate, distort, recolour, or rearrange the logo elements.',
  'Use the dark logo variant on white and light backgrounds.',
  'Use the light logo variant on dark and coloured backgrounds.',
  'Do not use the logo smaller than 120px wide in digital contexts.',
  'Do not place the logo on backgrounds that reduce legibility.',
]

export default function PressPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pastel-canvas py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-purple-700 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/70">
            Press and Media
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-4">
            Press and Brand Resources
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed mb-8">
            Download logos, review brand guidelines, and get in touch with our media contact for interview requests and press enquiries.
          </p>
          <button className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#F59E0B] text-[#151022] font-bold text-sm hover:bg-amber-400 transition-colors shadow-lg">
            <Download className="w-4 h-4" />
            Download Logo Kit
          </button>
        </div>
      </section>

      {/* Press contact */}
      <section className="bg-white border-b border-slate-100 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-7 bg-transparent rounded-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-[#8A19FF]" />
              </div>
              <div>
                <h3 className="font-bold text-[#151022] mb-0.5">Press Contact</h3>
                <p className="text-slate-500 text-sm">For interview requests, article fact-checking, and press enquiries.</p>
                <p className="text-[#8A19FF] font-bold mt-2">press@churchflow.lr</p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#8A19FF] text-[#8A19FF] font-semibold text-sm hover:bg-purple-50 transition-colors flex-shrink-0"
            >
              Contact Us
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Logo kit */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#151022] mb-8">Logo and Assets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { bg: 'bg-white',       label: 'Logo, Dark Variant',   sub: 'For light backgrounds',  border: 'border-slate-200' },
              { bg: 'bg-[#151022]',  label: 'Logo, Light Variant',  sub: 'For dark backgrounds',   border: 'border-[#151022]' },
              { bg: 'bg-[#8A19FF]',  label: 'Logo, Purple Variant', sub: 'For branded backgrounds', border: 'border-[#8A19FF]' },
            ].map(v => (
              <div key={v.label} className={`rounded-2xl border ${v.border} ${v.bg} overflow-hidden`}>
                <div className="h-40 flex items-center justify-center">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow ${v.bg === 'bg-white' ? 'bg-[#151022]' : 'bg-white/20'}`}>
                      <Image className={`w-4 h-4 ${v.bg === 'bg-white' ? 'text-[#F59E0B]' : 'text-[#F59E0B]'}`} />
                    </div>
                    <span className={`font-bold text-base ${v.bg === 'bg-white' ? 'text-[#151022]' : 'text-white'}`}>
                      ChurchFlow
                    </span>
                  </div>
                </div>
                <div className={`px-5 py-3 border-t ${v.bg === 'bg-white' ? 'border-slate-100 bg-transparent' : 'border-white/10 bg-black/10'} flex items-center justify-between`}>
                  <div>
                    <p className={`text-xs font-semibold ${v.bg === 'bg-white' ? 'text-[#151022]' : 'text-white'}`}>{v.label}</p>
                    <p className={`text-xs ${v.bg === 'bg-white' ? 'text-slate-400' : 'text-white/50'}`}>{v.sub}</p>
                  </div>
                  <button className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${v.bg === 'bg-white' ? 'bg-[#8A19FF] text-white' : 'bg-white/20 text-white'}`}>
                    <Download className="w-3 h-3" />
                    SVG
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#151022] text-white font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Download Full Logo Kit (.zip)
            </button>
          </div>
        </div>
      </section>

      {/* Brand guidelines */}
      <section className="py-16 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#151022] mb-10">Brand Guidelines</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Colours */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#151022] uppercase tracking-wider mb-5">
                <Palette className="w-4 h-4 text-[#8A19FF]" />
                Brand Colours
              </div>
              <div className="space-y-3">
                {BRAND_COLORS.map(c => (
                  <div key={c.hex} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex-shrink-0 border border-slate-200 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#151022] text-sm">{c.name}</span>
                        <code className="text-xs text-slate-400 font-mono">{c.hex}</code>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{c.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#151022] uppercase tracking-wider mb-5">
                <Type className="w-4 h-4 text-[#8A19FF]" />
                Typography
              </div>
              <div className="space-y-3">
                {TYPOGRAPHY.map(t => (
                  <div key={t.label} className="flex items-start gap-3 p-3 bg-transparent rounded-xl border border-slate-100">
                    <Square className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">{t.label}</span>
                      <span className="text-sm font-bold text-[#151022] block">{t.value}</span>
                      <span className="text-xs text-slate-400">{t.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Usage rules */}
          <div className="mt-10">
            <h3 className="font-bold text-[#151022] mb-4">Logo Usage Rules</h3>
            <ul className="space-y-2">
              {USAGE_RULES.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8A19FF] flex-shrink-0 mt-2" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Media mentions */}
      <section className="py-16 px-4 bg-transparent border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#151022] mb-8">Media Coverage</h2>
          <div className="space-y-4">
            {MEDIA_MENTIONS.map(mention => (
              <div key={mention.headline} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold text-[#8A19FF] text-sm">{mention.outlet}</span>
                      <span className="text-slate-300 text-xs">·</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">{mention.type}</span>
                    </div>
                    <h3 className="font-semibold text-[#151022] text-sm leading-snug">{mention.headline}</h3>
                    <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {mention.date}
                    </p>
                  </div>
                  <a
                    href={mention.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#8A19FF] font-semibold hover:underline flex-shrink-0"
                  >
                    Read Article
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
