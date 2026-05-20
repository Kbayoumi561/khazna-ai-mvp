'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Copy, CheckCircle2 } from 'lucide-react'

export default function SyncPage() {
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')

  useEffect(() => {
    setWebhookUrl(`${window.location.origin}/api/webhooks/freshchat`)
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const res = await fetch('/api/sync/logs')
    const data = await res.json()
    setLogs(data.logs || [])
  }

  const handleManualSync = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both dates')
      return
    }
    setLoading(true)

    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromDate, toDate }),
    })

    const data = await response.json()

    if (response.ok) {
      toast.success(`Synced ${data.count} of ${data.total} conversations`)
      fetchLogs()
    } else {
      toast.error('Sync failed')
    }

    setLoading(false)
  }

  const toggleAutoSync = async (enabled: boolean) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_sync_enabled: enabled }),
    })
    setAutoSyncEnabled(enabled)
    toast.success(enabled ? 'Auto-sync enabled' : 'Auto-sync disabled')
  }

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
    toast.success('Webhook URL copied!')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Freshchat Sync</h1>

      <Card>
        <CardHeader>
          <CardTitle>Automatic Sync (API Polling)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-sync every 5 minutes</p>
              <p className="text-sm text-muted-foreground">
                Automatically fetches new conversations from Freshchat
              </p>
            </div>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={toggleAutoSync}
            />
          </div>
          {autoSyncEnabled && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration (Real-time)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">
              Webhook URL (Configure in Freshchat Dashboard)
            </label>
            <div className="flex gap-2 mt-2">
              <Input value={webhookUrl} readOnly />
              <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Add this URL to Freshchat webhook settings for real-time updates
            </p>
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Supported Events</label>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge variant="secondary">message.created</Badge>
              <Badge variant="secondary">conversation.created</Badge>
              <Badge variant="secondary">conversation.updated</Badge>
              <Badge variant="secondary">conversation.resolved</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Sync (Historical Backfill)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Fetch conversations from a specific date range
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">From Date</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">To Date</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleManualSync} disabled={loading} className="w-full">
            {loading ? 'Syncing...' : 'Start Manual Sync'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {logs.length === 0 && (
              <p className="text-muted-foreground text-sm">No sync history yet.</p>
            )}
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border border-border rounded"
              >
                <div>
                  <div className="font-medium text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.date_start} to {log.date_end}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{log.total_synced} synced</span>
                  <Badge
                    variant={
                      log.status === 'completed'
                        ? 'default'
                        : log.status === 'failed'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {log.status}
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
