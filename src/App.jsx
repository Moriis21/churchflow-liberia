// ============================================================
// ChurchFlow Liberia — Main Router (App.jsx)
// ============================================================
import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChurchProvider } from './context/ChurchContext'

// ─── Lazy page imports ────────────────────────────────────────
const Landing        = React.lazy(() => import('./pages/app/Landing'))
const Login          = React.lazy(() => import('./pages/auth/Login'))
const Register       = React.lazy(() => import('./pages/auth/Register'))
const Layout         = React.lazy(() => import('./components/layout/Layout'))
const Dashboard      = React.lazy(() => import('./pages/app/Dashboard'))
const Members        = React.lazy(() => import('./pages/app/Members'))
const MemberProfile  = React.lazy(() => import('./pages/app/MemberProfile'))
const Attendance     = React.lazy(() => import('./pages/app/Attendance'))
const Finance        = React.lazy(() => import('./pages/app/Finance'))
const Events         = React.lazy(() => import('./pages/app/Events'))
const Visitors       = React.lazy(() => import('./pages/app/Visitors'))
const PrayerRequests = React.lazy(() => import('./pages/app/PrayerRequests'))
const Departments    = React.lazy(() => import('./pages/app/Departments'))
const Sermons        = React.lazy(() => import('./pages/app/Sermons'))
const Reports        = React.lazy(() => import('./pages/app/Reports'))
const Branches       = React.lazy(() => import('./pages/app/Branches'))
const Settings       = React.lazy(() => import('./pages/app/Settings'))
const UserManagement = React.lazy(() => import('./pages/app/UserManagement'))

const JoinChurchPage  = React.lazy(() => import('./pages/public/JoinChurchPage'))

// ─── Public pages ─────────────────────────────────────────────
const FeaturesPage    = React.lazy(() => import('./pages/public/FeaturesPage'))
const PricingPage     = React.lazy(() => import('./pages/public/PricingPage'))
const AboutPage       = React.lazy(() => import('./pages/public/AboutPage'))
const ContactPage     = React.lazy(() => import('./pages/public/ContactPage'))
const DocumentationPage = React.lazy(() => import('./pages/public/DocumentationPage'))
const HelpCentrePage  = React.lazy(() => import('./pages/public/HelpCentrePage'))
const ChangelogPage   = React.lazy(() => import('./pages/public/ChangelogPage'))
const RoadmapPage     = React.lazy(() => import('./pages/public/RoadmapPage'))
const StatusPage      = React.lazy(() => import('./pages/public/StatusPage'))
const BlogPage        = React.lazy(() => import('./pages/public/BlogPage'))
const CareersPage     = React.lazy(() => import('./pages/public/CareersPage'))
const PressPage       = React.lazy(() => import('./pages/public/PressPage'))
const CommunityPage   = React.lazy(() => import('./pages/public/CommunityPage'))
const PrivacyPolicy   = React.lazy(() => import('./pages/public/LegalPages').then(m => ({ default: m.PrivacyPolicy  })))
const TermsOfService  = React.lazy(() => import('./pages/public/LegalPages').then(m => ({ default: m.TermsOfService })))
const CookiePolicy    = React.lazy(() => import('./pages/public/LegalPages').then(m => ({ default: m.CookiePolicy   })))
const GDPRPage        = React.lazy(() => import('./pages/public/LegalPages').then(m => ({ default: m.GDPRPage       })))

// ─── Suspense fallback spinner ────────────────────────────────
function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        {/* Animated cross + spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
          <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-purple-600 font-black text-xl leading-none">✝</span>
          </div>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">Loading ChurchFlow…</p>
      </div>
    </div>
  )
}

// ─── Auth loading skeleton ────────────────────────────────────
function AuthSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white font-black text-xl leading-none">✝</span>
        </div>
        <div className="space-y-2 text-center">
          <div className="h-3 w-32 bg-slate-200 rounded-full animate-pulse mx-auto" />
          <div className="h-2.5 w-20 bg-slate-100 rounded-full animate-pulse mx-auto" />
        </div>
      </div>
    </div>
  )
}

// ─── Protected route wrapper ──────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <AuthSkeleton />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// ─── Inner router (needs AuthContext) ────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public root → landing */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Public pages */}
        <Route path="/landing"    element={<Landing />} />
        <Route path="/login"      element={<Login />} />
        <Route path="/register"   element={<Register />} />
        <Route path="/join/:churchId" element={<JoinChurchPage />} />
        <Route path="/features"   element={<FeaturesPage />} />
        <Route path="/pricing"    element={<PricingPage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/docs"       element={<DocumentationPage />} />
        <Route path="/help"       element={<HelpCentrePage />} />
        <Route path="/changelog"  element={<ChangelogPage />} />
        <Route path="/roadmap"    element={<RoadmapPage />} />
        <Route path="/status"     element={<StatusPage />} />
        <Route path="/blog"       element={<BlogPage />} />
        <Route path="/careers"    element={<CareersPage />} />
        <Route path="/press"      element={<PressPage />} />
        <Route path="/community"  element={<CommunityPage />} />
        <Route path="/privacy"    element={<PrivacyPolicy />} />
        <Route path="/terms"      element={<TermsOfService />} />
        <Route path="/cookies"    element={<CookiePolicy />} />
        <Route path="/gdpr"       element={<GDPRPage />} />

        {/* Protected app shell */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Default /app → dashboard */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />

          <Route path="dashboard"      element={<Dashboard />} />
          <Route path="members"        element={<Members />} />
          <Route path="members/:id"    element={<MemberProfile />} />
          <Route path="attendance"     element={<Attendance />} />
          <Route path="finance"        element={<Finance />} />
          <Route path="events"         element={<Events />} />
          <Route path="visitors"       element={<Visitors />} />
          <Route path="prayer-requests" element={<PrayerRequests />} />
          <Route path="departments"    element={<Departments />} />
          <Route path="sermons"        element={<Sermons />} />
          <Route path="reports"        element={<Reports />} />
          <Route path="branches"       element={<Branches />} />
          <Route path="settings"       element={<Settings />} />
          <Route path="users"          element={<UserManagement />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Suspense>
  )
}

// ─── Root App ─────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChurchProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#1E1B4B',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)',
              },
              success: {
                iconTheme: {
                  primary: '#F59E0B',
                  secondary: '#1E1B4B',
                },
              },
              error: {
                style: {
                  background: '#7F1D1D',
                },
              },
            }}
          />
        </ChurchProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
