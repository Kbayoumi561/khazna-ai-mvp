'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { MessageSquare, Clock, TrendingUp, Shield, RefreshCw, AlertCircle } from 'lucide-react'

export default function DashboardPage() {
  const [kpis, setKpis] = useState({
    totalConversations: 0,
    avgFRT: 0,
    avgQuality: 0,
    avgCompliance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchKPIs = () => {
    setLoading(true)
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setKpis(data)
        setLastUpdated(new Date())
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchKPIs()
  }, [])

  const frtMinutes = Math.floor(kpis.avgFRT / 60)
  const frtSeconds = kpis.avgFRT % 60

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time support performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs font-mono text-muted-foreground">
              updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchKPIs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all duration-150 font-medium"
            style={{
              background: 'hsl(220, 18%, 11%)',
              border: '1px solid hsl(220, 18%, 16%)',
              color: 'hsl(215, 12%, 60%)',
            }}
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-up-delay-1">
          <KPICard
            title="Total Conversations"
            value={loading ? '—' : kpis.totalConversations.toLocaleString()}
            icon={MessageSquare}
            subtitle="All imported conversations"
            accentColor="hsl(158, 64%, 48%)"
          />
        </div>
        <div className="animate-fade-up-delay-2">
          <KPICard
            title="Avg First Response"
            value={loading ? '—' : `${frtMinutes}m ${frtSeconds}s`}
            icon={Clock}
            subtitle="Average response latency"
            accentColor="hsl(199, 85%, 50%)"
          />
        </div>
        <div className="animate-fade-up-delay-3">
          <KPICard
            title="Quality Score"
            value={loading ? '—' : `${(kpis.avgQuality * 100).toFixed(1)}%`}
            icon={TrendingUp}
            subtitle="AI-assessed conversation quality"
            accentColor="hsl(38, 90%, 54%)"
          />
        </div>
        <div className="animate-fade-up-delay-4">
          <KPICard
            title="KB Compliance"
            value={loading ? '—' : `${(kpis.avgCompliance * 100).toFixed(1)}%`}
            icon={Shield}
            subtitle="Knowledge base adherence rate"
            accentColor="hsl(280, 60%, 58%)"
          />
        </div>
      </div>

      {/* Status section */}
      {!loading && kpis.totalConversations === 0 && (
        <div
          className="flex items-start gap-4 p-5 rounded-lg"
          style={{
            background: 'hsl(38, 90%, 54%, 0.06)',
            border: '1px solid hsl(38, 90%, 54%, 0.15)',
          }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: 'hsl(38, 90%, 54%)' }} />
          <div>
            <p className="text-sm font-medium text-foreground">No conversation data yet</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Import conversations from the{' '}
              <a href="/sheets-import" className="underline" style={{ color: 'hsl(158, 64%, 48%)' }}>
                Import Data
              </a>{' '}
              page to see your analytics here.
            </p>
          </div>
        </div>
      )}

      {/* Divider with label */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1" style={{ background: 'hsl(220, 18%, 10%)' }} />
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          Performance Breakdown
        </span>
        <div className="h-px flex-1" style={{ background: 'hsl(220, 18%, 10%)' }} />
      </div>

      {/* Metric bars */}
      {!loading && kpis.totalConversations > 0 && (
        <div
          className="rounded-lg p-5 space-y-5"
          style={{
            background: 'hsl(222, 35%, 7%)',
            border: '1px solid hsl(220, 18%, 11%)',
          }}
        >
          {[
            { label: 'Quality Score', value: kpis.avgQuality, color: 'hsl(38, 90%, 54%)' },
            { label: 'KB Compliance', value: kpis.avgCompliance, color: 'hsl(158, 64%, 48%)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <span className="text-xs font-mono font-medium text-foreground">
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(220, 18%, 13%)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(value * 100).toFixed(1)}%`,
                    background: color,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
