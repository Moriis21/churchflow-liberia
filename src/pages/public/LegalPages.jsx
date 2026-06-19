// ============================================================
// ChurchFlow Liberia — Legal Pages
// PrivacyPolicy | TermsOfService | CookiePolicy | GDPRPage
// ============================================================
import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, Cookie, Globe, ChevronRight } from 'lucide-react'
import PublicLayout from './PublicLayout'

const EFFECTIVE_DATE = 'January 1, 2026'

// ─── Shared layout wrapper for legal pages ─────────────────
function LegalLayout({ icon: Icon, title, subtitle, badge, children }) {
  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-[#151022] to-[#2A1F4F] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-purple-300 text-sm mb-3">
            <Link to="/landing" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">{badge}</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#8A19FF]/30 flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">{title}</h1>
            </div>
          </div>
          <p className="text-purple-200 text-sm">{subtitle}</p>
        </div>
      </section>

      <section className="py-14 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-8 pb-6 border-b border-slate-100">
              <span>Effective date: <strong className="text-slate-600">{EFFECTIVE_DATE}</strong></span>
              <span className="mx-2">·</span>
              <span>ChurchFlow Liberia</span>
            </div>
            <div className="prose prose-slate max-w-none space-y-10">
              {children}
            </div>
          </div>

          <div className="mt-8 p-5 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">Questions about this policy? We are here to help.</p>
            <Link
              to="/contact"
              className="px-5 py-2.5 rounded-lg bg-[#8A19FF] text-white text-sm font-semibold hover:bg-[#5B00B8] transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}

// ─── Shared section component ───────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-[#151022] mb-3">{title}</h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}

// ─── 1. Privacy Policy ──────────────────────────────────────
export function PrivacyPolicy() {
  return (
    <LegalLayout
      icon={Shield}
      badge="Privacy Policy"
      title="Privacy Policy"
      subtitle="This policy describes how ChurchFlow Liberia collects, uses, and protects your personal information."
    >
      <Section title="1. Introduction">
        <p>
          ChurchFlow Liberia ("ChurchFlow", "we", "our", or "us") is committed to protecting the privacy and security of the personal data we collect through our church management software platform. This Privacy Policy explains what information we collect, why we collect it, how we use and protect it, and your rights as a data subject.
        </p>
        <p>
          This policy applies to all users of ChurchFlow's web application, including church administrators, pastors, members, and visitors. By using ChurchFlow, you agree to the collection and use of information in accordance with this policy.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We collect several categories of information in connection with your use of our platform:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Church account information:</strong> Church name, denomination, address, contact details, and billing information.</li>
          <li><strong>Member profile data:</strong> Full names, phone numbers, email addresses, dates of birth, gender, membership status, baptism records, and department affiliations entered by church administrators.</li>
          <li><strong>Attendance records:</strong> Service attendance logs tied to member profiles, timestamps, and service types.</li>
          <li><strong>Financial records:</strong> Offering amounts, categories, currency, dates, and optional donor identification — used strictly for church financial reporting.</li>
          <li><strong>Usage data:</strong> Pages visited, features used, browser type, device information, and session duration — collected to improve our service.</li>
          <li><strong>Communication data:</strong> Messages sent through our contact forms or support channels.</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>ChurchFlow uses collected data for the following purposes:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Providing, maintaining, and improving the ChurchFlow platform.</li>
          <li>Processing church subscription billing and issuing receipts.</li>
          <li>Sending service notifications, SMS reminders, and transactional emails.</li>
          <li>Generating the reports and analytics that church administrators request within the platform.</li>
          <li>Responding to customer support requests and troubleshooting issues.</li>
          <li>Complying with applicable legal obligations under Liberian law.</li>
        </ul>
        <p>We do not sell, rent, or share personally identifiable information with third-party marketers under any circumstances.</p>
      </Section>

      <Section title="4. Data Storage and Security">
        <p>
          All ChurchFlow data is stored on encrypted servers with AES-256 encryption at rest and TLS 1.3 encryption in transit. Access to production data is restricted to authorised ChurchFlow engineers under strict role-based access controls. We conduct regular security audits and maintain detailed access logs.
        </p>
        <p>
          Church administrators are responsible for maintaining the security of their account credentials and controlling which staff members have administrative access within their church account. ChurchFlow will never ask for your password via email or phone.
        </p>
      </Section>

      <Section title="5. Data Retention">
        <p>
          We retain church and member data for as long as your ChurchFlow subscription is active. If you cancel your subscription, your data remains available for export for 30 days. After 30 days, data is permanently deleted from our servers, except where retention is required by applicable Liberian financial regulations (typically 7 years for financial records).
        </p>
      </Section>

      <Section title="6. Cookies and Tracking">
        <p>
          ChurchFlow uses essential session cookies to maintain your login state and a small number of analytical cookies to understand how our platform is used. We do not use advertising or social media tracking cookies. See our Cookie Policy for full details.
        </p>
      </Section>

      <Section title="7. Your Rights">
        <p>As a ChurchFlow user or data subject, you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Request access to the personal data ChurchFlow holds about you.</li>
          <li>Request correction of inaccurate personal data.</li>
          <li>Request deletion of your personal data, subject to legal retention requirements.</li>
          <li>Export a copy of your church's data in machine-readable format at any time.</li>
          <li>Withdraw consent for communications at any time.</li>
        </ul>
        <p>
          You can exercise your <strong>right to export</strong> and <strong>right to erasure</strong> directly inside ChurchFlow at any time — no need to email us first. Once logged in, go to <strong>Settings → Privacy &amp; Data</strong> (or <strong>Profile → Privacy &amp; Your Data</strong>) and click <em>Download my data</em> or <em>Delete my account</em>. For all other requests, contact us at <a href="mailto:privacy@churchflow.lr" className="text-purple-600 underline">privacy@churchflow.lr</a>.
        </p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify all active account administrators by email at least 14 days before any material changes take effect. Continued use of ChurchFlow after the effective date constitutes acceptance of the updated policy.
        </p>
      </Section>
    </LegalLayout>
  )
}

// ─── 2. Terms of Service ─────────────────────────────────────
export function TermsOfService() {
  return (
    <LegalLayout
      icon={FileText}
      badge="Terms of Service"
      title="Terms of Service"
      subtitle="These Terms govern your use of the ChurchFlow Liberia platform. Please read them carefully."
    >
      <Section title="1. Agreement to Terms">
        <p>
          By accessing or using ChurchFlow Liberia ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service. These Terms apply to all users of the platform, including church administrators, staff, and member account holders.
        </p>
      </Section>

      <Section title="2. Description of Service">
        <p>
          ChurchFlow is a cloud-based church management software platform that provides tools for member management, attendance tracking, financial recording, event management, communication, and reporting. The platform is made available on a subscription basis and includes a web application accessible via modern browsers and a Progressive Web App installable on mobile devices.
        </p>
      </Section>

      <Section title="3. Account Registration and Security">
        <p>
          You must register for an account to access ChurchFlow. You agree to provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately at support@churchflow.lr of any unauthorised access.
        </p>
        <p>
          Only one primary administrator account may be registered per church. Additional staff accounts may be created under the primary account in accordance with the permissions available on your plan.
        </p>
      </Section>

      <Section title="4. Subscription and Payment">
        <p>
          ChurchFlow is offered on monthly subscription plans priced in Liberian Dollars (LRD) or US Dollars (USD). Your subscription will automatically renew each month unless cancelled before the renewal date. All fees are non-refundable except as required by Liberian consumer protection law or as expressly stated in these Terms.
        </p>
        <p>
          We accept payment via Orange Money, MTN MoMo, and international bank transfer. Price changes will be communicated at least 30 days in advance.
        </p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree not to use ChurchFlow to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Upload or transmit any unlawful, harmful, or fraudulent content.</li>
          <li>Attempt to gain unauthorised access to any part of the platform or another church's account.</li>
          <li>Use the SMS functionality to send spam or unsolicited bulk messages.</li>
          <li>Misrepresent your identity or church affiliation.</li>
          <li>Reverse engineer, decompile, or attempt to extract the platform's source code.</li>
          <li>Resell or sublicence access to ChurchFlow without prior written consent.</li>
        </ul>
      </Section>

      <Section title="6. Data Ownership">
        <p>
          You retain full ownership of all church and member data you enter into ChurchFlow. ChurchFlow does not claim ownership of your data. We act as a data processor on your behalf and use your data only as described in our Privacy Policy. You may export or delete your data at any time through the platform settings.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          The ChurchFlow platform, including its design, code, trademarks, logos, and content created by ChurchFlow, is owned exclusively by ChurchFlow Liberia and protected under applicable intellectual property laws. You may not use our branding without prior written consent.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the fullest extent permitted by Liberian law, ChurchFlow shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of data, loss of revenue, or service interruptions. Our total aggregate liability for direct damages shall not exceed the amount you paid in subscription fees in the preceding three months.
        </p>
      </Section>
    </LegalLayout>
  )
}

// ─── 3. Cookie Policy ───────────────────────────────────────
export function CookiePolicy() {
  return (
    <LegalLayout
      icon={Cookie}
      badge="Cookie Policy"
      title="Cookie Policy"
      subtitle="This policy explains how ChurchFlow uses cookies and similar technologies on our platform."
    >
      <Section title="1. What Are Cookies">
        <p>
          Cookies are small text files that are placed on your device when you visit a website or web application. They are widely used to make websites work efficiently, remember your preferences, and provide information to the website owner. ChurchFlow uses cookies to operate the platform correctly and to improve your experience.
        </p>
      </Section>

      <Section title="2. Categories of Cookies We Use">
        <p><strong>Essential Cookies (Required)</strong></p>
        <p>
          These cookies are strictly necessary for ChurchFlow to function. They manage your login session, maintain security tokens, and remember your authentication state. Without these cookies, you cannot log in or use the platform. You cannot opt out of essential cookies.
        </p>
        <p><strong>Functional Cookies (Optional)</strong></p>
        <p>
          These cookies remember your preferences within the platform, such as your preferred language, default branch, and dashboard layout. They improve your experience but are not required for core functionality.
        </p>
        <p><strong>Analytics Cookies (Optional)</strong></p>
        <p>
          We use privacy-respecting analytics to understand how different features are used across our platform. This data is anonymised and aggregated and is used only to improve ChurchFlow. We do not use Google Analytics or any third-party advertising analytics.
        </p>
      </Section>

      <Section title="3. Cookies We Do Not Use">
        <p>
          ChurchFlow does not use advertising cookies, social media tracking pixels, or cross-site tracking cookies of any kind. We do not share cookie data with advertisers or data brokers.
        </p>
      </Section>

      <Section title="4. Cookie Duration">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Session cookies:</strong> Deleted when you close your browser. Used for authentication and CSRF protection.</li>
          <li><strong>Persistent cookies:</strong> Stored for up to 30 days. Used to remember your login state for "Remember me" sessions.</li>
          <li><strong>Analytics cookies:</strong> Stored for up to 12 months. Anonymised usage data.</li>
        </ul>
      </Section>

      <Section title="5. Managing Cookies">
        <p>
          You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking essential cookies will prevent you from logging in to ChurchFlow. You can also manage your cookie preferences within ChurchFlow from Settings, then Privacy, then Cookie Preferences.
        </p>
      </Section>

      <Section title="6. Third-Party Cookies">
        <p>
          ChurchFlow may embed YouTube video players for sermon archives. YouTube may set its own cookies when you interact with an embedded video. We recommend reviewing Google's Privacy Policy if you have concerns about YouTube cookies.
        </p>
      </Section>

      <Section title="7. Updates to This Policy">
        <p>
          We will update this Cookie Policy if we introduce new cookie categories or change how we use existing ones. Material changes will be communicated via a notice within the platform.
        </p>
      </Section>
    </LegalLayout>
  )
}

// ─── 4. GDPR Page ───────────────────────────────────────────
export function GDPRPage() {
  return (
    <LegalLayout
      icon={Globe}
      badge="GDPR Compliance"
      title="GDPR and Data Protection"
      subtitle="ChurchFlow's commitment to data protection rights for users subject to European data protection regulations."
    >
      <Section title="1. Our Commitment to Data Protection">
        <p>
          ChurchFlow Liberia is headquartered in Monrovia, Liberia. While the General Data Protection Regulation (GDPR) is a European Union regulation, ChurchFlow has adopted its core principles as a baseline data protection standard for all users globally. We believe these standards represent best practice regardless of jurisdiction.
        </p>
      </Section>

      <Section title="2. Legal Basis for Processing">
        <p>ChurchFlow processes personal data on the following legal bases:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Contractual necessity:</strong> Processing required to provide the subscription service you have paid for.</li>
          <li><strong>Legitimate interests:</strong> Analytics and platform improvement, subject to your right to object.</li>
          <li><strong>Legal obligation:</strong> Retention of financial records as required by Liberian law.</li>
          <li><strong>Consent:</strong> SMS and email marketing communications, which you may withdraw at any time.</li>
        </ul>
      </Section>

      <Section title="3. Data Subject Rights">
        <p>Users who are subject to GDPR (for example, churches with members residing in EU countries) have the following rights under GDPR, which ChurchFlow supports:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Right of access:</strong> Request a copy of your personal data held by ChurchFlow.</li>
          <li><strong>Right to rectification:</strong> Request correction of inaccurate or incomplete personal data.</li>
          <li><strong>Right to erasure ("right to be forgotten"):</strong> Request deletion of your personal data, subject to legal retention requirements.</li>
          <li><strong>Right to restrict processing:</strong> Request that we limit the processing of your personal data in certain circumstances.</li>
          <li><strong>Right to data portability:</strong> Receive your data in a structured, machine-readable format.</li>
          <li><strong>Right to object:</strong> Object to processing based on legitimate interests.</li>
        </ul>
        <p>To submit any data rights request, email privacy@churchflow.lr. We will respond within 30 days.</p>
      </Section>

      <Section title="4. Data Processing Agreements">
        <p>
          If your church is subject to GDPR (for example, if you have members who are EU residents), we are able to provide a Data Processing Agreement (DPA) upon request. The DPA formalises our role as a data processor acting on behalf of your church as the data controller. Contact legal@churchflow.lr to request a DPA.
        </p>
      </Section>

      <Section title="5. International Data Transfers">
        <p>
          ChurchFlow's primary data storage is located in West Africa. If data is processed or backed up in jurisdictions outside of Liberia, we ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) where required for EU data subjects.
        </p>
      </Section>

      <Section title="6. Data Protection Officer">
        <p>
          ChurchFlow has appointed an internal Data Protection Lead who oversees compliance with this policy and applicable data protection law. You may contact our Data Protection Lead at privacy@churchflow.lr for any data protection inquiries, complaints, or requests.
        </p>
      </Section>

      <Section title="7. Reporting a Data Breach">
        <p>
          In the event of a personal data breach affecting your church's data, ChurchFlow will notify affected church administrators without undue delay and in any case within 72 hours of becoming aware of the breach, in accordance with GDPR Article 33 principles. We will include details of the nature of the breach, the data affected, and the steps we have taken to address it.
        </p>
      </Section>
    </LegalLayout>
  )
}
