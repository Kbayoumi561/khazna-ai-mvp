'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('conversations')
      .select('*, ai_analysis(quality_score, kb_compliance_score, customer_intent)')
      .order('conversation_date', { ascending: false })
      .limit(50)
      .then(({ data }) => setConversations(data || []))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Conversations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations ({conversations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {conversations.length === 0 && (
              <p className="text-muted-foreground text-sm">No conversations yet. Sync from the Sync page.</p>
            )}
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="font-medium">{conv.customer_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(conv.conversation_date).toLocaleString()}
                  </div>
                  {conv.ai_analysis?.[0]?.customer_intent && (
                    <div className="text-xs text-muted-foreground">
                      {conv.ai_analysis[0].customer_intent}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {conv.frt_seconds && (
                    <span className="text-sm text-muted-foreground">
                      FRT: {Math.floor(conv.frt_seconds / 60)}m
                    </span>
                  )}
                  {conv.ai_analysis?.[0]?.quality_score !== undefined && (
                    <Badge variant="outline">
                      Quality: {(conv.ai_analysis[0].quality_score * 100).toFixed(0)}%
                    </Badge>
                  )}
                  <Badge
                    variant={conv.status === 'resolved' ? 'default' : 'secondary'}
                  >
                    {conv.status || 'open'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
