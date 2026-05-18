// ============================================================
// ChurchFlow Liberia — Contact Page (/contact)
// ============================================================
import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import PublicLayout from './PublicLayout'

const CONTACT_INFO = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@churchflow.lr',
    sub: 'We reply within 24 hours',
    color: 'bg-purple-100 text-[#7C3AED]',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+231 77 000 0000',
    sub: 'Mon to Fri during business hours',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Monrovia, Liberia',
    sub: 'Headquarters',
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
      <section className="bg-gradient-to-br from-[#1E1B4B] via-[#312e81] to-[#7C3AED] py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-[#F59E0B] text-xs font-semibold tracking-widest uppercase mb-6 border border-white/20">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-purple-200 max-w-xl mx-auto leading-relaxed">
            Have questions about ChurchFlow? We are here to help. Reach out and our team will get back to you promptly.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Left: Contact info */}
            <div>
              <h2 className="text-2xl font-bold text-[#1E1B4B] mb-2">Contact Information</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Have questions about ChurchFlow? We are here to help. Our support team is based in Monrovia and ready to assist your ministry.
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
                        <p className="font-semibold text-[#1E1B4B] text-sm">{item.value}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 p-6 bg-[#1E1B4B] rounded-2xl text-white">
                <h3 className="font-bold text-base mb-2">Need urgent help?</h3>
                <p className="text-purple-300 text-sm leading-relaxed mb-4">
                  For technical emergencies during business hours, call us directly. For after-hours issues, email us and we will respond first thing the next business morning.
                </p>
                <p className="text-[#F59E0B] font-bold text-sm">support@churchflow.lr</p>
              </div>
            </div>

            {/* Right: Contact form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-[#1E1B4B] mb-1">Send us a message</h2>
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
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your name"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors ${
                      touched.name && errors.name
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#7C3AED]'
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors ${
                      touched.email && errors.email
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#7C3AED]'
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Subject <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 transition-colors ${
                      touched.subject && errors.subject
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#7C3AED]'
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
                  <label className="block text-sm font-semibold text-[#1E1B4B] mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Tell us how we can help..."
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 resize-none transition-colors ${
                      touched.message && errors.message
                        ? 'border-red-300 bg-red-50'
                        : 'border-slate-200 bg-white focus:border-[#7C3AED]'
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#7C3AED] text-white font-bold text-sm hover:bg-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
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
    </PublicLayout>
  )
}
