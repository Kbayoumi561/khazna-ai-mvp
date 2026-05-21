'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { MessageSquare, Clock, Star, ChevronRight, Search } from 'lucide-react'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('conversations')
      .select('*, ai_analysis(quality_score, kb_compliance_score, customer_intent)')
      .order('conversation_date', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setConversations(data || [])
        setLoading(false)
      })
  }, [])

  const filtered = conversations.filter((c) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      c.customer_name?.toLowerCase().includes(q) ||
      c.freshchat_conversation_id?.toLowerCase().includes(q) ||
      c.ai_analysis?.[0]?.customer_intent?.toLowerCase().includes(q)
    )
  })

  const statusColor = (status: string) => {
    if (status === 'resolved') return { bg: 'hsl(158, 64%, 48%, 0.1)', text: 'hsl(158, 64%, 52%)', border: 'hsl(158, 64%, 48%, 0.2)' }
    if (status === 'open')    return { bg: 'hsl(38, 90%, 54%, 0.1)', text: 'hsl(38, 90%, 60%)', border: 'hsl(38, 90%, 54%, 0.2)' }
    return { bg: 'hsl(220, 18%, 16%)', text: 'hsl(215, 12%, 60%)', border: 'hsl(220, 18%, 20%)' }
  }

  const qualityColor = (score: number) => {
    if (score >= 0.8) return 'hsl(158, 64%, 48%)'
    if (score >= 0.6) return 'hsl(38, 90%, 54%)'
    return 'hsl(0, 78%, 58%)'
  }

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Conversations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? 'Loading…' : `${conversations.length} total · ${filtered.length} shown`}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by customer, ID, or intent…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg outline-none transition-all duration-150"
          style={{
            background: 'hsl(222, 35%, 7%)',
            border: '1px solid hsl(220, 18%, 12%)',
            color: 'hsl(210, 30%, 94%)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'hsl(158, 64%, 48%, 0.4)'
            e.target.style.boxShadow = '0 0 0 3px hsl(158, 64%, 48%, 0.07)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'hsl(220, 18%, 12%)'
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* List */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: '1px solid hsl(220, 18%, 11%)', background: 'hsl(222, 35%, 7%)' }}
      >
        {/* Table header */}
        <div
          className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
          style={{ borderBottom: '1px solid hsl(220, 18%, 10%)', background: 'hsl(222, 40%, 5%)' }}
        >
          <span>Customer</span>
          <span className="text-right">FRT</span>
          <span className="text-right">Quality</span>
          <span className="text-right">Status</span>
          <span />
        </div>

        {loading && (
          <div className="divide-y divide-border/50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="shimmer h-4 w-32 rounded" />
                <div className="shimmer h-3 w-16 rounded ml-auto" />
                <div className="shimmer h-5 w-14 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-medium">No conversations found</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              {conversations.length === 0
                ? 'Import data from the Import Data page to get started'
                : 'Try adjusting your search query'}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div>
            {filtered.map((conv, i) => {
              const analysis = conv.ai_analysis?.[0]
              const sc = statusColor(conv.status)
              const frtMins = conv.frt_seconds ? `${Math.floor(conv.frt_seconds / 60)}m` : '—'
              const qualScore = analysis?.quality_score

              return (
                <div
                  key={conv.id}
                  className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center transition-colors duration-100 cursor-pointer group"
                  style={{
                    borderTop: i > 0 ? '1px solid hsl(220, 18%, 9%)' : undefined,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'hsl(220, 18%, 8%, 0.5)' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  <div>
                    <div className="text-sm font-medium text-foreground">{conv.customer_name || 'Unknown'}</div>
                    {analysis?.customer_intent && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {analysis.customer_intent}
                      </div>
                    )}
                    <div className="text-[10px] font-mono text-muted-foreground/50 mt-0.5">
                      {new Date(conv.conversation_date).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm font-mono text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {frtMins}
                  </div>

                  <div className="flex items-center gap-1 text-sm font-mono">
                    {qualScore !== undefined ? (
                      <>
                        <Star className="h-3 w-3" style={{ color: qualityColor(qualScore) }} />
                        <span style={{ color: qualityColor(qualScore) }}>
                          {(qualScore * 100).toFixed(0)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </div>

                  <div>
                    <span
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full uppercase tracking-wide"
                      style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                    >
                      {conv.status || 'open'}
                    </span>
                  </div>

                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
