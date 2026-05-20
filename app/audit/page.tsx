'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, ChevronRight, Inbox, Star, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function AuditPage() {
  const [pending, setPending] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/audit/pending')
      .then((res) => res.json())
      .then((data) => {
        setPending(data.analyses || [])
        setLoading(false)
      })
  }, [])

  const handleAudit = async (approved: boolean) => {
    setSubmitting(true)
    const res = await fetch('/api/audit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: selected.id, approved }),
    })

    if (res.ok) {
      toast.success(approved ? 'Analysis approved' : 'Analysis rejected')
      setPending((prev) => prev.filter((p) => p.id !== selected.id))
      setSelected(null)
    } else {
      toast.error('Action failed')
    }
    setSubmitting(false)
  }

  const scoreColor = (score: number) => {
    if (score >= 0.8) return 'hsl(158, 64%, 48%)'
    if (score >= 0.6) return 'hsl(38, 90%, 54%)'
    return 'hsl(0, 78%, 58%)'
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review and approve AI-generated conversation analyses
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5 h-[calc(100vh-12rem)]">
        {/* Queue panel */}
        <div
          className="col-span-1 rounded-lg overflow-hidden flex flex-col"
          style={{ background: 'hsl(222, 35%, 7%)', border: '1px solid hsl(220, 18%, 11%)' }}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid hsl(220, 18%, 10%)', background: 'hsl(222, 40%, 5%)' }}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Pending Review
            </span>
            {pending.length > 0 && (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'hsl(38, 90%, 54%, 0.12)',
                  color: 'hsl(38, 90%, 60%)',
                  border: '1px solid hsl(38, 90%, 54%, 0.2)',
                }}
              >
                {pending.length}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="p-3 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shimmer h-16 rounded-md" />
                ))}
              </div>
            )}

            {!loading && pending.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center px-4">
                <Inbox className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Queue is clear</p>
                <p className="text-xs text-muted-foreground/50 mt-1">No pending analyses</p>
              </div>
            )}

            {!loading && pending.map((item) => {
              const isSelected = selected?.id === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className="w-full text-left px-3 py-3 transition-all duration-100 group"
                  style={{
                    background: isSelected ? 'hsl(158, 64%, 48%, 0.07)' : undefined,
                    borderLeft: isSelected ? '2px solid hsl(158, 64%, 48%)' : '2px solid transparent',
                    borderBottom: '1px solid hsl(220, 18%, 9%)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'hsl(220, 18%, 8%, 0.6)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = ''
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                        {item.customer_intent || 'No intent captured'}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className="text-[10px] font-mono"
                          style={{ color: scoreColor(item.quality_score) }}
                        >
                          Q: {(item.quality_score * 100).toFixed(0)}%
                        </span>
                        <span
                          className="text-[10px] font-mono text-muted-foreground/50"
                        >
                          KB: {(item.kb_compliance_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 mt-0.5 shrink-0 group-hover:text-muted-foreground transition-colors" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div
          className="col-span-2 rounded-lg flex flex-col overflow-hidden"
          style={{ background: 'hsl(222, 35%, 7%)', border: '1px solid hsl(220, 18%, 11%)' }}
        >
          <div
            className="px-5 py-3"
            style={{ borderBottom: '1px solid hsl(220, 18%, 10%)', background: 'hsl(222, 40%, 5%)' }}
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Analysis Detail
            </span>
          </div>

          {!selected ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center px-8">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 18%, 14%)' }}
              >
                <CheckCircle className="h-6 w-6 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Select an analysis to review</p>
              <p className="text-xs text-muted-foreground/50 mt-1">
                Choose an item from the queue on the left
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Intent */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Customer Intent
                </label>
                <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                  {selected.customer_intent}
                </p>
              </div>

              {/* Root Cause */}
              {selected.root_cause && (
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    Root Cause
                  </label>
                  <p className="mt-1.5 text-sm text-foreground leading-relaxed">
                    {selected.root_cause}
                  </p>
                </div>
              )}

              {/* Scores */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Quality Score',
                    value: selected.quality_score,
                    icon: Star,
                    color: scoreColor(selected.quality_score),
                  },
                  {
                    label: 'KB Compliance',
                    value: selected.kb_compliance_score,
                    icon: Shield,
                    color: scoreColor(selected.kb_compliance_score),
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="rounded-lg p-4"
                    style={{ background: 'hsl(222, 40%, 5%)', border: '1px solid hsl(220, 18%, 10%)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-3.5 w-3.5" style={{ color }} />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {label}
                      </span>
                    </div>
                    <div className="font-data text-3xl font-medium" style={{ color }}>
                      {(value * 100).toFixed(0)}%
                    </div>
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'hsl(220, 18%, 14%)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(value * 100).toFixed(0)}%`, background: color, boxShadow: `0 0 6px ${color}60` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-3 pt-2 border-t"
                style={{ borderColor: 'hsl(220, 18%, 11%)' }}
              >
                <button
                  onClick={() => handleAudit(true)}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, hsl(158, 64%, 48%) 0%, hsl(158, 64%, 38%) 100%)',
                    color: 'hsl(224, 50%, 4%)',
                    boxShadow: '0 0 16px hsl(158, 64%, 48%, 0.2)',
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>

                <button
                  onClick={() => handleAudit(false)}
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-50"
                  style={{
                    background: 'hsl(0, 78%, 58%, 0.12)',
                    color: 'hsl(0, 78%, 68%)',
                    border: '1px solid hsl(0, 78%, 58%, 0.25)',
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
