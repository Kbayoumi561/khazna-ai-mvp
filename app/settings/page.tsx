'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Save, Brain, Database } from 'lucide-react'

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center h-5 w-9 rounded-full transition-all duration-200 shrink-0"
      style={{
        background: checked ? 'hsl(158, 64%, 48%)' : 'hsl(220, 18%, 18%)',
        boxShadow: checked ? '0 0 10px hsl(158, 64%, 48%, 0.3)' : undefined,
        border: `1px solid ${checked ? 'hsl(158, 64%, 48%, 0.5)' : 'hsl(220, 18%, 22%)'}`,
      }}
    >
      <span
        className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform duration-200 shadow-sm"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-4 gap-8">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then(setSettings)
  }, [])

  const update = (key: string, value: any) => {
    setSettings((s) => ({ ...s, [key]: value }))
    setDirty(true)
  }

  const handleSave = async () => {
    setLoading(true)
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    if (res.ok) {
      toast.success('Settings saved')
      setDirty(false)
    } else {
      toast.error('Failed to save settings')
    }
    setLoading(false)
  }

  const divider = <div className="h-px" style={{ background: 'hsl(220, 18%, 10%)' }} />

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Configure your analytics workspace</p>
      </div>

      {/* AI Configuration */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'hsl(222, 35%, 7%)', border: '1px solid hsl(220, 18%, 11%)' }}>
        <div
          className="px-5 py-3.5 flex items-center gap-2.5"
          style={{ borderBottom: '1px solid hsl(220, 18%, 10%)', background: 'hsl(222, 40%, 5%)' }}
        >
          <Brain className="h-3.5 w-3.5" style={{ color: 'hsl(280, 60%, 58%)' }} />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            AI Configuration
          </span>
        </div>
        <div className="px-5">
          <SettingRow
            title="OpenAI Analysis"
            description="Run AI analysis on imported conversations to generate quality scores, intent detection, and compliance insights."
          >
            <Toggle
              checked={Boolean(settings.openai_enabled)}
              onChange={(v) => update('openai_enabled', v)}
            />
          </SettingRow>
        </div>
      </div>

      {/* Data Import */}
      <div className="rounded-lg overflow-hidden" style={{ background: 'hsl(222, 35%, 7%)', border: '1px solid hsl(220, 18%, 11%)' }}>
        <div
          className="px-5 py-3.5 flex items-center gap-2.5"
          style={{ borderBottom: '1px solid hsl(220, 18%, 10%)', background: 'hsl(222, 40%, 5%)' }}
        >
          <Database className="h-3.5 w-3.5" style={{ color: 'hsl(158, 64%, 48%)' }} />
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Data Import
          </span>
        </div>
        <div className="px-5">
          <SettingRow
            title="Google Sheet ID"
            description="The Sheet ID from your Google Sheets URL (between /d/ and /edit). Set this via the GOOGLE_SHEET_ID environment variable in Vercel."
          >
            <span className="text-xs font-mono text-muted-foreground/60 italic">env variable</span>
          </SettingRow>
          {divider}
          <SettingRow
            title="Sheet Name"
            description='Name of the sheet tab to read from. Defaults to "Conversations Export" or the first sheet.'
          >
            <span className="text-xs font-mono text-muted-foreground/60 italic">env variable</span>
          </SettingRow>
          {divider}
          <SettingRow
            title="Connection Status"
            description="Test your Google Sheets connection from the Import Data page."
          >
            <a
              href="/sheets-import"
              className="text-xs font-mono px-2.5 py-1 rounded transition-colors"
              style={{
                color: 'hsl(158, 64%, 52%)',
                background: 'hsl(158, 64%, 48%, 0.1)',
                border: '1px solid hsl(158, 64%, 48%, 0.2)',
              }}
            >
              Open Import Page →
            </a>
          </SettingRow>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {dirty && (
          <span className="text-xs text-muted-foreground font-mono">
            · unsaved changes
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={loading || !dirty}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-150 disabled:opacity-40"
          style={{
            background: dirty
              ? 'linear-gradient(135deg, hsl(158, 64%, 48%) 0%, hsl(158, 64%, 38%) 100%)'
              : 'hsl(220, 18%, 13%)',
            color: dirty ? 'hsl(224, 50%, 4%)' : 'hsl(215, 12%, 50%)',
            boxShadow: dirty ? '0 0 16px hsl(158, 64%, 48%, 0.2)' : undefined,
          }}
        >
          <Save className="h-3.5 w-3.5" />
          {loading ? 'Saving…' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
