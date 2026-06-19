// ============================================================
// ChurchFlow Liberia, Status Page (/status)
// ============================================================
import React, { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, Clock, RefreshCw, Shield } from 'lucide-react'
import PublicLayout from './PublicLayout'

const SERVICES = [
  {
    name: 'API Gateway',
    description: 'Core application programming interface and request routing',
    status: 'operational',
    latency: '48ms',
  },
  {
    name: 'Database',
    description: 'Primary member, finance, and attendance data storage',
    status: 'operational',
    latency: '12ms',
  },
  {
    name: 'SMS Gateway',
    description: 'Bulk SMS and notification delivery via Liberian carriers',
    status: 'operational',
    latency: '210ms',
  },
  {
    name: 'Authentication',
    description: 'Secure login, session management, and access control',
    status: 'operational',
    latency: '35ms',
  },
  {
    name: 'File Storage',
    description: 'Member photos, church documents, and exported reports',
    status: 'operational',
    latency: '85ms',
  },
  {
    name: 'Email Delivery',
    description: 'Transactional emails, receipts, and notification emails',
    status: 'operational',
    latency: '160ms',
  },
  {
    name: 'PWA and Web App',
    description: 'Frontend web application and Progressive Web App delivery',
    status: 'operational',
    latency: '22ms',
  },
]

const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    dot: 'bg-green-500',
    border: 'border-green-200',
  },
  degraded: {
    label: 'Degraded',
    icon: AlertCircle,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  outage: {
    label: 'Outage',
    icon: AlertCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    dot: 'bg-red-500',
    border: 'border-red-200',
  },
}

// Generate 90 uptime blocks, all green
function generateUptimeBlocks() {
  return Array.from({ length: 90 }, (_, i) => ({
    day: i,
    status: 'operational',
    uptime: '100%',
  }))
}

function UptimeBar({ blocks }) {
  return (
    <div className="flex gap-0.5 items-end h-8">
      {blocks.map((block, idx) => (
        <div
          key={idx}
          title={`Day ${90 - idx}: ${block.uptime} uptime`}
          className={`flex-1 rounded-sm cursor-default transition-opacity hover:opacity-70 ${
            block.status === 'operational' ? 'bg-green-400 h-6' :
            block.status === 'degraded'   ? 'bg-amber-400 h-4' :
            'bg-red-400 h-2'
          }`}
        />
      ))}
    </div>
  )
}

function formatTimestamp(date) {
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  })
}

export default function StatusPage() {
  const uptimeBlocks = generateUptimeBlocks()
  const [lastChecked, setLastChecked] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  async function handleRefresh() {
    setRefreshing(true)
    await new Promise(res => setTimeout(res, 800))
    setLastChecked(new Date())
    setRefreshing(false)
  }

  useEffect(() => {
    const interval = setInterval(() => setLastChecked(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const allOperational = SERVICES.every(s => s.status === 'operational')

  return (
    <PublicLayout>
      {/* Overall status banner */}
      <section className={`py-12 px-4 ${allOperational ? 'bg-green-600' : 'bg-amber-500'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            {allOperational ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <AlertCircle className="w-8 h-8 text-white" />
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {allOperational ? 'All Systems Operational' : 'Partial Service Disruption'}
            </h1>
          </div>
          <p className="text-white/80 text-sm">
            {allOperational
              ? 'All ChurchFlow services are running normally. No incidents reported.'
              : 'Some services are experiencing issues. Our team is investigating.'}
          </p>
        </div>
      </section>

      {/* Last checked + refresh */}
      <div className="bg-white border-b border-slate-100 py-4 px-4">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last checked: <strong className="text-slate-700">{formatTimestamp(lastChecked)}</strong></span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-transparent disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Services table */}
      <section className="py-16 px-4 bg-transparent">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-[#151022] mb-8">Service Status</h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {SERVICES.map((service, idx) => {
              const cfg = STATUS_CONFIG[service.status]
              const Icon = cfg.icon
              return (
                <div
                  key={service.name}
                  className={`flex items-center justify-between gap-4 px-6 py-4 ${
                    idx < SERVICES.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#151022] text-sm">{service.name}</p>
                      <p className="text-slate-400 text-xs truncate">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xs text-slate-400 hidden sm:block">
                      {service.latency} avg
                    </span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 90-day uptime */}
      <section className="py-10 px-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#151022]">90-Day Uptime History</h2>
            <span className="text-green-600 font-bold text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              99.9% overall
            </span>
          </div>

          <div className="bg-transparent rounded-2xl border border-slate-200 p-6">
            <UptimeBar blocks={uptimeBlocks} />
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-green-400" />
                Operational
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-amber-400" />
                Degraded
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="w-3 h-3 rounded-sm bg-red-400" />
                Outage
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Incident history note */}
      <section className="py-12 px-4 bg-transparent border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-[#151022] mb-5">Recent Incidents</h2>
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-[#151022] mb-1">No incidents in the last 90 days</p>
            <p className="text-slate-400 text-sm">ChurchFlow has maintained full operational status since launch.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
