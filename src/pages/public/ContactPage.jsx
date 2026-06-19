// ============================================================
// ChurchFlow Liberia, Contact Page (/contact)
// ============================================================
import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import PublicLayout from './PublicLayout'

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'morrisldorleyjr21@gmail.com',
    sub: 'We reply within 24 hours',
    href: 'mailto:morrisldorleyjr21@gmail.com',
    color: 'bg-purple-100 text-[#8A19FF]',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+231 77 078 7020',
    sub: '+231 88 828 3007',
    href: 'tel:+231770787020',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Brewerville City',
    sub: 'Montserrado County, Republic of Liberia',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Mon–Fri 8:00 AM – 6:00 PM',
    sub: 'West Africa Time (WAT)',
    color: 'bg-green-100 text-green-600',
  },
]

const SUBJECTS = [
  'General Inquiry',
  'Pricing',
  'Technical Support',
  'Partnership',
]

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [status, setStatus] = useState(null) // null | 'success' | 'error'
  const [submitting, setSubmitting] = useState(false)
  const [touched, setTouched] = useState({})

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleBlur(e) {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  function validate() {
    const errors = {}
    if (!form.name.trim())    errors.name    = 'Name is required'
    if (!form.email.trim())   errors.email   = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
    if (!form.subject)        errors.subject = 'Please select a subject'
    if (!form.message.trim()) errors.message = 'Message is required'
    return errors
  }

  const errors = validate()
  const isValid = Object.keys(errors).length === 0

  async function handleSubmit(e) {
    e.preventDefault()
    setTouched({ name: true, email: true, subject: true, message: true })
    if (!isValid) return

    setSubmitting(true)
    // Simulate network request
    await new Promise(res => setTimeout(res, 1200))
    setSubmitting(false)
    setStatus('success')
    setForm({ name: '', email: '', subject: '', message: '' })
    setTouched({})
  }

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pastel-canvas py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full glass-card text-purple-700 text-xs font-semibold tracking-widest uppercase mb-6 border border-white/70">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111827] leading-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Have questions about ChurchFlow? We are here to help. Reach out and our team will get back to you promptly.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 px-4 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-[#151022] mb-2">Contact Information</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Have questions about ChurchFlow? We are here to help. Our support team is based in Brewerville City, Liberia and ready to assist your ministry.
              </p>

              <div className="space-y-4">
                {CONTACT_INFO.map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex items-start gap-4 p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                        {item.href
                          ? <a href={item.href} className="font-semibold text-[#8A19FF] text-sm hover:underline">{item.value}</a>
                          : <p className="font-semibold text-[#151022] text-sm">{item.value}</p>
                        }
                        <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 p-6 bg-[#151022] rounded-2xl text-white">
                <h3 className="font-bold text-base mb-2">Need urgent help?</h3>
                <p className="text-purple-300 text-sm leading-relaxed mb-4">
                  For technical emergencies during business hours, message us on WhatsApp. For after-hours issues, we will respond first thing the next business morning.
                </p>
                <a
                  href="https://wa.me/231770787020"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#F59E0B] font-bold text-sm hover:text-amber-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.945C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.413c-.003 6.554-5.338 11.89-11.893 11.89a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
                  </svg>
                  +231 77 078 7020
                </a>
              </div>
            </div>

            {/* Right: Contact form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#151022] mb-1">Send us a message</h2>
              <p className="text-slate-400 text-sm mb-6">We will get back to you within 24 hours.</p>

              {status === 'success' && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700 text-sm">Message sent successfully</p>
                    <p className="text-green-600 text-xs mt-0.5">Thank you for reaching out. Our team will be in touch shortly.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-6">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-sm">Something went wrong. Please try again or email us directly.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#151022] mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8A19FF]/30 transition-colors ${
                      touched.name && errors.name
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#8A19FF]'
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#151022] mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8A19FF]/30 transition-colors ${
                      touched.email && errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#8A19FF]'
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-[#151022] mb-1.5">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8A19FF]/30 transition-colors ${
                      touched.subject && errors.subject
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#8A19FF]'
                    }`}
                  >
                    <option value="">Select a subject</option>
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {touched.subject && errors.subject && (
                    <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-[#151022] mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#8A19FF]/30 resize-none transition-colors ${
                      touched.message && errors.message
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#8A19FF]'
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8A19FF] text-white font-bold text-sm hover:bg-[#5B00B8] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Brewerville Map */}
      <section className="px-4 pb-20 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-[#151022] mb-1">Our Location</h3>
            <p className="text-slate-500 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8A19FF]" />
              Brewerville City, Montserrado County, Republic of Liberia
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            <iframe
              title="Brewerville City, Liberia"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31801.81!2d-10.7178!3d6.4024!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xf09f31db9c67c39%3A0x9f78b6bd4d7c1e0a!2sBrewerville%2C+Liberia!5e0!3m2!1sen!2slr!4v1"
              width="100%"
              height="380"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
