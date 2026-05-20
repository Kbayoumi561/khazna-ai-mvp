'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function AuditPage() {
  const [pending, setPending] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)

  useEffect(() => {
    fetch('/api/audit/pending')
      .then((res) => res.json())
      .then((data) => setPending(data.analyses || []))
  }, [])

  const handleAudit = async (approved: boolean) => {
    const res = await fetch('/api/audit/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysisId: selected.id, approved }),
    })

    if (res.ok) {
      toast.success(approved ? 'Approved' : 'Rejected')
      setPending((prev) => prev.filter((p) => p.id !== selected.id))
      setSelected(null)
    } else {
      toast.error('Action failed')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Audit</h1>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Pending ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.length === 0 && (
              <p className="text-muted-foreground text-sm">No pending analyses.</p>
            )}
            {pending.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selected?.id === item.id ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                }`}
              >
                <div className="text-sm font-medium line-clamp-2">{item.customer_intent}</div>
                <Badge variant="outline" className="mt-1">
                  Quality: {(item.quality_score * 100).toFixed(0)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selected ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Customer Intent</h3>
                  <p>{selected.customer_intent}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-1">Root Cause</h3>
                  <p>{selected.root_cause}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">Quality Score</h3>
                    <p className="text-2xl font-mono font-bold">
                      {(selected.quality_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-1">KB Compliance</h3>
                    <p className="text-2xl font-mono font-bold">
                      {(selected.kb_compliance_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={() => handleAudit(true)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => handleAudit(false)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Select an analysis to review</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
