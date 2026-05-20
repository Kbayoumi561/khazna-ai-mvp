'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      toast.success('Settings saved')
    } else {
      toast.error('Failed to save settings')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">OpenAI Analysis</p>
              <p className="text-sm text-muted-foreground">Enable AI conversation analysis</p>
            </div>
            <Switch
              checked={Boolean(settings.openai_enabled)}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, openai_enabled: v }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto-sync</p>
              <p className="text-sm text-muted-foreground">Sync every 5 minutes via cron</p>
            </div>
            <Switch
              checked={Boolean(settings.auto_sync_enabled)}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, auto_sync_enabled: v }))}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Webhook Secret</label>
            <Input
              className="mt-2"
              type="password"
              placeholder="Leave empty to skip signature verification"
              value={typeof settings.webhook_secret === 'string' ? settings.webhook_secret : ''}
              onChange={(e) => setSettings((s) => ({ ...s, webhook_secret: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  )
}
