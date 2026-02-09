"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Bolt,
  Boxes,
  Database,
  FileStack,
  Globe,
  HardDrive,
  Lock,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  Siren,
  Users,
  Wand2,
} from 'lucide-react'
import { adminRequest } from '@/utils/adminApi'

const DEFAULT_ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  ''

const ADMIN_STORAGE_KEY = 'temp_mail_admin_console'

type DashboardMode = 'live' | 'demo'

type AdminStats = {
  activeSessions: number
  newSessionsToday: number
  inboxChecksPerMin: number
  messagesLastHour: number
  avgDeliveryMs: number
  errorRate: number
  blockedRequests: number
  storageUsedMb: number
}

type AdminSeries = {
  volume: number[]
  latency: number[]
  countries: { name: string; value: number }[]
}

type AdminMessage = {
  id: string
  from: string
  subject: string
  receivedAt: string
  size: string
  status: 'delivered' | 'blocked' | 'flagged'
  inbox: string
}

type AdminSession = {
  id: string
  email: string
  createdAt: string
  lastSeen: string
  messages: number
  status: 'active' | 'idle' | 'blocked'
  ip: string
}

type AdminAlert = {
  id: string
  severity: 'low' | 'medium' | 'high'
  message: string
  time: string
}

type AdminDashboard = {
  stats: AdminStats
  series: AdminSeries
  messages: AdminMessage[]
  sessions: AdminSession[]
  alerts: AdminAlert[]
}

const demoDashboard: AdminDashboard = {
  stats: {
    activeSessions: 184,
    newSessionsToday: 612,
    inboxChecksPerMin: 48,
    messagesLastHour: 326,
    avgDeliveryMs: 820,
    errorRate: 0.6,
    blockedRequests: 92,
    storageUsedMb: 412,
  },
  series: {
    volume: [42, 55, 61, 49, 72, 68, 84, 91, 76, 70, 82, 96],
    latency: [980, 930, 880, 840, 860, 820, 810, 790, 770, 760, 720, 700],
    countries: [
      { name: 'EG', value: 32 },
      { name: 'US', value: 18 },
      { name: 'DE', value: 12 },
      { name: 'FR', value: 9 },
      { name: 'IN', value: 16 },
      { name: 'SA', value: 13 },
    ],
  },
  messages: [
    {
      id: 'msg-21f4',
      from: 'noreply@sendtestmail.com',
      subject: 'SendTestMail - Email ID: FB5MtPjD9Y3MNGLGdzLu',
      receivedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      size: '14 KB',
      status: 'delivered',
      inbox: 'nBkPzHVNRlxrH8kwtVqf@narsub.shop',
    },
    {
      id: 'msg-83bd',
      from: 'alerts@stripe.com',
      subject: 'New sign-in from Cairo',
      receivedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      size: '22 KB',
      status: 'flagged',
      inbox: 'k5o9n2x5@narsub.shop',
    },
    {
      id: 'msg-0a12',
      from: 'system@github.com',
      subject: 'Security alert for your repo',
      receivedAt: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
      size: '9 KB',
      status: 'delivered',
      inbox: 'q12b5g9h@narsub.shop',
    },
    {
      id: 'msg-4d10',
      from: 'spam@unknown.tld',
      subject: 'Claim your reward now',
      receivedAt: new Date(Date.now() - 1000 * 60 * 54).toISOString(),
      size: '6 KB',
      status: 'blocked',
      inbox: 'r7x2v4p9@narsub.shop',
    },
  ],
  sessions: [
    {
      id: 'sess-83df',
      email: 'nBkPzHVNRlxrH8kwtVqf@narsub.shop',
      createdAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      messages: 3,
      status: 'active',
      ip: '156.197.238.156',
    },
    {
      id: 'sess-71aa',
      email: 'b9k1z33h@narsub.shop',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 44).toISOString(),
      messages: 5,
      status: 'idle',
      ip: '102.189.44.19',
    },
    {
      id: 'sess-9f01',
      email: 't9r8m3l2@narsub.shop',
      createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      lastSeen: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
      messages: 1,
      status: 'blocked',
      ip: '185.90.11.77',
    },
  ],
  alerts: [
    {
      id: 'alert-1',
      severity: 'high',
      message: 'Session spike detected in the last 10 minutes.',
      time: '2m ago',
    },
    {
      id: 'alert-2',
      severity: 'medium',
      message: 'Blocked IP list updated (7 new addresses).',
      time: '14m ago',
    },
    {
      id: 'alert-3',
      severity: 'low',
      message: 'No worker errors in the last hour.',
      time: '58m ago',
    },
  ],
}

const emptyDashboard: AdminDashboard = {
  stats: {
    activeSessions: 0,
    newSessionsToday: 0,
    inboxChecksPerMin: 0,
    messagesLastHour: 0,
    avgDeliveryMs: 0,
    errorRate: 0,
    blockedRequests: 0,
    storageUsedMb: 0,
  },
  series: {
    volume: Array.from({ length: 12 }, () => 0),
    latency: Array.from({ length: 12 }, () => 0),
    countries: [],
  },
  messages: [],
  sessions: [],
  alerts: [],
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeDashboard(data?: Partial<AdminDashboard>): AdminDashboard {
  if (!data) return emptyDashboard
  return {
    stats: { ...emptyDashboard.stats, ...(data.stats || {}) },
    series: { ...emptyDashboard.series, ...(data.series || {}) },
    messages: data.messages || emptyDashboard.messages,
    sessions: data.sessions || emptyDashboard.sessions,
    alerts: data.alerts || emptyDashboard.alerts,
  }
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const safeData = data.length >= 2 ? data : [0, 0]
  const max = Math.max(...safeData)
  const min = Math.min(...safeData)
  const range = max - min || 1
  const points = safeData
    .map((point, index) => {
      const x = (index / (safeData.length - 1)) * 100
      const y = 100 - ((point - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox="0 0 100 100" className="h-12 w-full">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function BarSeries({ data }: { data: number[] }) {
  const safeData = data.length ? data : [0]
  const max = Math.max(...safeData, 1)
  return (
    <div className="flex h-32 items-end gap-2">
      {safeData.map((value, index) => (
        <div
          key={`bar-${index}`}
          className="flex-1 rounded-lg bg-gradient-to-t from-gray-100 via-gray-200 to-gray-300"
          style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
        />
      ))}
    </div>
  )
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[]
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  let offset = 0
  const gradient = segments
    .map((segment) => {
      const start = (offset / total) * 100
      const end = ((offset + segment.value) / total) * 100
      offset += segment.value
      return `${segment.color} ${start}% ${end}%`
    })
    .join(', ')

  return (
    <div
      className="relative h-28 w-28 rounded-full"
      style={{ background: `conic-gradient(${gradient})` }}
    >
      <div className="absolute inset-4 rounded-full bg-white" />
    </div>
  )
}

function StatusBadge({
  label,
  tone,
}: {
  label: string
  tone: 'good' | 'warn' | 'bad'
}) {
  const tones: Record<typeof tone, string> = {
    good: 'bg-gray-100 text-gray-900 border-gray-300',
    warn: 'bg-gray-100 text-gray-700 border-gray-300',
    bad: 'bg-gray-200 text-gray-900 border-gray-400',
  }
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export default function AdminPage() {
  const [locked, setLocked] = useState(true)
  const [mode, setMode] = useState<DashboardMode>('live')
  const [token, setToken] = useState('')
  const [baseUrl, setBaseUrl] = useState(DEFAULT_ADMIN_API_URL)
  const [dashboard, setDashboard] = useState<AdminDashboard>(emptyDashboard)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'ok'>(
    'idle'
  )
  const [statusMessage, setStatusMessage] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = sessionStorage.getItem(ADMIN_STORAGE_KEY)
    if (!stored) return
    try {
      const parsed = JSON.parse(stored) as {
        baseUrl?: string
        token?: string
        mode?: DashboardMode
      }
      if (parsed.baseUrl) setBaseUrl(parsed.baseUrl)
      if (parsed.token) setToken(parsed.token)
      if (parsed.mode) setMode(parsed.mode)
      if (parsed.token || parsed.mode === 'demo') {
        setLocked(false)
      }
    } catch {
      // ignore invalid storage
    }
  }, [])

  useEffect(() => {
    if (locked) return
    if (mode === 'demo') {
      setDashboard(demoDashboard)
      setStatus('ok')
      setStatusMessage('Demo data loaded. No API calls were made.')
      return
    }

    const run = async () => {
      setStatus('loading')
      setStatusMessage('Fetching live dashboard...')
      try {
        const data = await adminRequest<Partial<AdminDashboard>>(
          '/api/admin/overview',
          {
            baseUrl,
            token,
          }
        )
        setDashboard(normalizeDashboard(data))
        setStatus('ok')
        setStatusMessage('Live data connected.')
      } catch (error) {
        setDashboard(emptyDashboard)
        setStatus('error')
        setStatusMessage(
          error instanceof Error
            ? error.message
            : 'Unable to reach admin API. Check Admin API URL + secret.'
        )
      }
    }

    void run()
  }, [locked, mode, baseUrl, token])

  useEffect(() => {
    if (locked) return
    const autoLockMs = 15 * 60 * 1000
    let timeout = window.setTimeout(() => setLocked(true), autoLockMs)

    const reset = () => {
      window.clearTimeout(timeout)
      timeout = window.setTimeout(() => setLocked(true), autoLockMs)
    }

    window.addEventListener('mousemove', reset)
    window.addEventListener('keydown', reset)
    window.addEventListener('click', reset)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener('mousemove', reset)
      window.removeEventListener('keydown', reset)
      window.removeEventListener('click', reset)
    }
  }, [locked])

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return dashboard.messages
    return dashboard.messages.filter(
      (message) =>
        message.from.toLowerCase().includes(query) ||
        message.subject.toLowerCase().includes(query) ||
        message.inbox.toLowerCase().includes(query)
    )
  }, [dashboard.messages, search])

  const healthTone =
    dashboard.stats.errorRate < 1 && dashboard.stats.blockedRequests < 120
      ? 'good'
      : dashboard.stats.errorRate < 2
        ? 'warn'
        : 'bad'

  const isDemo = mode === 'demo'
  const liveConnected = mode === 'live' && status === 'ok'

  const handleUnlock = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token && mode !== 'demo') {
      setStatusMessage('Enter the admin secret to unlock live mode.')
      return
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        ADMIN_STORAGE_KEY,
        JSON.stringify({ baseUrl, token, mode })
      )
    }
    setLocked(false)
  }

  const handleLock = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(ADMIN_STORAGE_KEY)
    }
    setLocked(true)
    setToken('')
    setStatus('idle')
    setStatusMessage('')
  }

  const handleRefresh = async () => {
    if (mode === 'demo') {
      setDashboard(demoDashboard)
      setStatusMessage('Demo data refreshed.')
      return
    }
    setStatus('loading')
    setStatusMessage('Refreshing live data...')
    try {
      const data = await adminRequest<Partial<AdminDashboard>>(
        '/api/admin/overview',
        {
          baseUrl,
          token,
        }
      )
      setDashboard(normalizeDashboard(data))
      setStatus('ok')
      setStatusMessage('Live data updated.')
    } catch (error) {
      setStatus('error')
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'Refresh failed. Check Admin API URL + secret.'
      )
      setDashboard(emptyDashboard)
    }
  }

  const handleAdminAction = async (
    path: string,
    payload?: Record<string, unknown>
  ) => {
    if (!liveConnected) {
      setStatusMessage(
        isDemo
          ? 'Demo mode: action simulated.'
          : 'Live connection is offline. Fix API URL/secret.'
      )
      return
    }
    setStatus('loading')
    setStatusMessage('Sending admin action...')
    try {
      await adminRequest(path, {
        baseUrl,
        token,
        method: payload ? 'POST' : 'DELETE',
        body: payload,
      })
      setStatus('ok')
      setStatusMessage('Action completed successfully.')
      void handleRefresh()
    } catch (error) {
      setStatus('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Action failed.'
      )
    }
  }
  const adminCapabilitiesNote =
    'This admin view reflects the current worker endpoints: overview metrics, recent messages, and session controls. Full message view requires a dedicated admin message endpoint, which is not enabled in your worker.'

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-900">
      <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-black/5 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-48 right-0 h-[460px] w-[460px] rounded-full bg-black/10 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top,_rgba(255,255,255,0.12)_0%,_rgba(0,0,0,0)_45%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/10 text-black">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                Temp Mail Lab Control
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Admin Command Center
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge label="Zero Trust" tone="good" />
            <StatusBadge label="Rate Limit Active" tone="good" />
            <StatusBadge
              label={
                liveConnected ? 'Live' : isDemo ? 'Demo Mode' : 'Offline'
              }
              tone={liveConnected ? 'good' : isDemo ? 'warn' : 'bad'}
            />
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-900"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleLock}
              className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-900 transition hover:border-gray-400"
            >
              <Lock className="h-4 w-4" />
              Lock
            </button>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-8"
        >
          <motion.section variants={itemVariants}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Active Sessions
                  </p>
                  <Users className="h-4 w-4 text-black" />
                </div>
                <p className="mt-3 text-3xl font-semibold">
                  {formatNumber(dashboard.stats.activeSessions)}
                </p>
                <Sparkline data={dashboard.series.volume} color="#111827" />
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    New Sessions Today
                  </p>
                  <Bolt className="h-4 w-4 text-gray-700" />
                </div>
                <p className="mt-3 text-3xl font-semibold">
                  {formatNumber(dashboard.stats.newSessionsToday)}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Daily limit enforcement enabled
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Inbox Checks / Min
                  </p>
                  <Activity className="h-4 w-4 text-gray-700" />
                </div>
                <p className="mt-3 text-3xl font-semibold">
                  {formatNumber(dashboard.stats.inboxChecksPerMin)}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Auto-refresh throttled to 7s
                </p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Messages / Hour
                  </p>
                  <MessageCircle className="h-4 w-4 text-gray-700" />
                </div>
                <p className="mt-3 text-3xl font-semibold">
                  {formatNumber(dashboard.stats.messagesLastHour)}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Average delivery: {dashboard.stats.avgDeliveryMs} ms
                </p>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="grid gap-6 lg:grid-cols-[2fr_1fr]"
          >
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Email Volume Pulse
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Real-time inbound traffic
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <BarChart3 className="h-4 w-4" />
                  Last 12 intervals
                </div>
              </div>
              <div className="mt-6">
                <BarSeries data={dashboard.series.volume} />
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Security Posture
                  </p>
                  <Siren className="h-4 w-4 text-gray-700" />
                </div>
                <div className="mt-5 flex items-center gap-5">
                  <DonutChart
                    segments={[
                      { label: 'Allowed', value: 86, color: '#22c55e' },
                      { label: 'Blocked', value: 9, color: '#f59e0b' },
                      { label: 'Errors', value: 5, color: '#ef4444' },
                    ]}
                  />
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between gap-6">
                      <span>Blocked Requests</span>
                      <strong>{dashboard.stats.blockedRequests}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span>Error Rate</span>
                      <strong>{formatPercent(dashboard.stats.errorRate)}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-6">
                      <span>Status</span>
                      <StatusBadge
                        label={
                          healthTone === 'good'
                            ? 'Healthy'
                            : healthTone === 'warn'
                              ? 'Warning'
                              : 'Critical'
                        }
                        tone={healthTone}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-gray-700" />
                    Strict CORS & token validation enforced
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-gray-700" />
                    Sanitization allowlist active
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-700" />
                    Rate limit thresholds 60/min (inbox)
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Infrastructure
                  </p>
                  <Database className="h-4 w-4 text-gray-700" />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>DB Storage Used</span>
                    <strong>{dashboard.stats.storageUsedMb} MB</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Worker Region</span>
                    <strong>MRS</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Base</span>
                    <strong className="truncate text-xs">{baseUrl}</strong>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            variants={itemVariants}
            className="grid gap-6 lg:grid-cols-[1.6fr_1fr]"
          >
            <div className="rounded-3xl border border-gray-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Live Messages
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">
                    Recent inbound traffic
                  </h3>
                  <p className="mt-2 max-w-xl text-xs text-gray-500">
                    {adminCapabilitiesNote}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Filter current list..."
                    className="w-48 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs text-gray-900 outline-none transition focus:border-black"
                  />
                  <button
                    onClick={() =>
                      handleAdminAction('/api/admin/message/flush', {
                        scope: 'stale',
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-black bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-900"
                  >
                    <Wand2 className="h-4 w-4" />
                    Clean Stale
                  </button>
                </div>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Sender</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Inbox</th>
                      <th className="px-4 py-3">Received</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMessages.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-gray-500"
                        >
                          No messages yet. Connect live API to see real data.
                        </td>
                      </tr>
                    ) : (
                      filteredMessages.map((message) => (
                        <tr key={message.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{message.from}</div>
                            <div className="text-xs text-gray-500">
                              {message.size}
                            </div>
                          </td>
                          <td className="px-4 py-3">{message.subject}</td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {message.inbox}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {formatTime(message.receivedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              label={
                                message.status === 'delivered'
                                  ? 'Delivered'
                                  : message.status === 'flagged'
                                    ? 'Flagged'
                                    : 'Blocked'
                              }
                              tone={
                                message.status === 'delivered'
                                  ? 'good'
                                  : message.status === 'flagged'
                                    ? 'warn'
                                    : 'bad'
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleAdminAction(
                                    `/api/admin/message/${message.id}`
                                  )
                                }
                                className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-900 transition hover:border-gray-400"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Active Sessions
                  </p>
                  <Users className="h-4 w-4 text-black" />
                </div>
                <div className="mt-4 space-y-3">
                  {dashboard.sessions.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                      No active sessions yet.
                    </div>
                  ) : (
                    dashboard.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {session.email}
                            </p>
                            <p className="text-xs text-gray-500">
                              IP {session.ip}
                            </p>
                          </div>
                          <StatusBadge
                            label={
                              session.status === 'active'
                                ? 'Active'
                                : session.status === 'idle'
                                  ? 'Idle'
                                  : 'Blocked'
                            }
                            tone={
                              session.status === 'active'
                                ? 'good'
                                : session.status === 'idle'
                                  ? 'warn'
                                  : 'bad'
                            }
                          />
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {session.messages} msgs ·{' '}
                            {formatTime(session.lastSeen)}
                          </span>
                          <button
                            onClick={() =>
                              handleAdminAction('/api/admin/session/revoke', {
                                sessionId: session.id,
                              })
                            }
                            className="rounded-full border border-gray-300 px-3 py-1 text-[11px] font-semibold text-gray-900 transition hover:border-gray-400"
                          >
                            Revoke
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Country Mix
                  </p>
                  <Globe className="h-4 w-4 text-gray-700" />
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  {dashboard.series.countries.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      No geo data yet.
                    </div>
                  ) : (
                    dashboard.series.countries.map((country) => (
                      <div key={country.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span>{country.name}</span>
                          <span>{country.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-black/40"
                            style={{ width: `${country.value}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Incident Feed
                  </p>
                  <Siren className="h-4 w-4 text-gray-700" />
                </div>
                <div className="mt-4 space-y-4">
                  {dashboard.alerts.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
                      No alerts. Everything looks stable.
                    </div>
                  ) : (
                    dashboard.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex items-center justify-between">
                          <StatusBadge
                            label={alert.severity.toUpperCase()}
                            tone={
                              alert.severity === 'high'
                                ? 'bad'
                                : alert.severity === 'medium'
                                  ? 'warn'
                                  : 'good'
                            }
                          />
                          <span className="text-xs text-gray-500">
                            {alert.time}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-900">
                          {alert.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Latency Trend
                  </p>
                  <Activity className="h-4 w-4 text-gray-700" />
                </div>
                <div className="mt-6">
                  <Sparkline data={dashboard.series.latency} color="#111827" />
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Avg {dashboard.stats.avgDeliveryMs} ms</span>
                    <span>Target &lt; 1500 ms</span>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-gray-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-widest text-gray-500">
                    Admin Actions
                  </p>
                  <Boxes className="h-4 w-4 text-black" />
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-600">
                  <button
                    onClick={() =>
                      handleAdminAction('/api/admin/sessions/expire', {
                        scope: 'idle',
                      })
                    }
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-400"
                  >
                    <span>Expire idle sessions</span>
                    <HardDrive className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleAdminAction('/api/admin/security/rotate')}
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-400"
                  >
                    <span>Rotate API secrets</span>
                    <ShieldCheck className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleAdminAction('/api/admin/logs/export')}
                    className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-400"
                  >
                    <span>Export audit logs</span>
                    <FileStack className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>

        {statusMessage && (
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Siren className="h-4 w-4 text-black" />
              <span>{statusMessage}</span>
            </div>
            <span className="text-gray-400">
              {status === 'loading' ? 'Updating...' : 'Ready'}
            </span>
          </div>
        )}
      </div>

      {locked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur">
          <motion.form
            onSubmit={handleUnlock}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-[0_30px_60px_-40px_rgba(15,23,42,0.45)]"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-black via-gray-700 to-black" />
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white">
                <Lock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                  Admin Gate
                </p>
                <h2 className="text-2xl font-semibold">Unlock Console</h2>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Enter the admin secret stored in your Cloudflare Worker environment
              variables. Sessions auto-lock after 15 minutes of inactivity.
            </p>
            <div className="mt-6 space-y-4">
              <label className="block text-xs uppercase tracking-widest text-gray-500">
                Admin API Base URL
                <input
                  value={baseUrl}
                  onChange={(event) => setBaseUrl(event.target.value)}
                  placeholder="https://your-worker.workers.dev"
                  className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
                />
              </label>
              <label className="block text-xs uppercase tracking-widest text-gray-500">
                Admin Secret
                <input
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  type="password"
                  placeholder="Enter secret"
                  className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-black"
                />
              </label>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <input
                  id="demoMode"
                  type="checkbox"
                  checked={mode === 'demo'}
                  onChange={(event) =>
                    setMode(event.target.checked ? 'demo' : 'live')
                  }
                  className="h-4 w-4 rounded border-gray-300 bg-white text-black"
                />
                <label htmlFor="demoMode">
                  Use demo data (no API calls)
                </label>
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                <ShieldCheck className="h-4 w-4" />
                Unlock Console
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </div>
  )
}


