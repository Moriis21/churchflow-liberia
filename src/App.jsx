// ============================================================
// ChurchFlow Liberia — Main Router (App.jsx)
// ============================================================
import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChurchProvider } from './context/ChurchContext'
import PWAInstallPrompt from './components/ui/PWAInstallPrompt'

// ─── Lazy page imports ────────────────────────────────────────
const Landing          = React.lazy(() => import('./pages/app/Landing'))
const Login            = React.lazy(() => import('./pages/auth/Login'))
const Register         = React.lazy(() => import('./pages/auth/Register'))
const ForgotPassword   = React.lazy(() => import('./pages/auth/ForgotPassword'))
const AuthCallback     = React.lazy(() => import('./pages/auth/AuthCallback'))
const Layout           = React.lazy(() => import('./components/layout/Layout'))
const Dashboard        = React.lazy(() => import('./pages/app/Dashboard'))
const MemberDashboard  = React.lazy(() => import('./pages/app/MemberDashboard'))
const Members        = React.lazy(() => import('./pages/app/Members'))
const MemberProfile  = React.lazy(() => import('./pages/app/MemberProfile'))
const Attendance     = React.lazy(() => import('./pages/app/Attendance'))
const Finance        = React.lazy(() => import('./pages/app/Finance'))
const Events         = React.lazy(() => import('./pages/app/Events'))
const Visitors       = React.lazy(() => import('./pages/app/Visitors'))
const PrayerRequests = React.lazy(() => import('./pages/app/PrayerRequests'))
const Departments    = React.lazy(() => import('./pages/app/Departments'))
const Sermons        = React.lazy(() => import('./pages/app/Sermons'))
const LiveStreams     = React.lazy(() => import('./pages/app/LiveStreams'))
const Reports        = React.lazy(() => import('./pages/app/Reports'))
const Branches       = React.lazy(() => import('./pages/app/Branches'))
const Settings       = React.lazy(() => import('./pages/app/Settings'))
const UserManagement = React.lazy(() => import('./pages/app/UserManagement'))

const SuperAdminDashboard  = React.lazy(() => import('./pages/app/SuperAdminDashboard'))
const SuperAdminSettings   = React.lazy(() => import('./pages/app/SuperAdminSettings'))
const ProfilePage          = React.lazy(() => import('./pages/app/ProfilePage'))
const CompleteSetup        = React.lazy(() => import('./pages/app/CompleteSetup'))
const MemberSettings       = React.lazy(() => import('./pages/app/MemberSettings'))
const AuditLogs            = React.lazy(() => import('./pages/app/AuditLogs'))
const BibleLearning        = React.lazy(() => import('./pages/app/BibleLearning'))

// ─── Route guards ─────────────────────────────────────────────
import PermissionGuard from './components/auth/PermissionGuard'

const JoinChurchPage  = React.lazy(() => import('./pages/public/JoinChurchPage'))
const InvitePage      = React.lazy(() => import('./pages/public/InvitePage'))

// ─── Public pages ─────────────────────────────────────────────
const FeaturesPage    = React.lazy(() => import('./pages/public/FeaturesPage'))
const PricingPage     = React.lazy(() => import('./pages/public/PricingPage'))
const AboutPage       = React.lazy(() => import('./pages/public/AboutPage'))
const ContactPage     = React.lazy(() => import('./pages/public/ContactPage'))
const DocumentationPage = React.lazy(() => import('./pages/public/DocumentationPage'))
const HelpCentrePage  = React.lazy(() => import('./pages/public/HelpCentrePage'))
const TutorialsPage   = React.lazy(() => import('./pages/public/TutorialsPage'))
const WebinarsPage    = React.lazy(() => import('./pages/public/WebinarsPage'))
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
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#151022] to-[#5B00B8] flex items-center justify-center shadow-lg animate-pulse">
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
  const { user, loading, pendingTwoFactor } = useAuth()
  if (loading) return <AuthSkeleton />
  // If the user's session needs 2FA verification, hold them at /login
  if (pendingTwoFactor && !user) return <Navigate to="/login" replace />
  if (!user)   return <Navigate to="/login" replace />
  return children
}

// ─── Role-aware dashboard ─────────────────────────────────────
// Members see their personal MemberDashboard.
// All other church roles see the main admin Dashboard.
function RoleDashboard() {
  const { user } = useAuth()
  const role = user?.profile?.role || user?.role || user?.user_metadata?.role || 'member'
  if (role === 'member') return <MemberDashboard />
  return <Dashboard />
}

// ─── Inner router (needs AuthContext) ────────────────────────
function AppRoutes() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        {/* Public root → landing */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Public pages */}
        <Route path="/landing"           element={<Landing />} />
        <Route path="/login"             element={<Login />} />
        <Route path="/register"          element={<Register />} />
        <Route path="/forgot-password"   element={<ForgotPassword />} />
        <Route path="/complete-setup"     element={<CompleteSetup />} />
        <Route path="/auth/callback"      element={<AuthCallback />} />
        {/* Legacy /join/:churchId removed — members must use invite links now */}
        <Route path="/join/:churchId" element={<Navigate to="/login" replace />} />
        <Route path="/invite/:token"  element={<InvitePage />} />
        <Route path="/features"   element={<FeaturesPage />} />
        <Route path="/pricing"    element={<PricingPage />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/contact"    element={<ContactPage />} />
        <Route path="/docs"       element={<DocumentationPage />} />
        <Route path="/help"       element={<HelpCentrePage />} />
        <Route path="/tutorials"  element={<TutorialsPage />} />
        <Route path="/webinars"   element={<WebinarsPage />} />
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
          {/* Default /app → role-aware dashboard */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />

          {/* Dashboard — members see MemberDashboard, others see full Dashboard */}
          <Route path="dashboard" element={<RoleDashboard />} />

          {/* Super Admin only */}
          <Route path="super-admin"          element={<SuperAdminDashboard />} />
          <Route path="super-admin-settings" element={<SuperAdminSettings />} />

          {/* Available to all authenticated users */}
          <Route path="profile"         element={<ProfilePage />} />
          <Route path="events"          element={<Events />} />
          <Route path="prayer-requests" element={<PrayerRequests />} />
          <Route path="sermons"         element={<Sermons />} />
          <Route path="live-streams"    element={<LiveStreams />} />
          <Route path="bible-learning"  element={<BibleLearning />} />

          {/* Church staff only (NOT members) */}
          <Route path="members" element={
            <PermissionGuard routeKey="members"><Members /></PermissionGuard>
          } />
          <Route path="members/:id" element={
            <PermissionGuard routeKey="members/:id"><MemberProfile /></PermissionGuard>
          } />
          <Route path="attendance" element={
            <PermissionGuard routeKey="attendance"><Attendance /></PermissionGuard>
          } />
          <Route path="departments" element={
            <PermissionGuard routeKey="departments"><Departments /></PermissionGuard>
          } />
          <Route path="visitors" element={
            <PermissionGuard routeKey="visitors"><Visitors /></PermissionGuard>
          } />

          {/* Finance — church_admin + treasurer only */}
          <Route path="finance" element={
            <PermissionGuard routeKey="finance"><Finance /></PermissionGuard>
          } />

          {/* Reports — church_admin, pastor, treasurer only */}
          <Route path="reports" element={
            <PermissionGuard routeKey="reports"><Reports /></PermissionGuard>
          } />

          {/* Church Admin + Pastor */}
          <Route path="users" element={
            <PermissionGuard routeKey="users"><UserManagement /></PermissionGuard>
          } />

          {/* Audit logs — church_admin (own church) and super_admin (all) */}
          <Route path="audit-logs" element={<AuditLogs />} />

          {/* Church Admin only */}
          <Route path="settings" element={
            <PermissionGuard routeKey="settings"><Settings /></PermissionGuard>
          } />
          <Route path="branches" element={
            <PermissionGuard routeKey="branches"><Branches /></PermissionGuard>
          } />

          {/* Member-only personal pages */}
          <Route path="member-settings" element={
            <PermissionGuard routeKey="member-settings"><MemberSettings /></PermissionGuard>
          } />
          {/* My Attendance — member sees only their own records (uses Attendance in read-only mode) */}
          <Route path="member-attendance" element={
            <PermissionGuard routeKey="member-attendance"><Attendance /></PermissionGuard>
          } />
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
          <PWAInstallPrompt />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '12px',
                background: '#151022',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)',
              },
              success: {
                iconTheme: {
                  primary: '#F59E0B',
                  secondary: '#151022',
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
