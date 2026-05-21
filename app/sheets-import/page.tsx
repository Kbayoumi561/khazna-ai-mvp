'use client'

import { useState } from 'react'
import {
  CheckCircle2, XCircle, AlertTriangle, Wifi, ShieldCheck,
  ArrowDownToLine, ChevronDown, ChevronUp, Loader2, FileSpreadsheet,
  BarChart2, SkipForward, RotateCcw,
} from 'lucide-react'

interface ValidationError {
  row: number
  field: string
  error: string
  value: any
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  totalRows: number
  validRows: number
  error?: string
}

interface ImportResult {
  success: boolean
  imported: number
  skippedInvalid: number
  skippedDuplicate: number
  total: number
  error?: string
}

interface TestResult {
  success: boolean
  sheetTitle?: string
  sheetName?: string
  rowCount?: number
  error?: string
}

type StepStatus = 'idle' | 'loading' | 'success' | 'error'

function StepBadge({ status, step }: { status: StepStatus; step: number }) {
  if (status === 'loading') {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'hsl(199, 85%, 50%, 0.12)', border: '1px solid hsl(199, 85%, 50%, 0.3)' }}
      >
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'hsl(199, 85%, 50%)' }} />
      </div>
    )
  }
  if (status === 'success') {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'hsl(158, 64%, 48%, 0.12)', border: '1px solid hsl(158, 64%, 48%, 0.3)', boxShadow: '0 0 10px hsl(158, 64%, 48%, 0.2)' }}
      >
        <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(158, 64%, 48%)' }} />
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: 'hsl(0, 78%, 58%, 0.12)', border: '1px solid hsl(0, 78%, 58%, 0.3)' }}
      >
        <XCircle className="h-4 w-4" style={{ color: 'hsl(0, 78%, 58%)' }} />
      </div>
    )
  }
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm font-semibold"
      style={{ background: 'hsl(220, 18%, 13%)', border: '1px solid hsl(220, 18%, 18%)', color: 'hsl(215, 12%, 55%)' }}
    >
      {step}
    </div>
  )
}

function ErrorTable({ items, type }: { items: ValidationError[]; type: 'error' | 'warning' }) {
  const [expanded, setExpanded] = useState(false)
  const shown = expanded ? items : items.slice(0, 5)
  const color = type === 'error' ? 'hsl(0, 78%, 58%)' : 'hsl(38, 90%, 54%)'
  const bg = type === 'error' ? 'hsl(0, 78%, 58%, 0.06)' : 'hsl(38, 90%, 54%, 0.06)'
  const border = type === 'error' ? 'hsl(0, 78%, 58%, 0.15)' : 'hsl(38, 90%, 54%, 0.15)'

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-2">
          {type === 'error'
            ? <XCircle className="h-3.5 w-3.5" style={{ color }} />
            : <AlertTriangle className="h-3.5 w-3.5" style={{ color }} />
          }
          <span className="text-xs font-mono font-medium" style={{ color }}>
            {items.length} {type === 'error' ? 'Error' : 'Warning'}{items.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      <div className="divide-y" style={{ borderColor: border }}>
        {shown.map((item, i) => (
          <div key={i} className="px-4 py-2.5 grid grid-cols-[auto_1fr_1fr] gap-3 items-start">
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0"
              style={{ background: `${color}18`, color, border: `1px solid ${color}28` }}
            >
              row {item.row}
            </span>
            <span className="text-xs font-mono text-muted-foreground">{item.field}</span>
            <span className="text-xs text-muted-foreground">{item.error}</span>
          </div>
        ))}
      </div>
      {items.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-4 py-2 text-xs flex items-center justify-center gap-1.5 transition-colors"
          style={{ color: 'hsl(215, 12%, 55%)', borderTop: `1px solid ${border}` }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = color }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'hsl(215, 12%, 55%)' }}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? 'Show less' : `Show ${items.length - 5} more`}
        </button>
      )}
    </div>
  )
}

export default function SheetsImportPage() {
  const [testStatus, setTestStatus] = useState<StepStatus>('idle')
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const [validateStatus, setValidateStatus] = useState<StepStatus>('idle')
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const [importStatus, setImportStatus] = useState<StepStatus>('idle')
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

  const anyLoading = testStatus === 'loading' || validateStatus === 'loading' || importStatus === 'loading'

  const handleTest = async () => {
    setTestStatus('loading')
    setTestResult(null)
    try {
      const res = await fetch('/api/sheets/test')
      const data: TestResult = await res.json()
      setTestResult(data)
      setTestStatus(data.success ? 'success' : 'error')
    } catch {
      setTestResult({ success: false, error: 'Network error — could not reach the server' })
      setTestStatus('error')
    }
  }

  const handleValidate = async () => {
    setValidateStatus('loading')
    setValidation(null)
    setImportResult(null)
    setImportStatus('idle')
    try {
      const res = await fetch('/api/sheets/validate')
      const data: ValidationResult = await res.json()
      setValidation(data)
      setValidateStatus(data.totalRows > 0 ? 'success' : 'error')
    } catch {
      setValidation({ valid: false, error: 'Network error', errors: [], warnings: [], totalRows: 0, validRows: 0 })
      setValidateStatus('error')
    }
  }

  const handleImport = async () => {
    setImportStatus('loading')
    setImportResult(null)
    try {
      const res = await fetch('/api/sheets/import', { method: 'POST' })
      const data: ImportResult = await res.json()
      setImportResult(data)
      setImportStatus(data.success ? 'success' : 'error')
    } catch {
      setImportResult({ success: false, imported: 0, skippedInvalid: 0, skippedDuplicate: 0, total: 0, error: 'Network error' })
      setImportStatus('error')
    }
  }

  const handleReset = () => {
    setTestStatus('idle'); setTestResult(null)
    setValidateStatus('idle'); setValidation(null)
    setImportStatus('idle'); setImportResult(null)
  }

  const canValidate = testStatus === 'success'
  // Allow import as long as at least one valid row exists — invalid rows will be skipped automatically
  const canImport = validateStatus === 'success' && (validation?.totalRows ?? 0) > 0

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Import Data</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Read conversations from Google Sheets and import them into the database
          </p>
        </div>
        {(testStatus !== 'idle' || validateStatus !== 'idle' || importStatus !== 'idle') && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono px-2.5 py-1 rounded"
            style={{ background: 'hsl(220, 18%, 10%)', border: '1px solid hsl(220, 18%, 15%)' }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      {/* Step 1 — Test Connection */}
      <div className="step-connector">
        <div
          className="rounded-lg p-5 space-y-4"
          style={{ background: 'hsl(222, 35%, 7%)', border: '1px solid hsl(220, 18%, 11%)' }}
        >
          <div className="flex items-start gap-4">
            <StepBadge status={testStatus} step={1} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Test Connection</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Verify the service account can access your Google Sheet
              </p>
            </div>
            <button
              onClick={handleTest}
              disabled={anyLoading}
              className="shrink-0 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 disabled:opacity-40"
              style={{
                background: testStatus === 'success' ? 'hsl(158, 64%, 48%, 0.1)' : 'hsl(220, 18%, 13%)',
                color: testStatus === 'success' ? 'hsl(158, 64%, 52%)' : 'hsl(210, 30%, 80%)',
                border: testStatus === 'success' ? '1px solid hsl(158, 64%, 48%, 0.25)' : '1px solid hsl(220, 18%, 18%)',
              }}
            >
              {testStatus === 'loading' ? 'Testing…' : testStatus === 'success' ? 'Re-test' : 'Test Connection'}
            </button>
          </div>

          {testResult && (
            <div
              className="rounded-md p-3.5 ml-13"
              style={{
                background: testResult.success ? 'hsl(158, 64%, 48%, 0.06)' : 'hsl(0, 78%, 58%, 0.06)',
                border: `1px solid ${testResult.success ? 'hsl(158, 64%, 48%, 0.15)' : 'hsl(0, 78%, 58%, 0.15)'}`,
              }}
            >
              {testResult.success ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(158, 64%, 48%)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'hsl(158, 64%, 55%)' }}>
                      Connection successful
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { label: 'Spreadsheet', value: testResult.sheetTitle },
                      { label: 'Sheet Tab', value: testResult.sheetName },
                      { label: 'Data Rows', value: testResult.rowCount?.toLocaleString() },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded px-2.5 py-2" style={{ background: 'hsl(158, 64%, 48%, 0.06)' }}>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
                        <p className="text-xs font-semibold text-foreground mt-0.5 truncate">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'hsl(0, 78%, 62%)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'hsl(0, 78%, 62%)' }}>Connection failed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{testResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 2 — Validate */}
      <div className="step-connector">
        <div
          className="rounded-lg p-5 space-y-4 transition-opacity duration-200"
          style={{
            background: 'hsl(222, 35%, 7%)',
            border: '1px solid hsl(220, 18%, 11%)',
            opacity: canValidate ? 1 : 0.55,
          }}
        >
          <div className="flex items-start gap-4">
            <StepBadge status={validateStatus} step={2} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Validate Data</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Check for missing required fields, invalid dates, and logical errors before importing
              </p>
            </div>
            <button
              onClick={handleValidate}
              disabled={!canValidate || anyLoading}
              className="shrink-0 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 disabled:opacity-40"
              style={{
                background: canValidate ? 'hsl(199, 85%, 50%, 0.1)' : 'hsl(220, 18%, 13%)',
                color: canValidate ? 'hsl(199, 85%, 60%)' : 'hsl(215, 12%, 50%)',
                border: canValidate ? '1px solid hsl(199, 85%, 50%, 0.25)' : '1px solid hsl(220, 18%, 18%)',
              }}
            >
              {validateStatus === 'loading' ? 'Validating…' : 'Validate Sheet'}
            </button>
          </div>

          {validation && (
            <div className="space-y-3 ml-13">
              {/* Summary stats */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Total', value: validation.totalRows, color: 'hsl(215, 12%, 60%)' },
                  { label: 'Valid', value: validation.validRows, color: 'hsl(158, 64%, 48%)' },
                  { label: 'Errors', value: validation.errors.length, color: validation.errors.length > 0 ? 'hsl(0, 78%, 62%)' : 'hsl(215, 12%, 50%)' },
                  { label: 'Warnings', value: validation.warnings.length, color: validation.warnings.length > 0 ? 'hsl(38, 90%, 58%)' : 'hsl(215, 12%, 50%)' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-md p-2.5 text-center" style={{ background: 'hsl(222, 40%, 5%)', border: '1px solid hsl(220, 18%, 10%)' }}>
                    <p className="font-data text-xl font-medium" style={{ color }}>{value}</p>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Overall status */}
              {validation.valid ? (
                <div
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-md"
                  style={{ background: 'hsl(158, 64%, 48%, 0.08)', border: '1px solid hsl(158, 64%, 48%, 0.2)' }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: 'hsl(158, 64%, 48%)' }} />
                  <span className="text-xs font-semibold" style={{ color: 'hsl(158, 64%, 55%)' }}>
                    All data is valid — ready to import {validation.validRows} conversation{validation.validRows !== 1 ? 's' : ''}
                  </span>
                </div>
              ) : validation.error ? (
                <div
                  className="flex items-start gap-2 px-3.5 py-2.5 rounded-md"
                  style={{ background: 'hsl(0, 78%, 58%, 0.06)', border: '1px solid hsl(0, 78%, 58%, 0.15)' }}
                >
                  <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'hsl(0, 78%, 62%)' }} />
                  <span className="text-xs" style={{ color: 'hsl(0, 78%, 62%)' }}>{validation.error}</span>
                </div>
              ) : validation.validRows > 0 ? (
                <div
                  className="flex items-start gap-2 px-3.5 py-2.5 rounded-md"
                  style={{ background: 'hsl(38, 90%, 54%, 0.08)', border: '1px solid hsl(38, 90%, 54%, 0.2)' }}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'hsl(38, 90%, 58%)' }} />
                  <span className="text-xs" style={{ color: 'hsl(38, 90%, 64%)' }}>
                    <span className="font-semibold">{validation.validRows} valid row{validation.validRows !== 1 ? 's' : ''} will be imported</span>
                    {' '}— {validation.errors.length} row{validation.errors.length !== 1 ? 's' : ''} with errors will be skipped automatically.
                  </span>
                </div>
              ) : null}

              {/* Errors */}
              {validation.errors.length > 0 && (
                <ErrorTable items={validation.errors} type="error" />
              )}

              {/* Warnings */}
              {validation.warnings.length > 0 && (
                <ErrorTable items={validation.warnings} type="warning" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 3 — Import */}
      <div>
        <div
          className="rounded-lg p-5 space-y-4 transition-opacity duration-200"
          style={{
            background: 'hsl(222, 35%, 7%)',
            border: '1px solid hsl(220, 18%, 11%)',
            opacity: canImport ? 1 : 0.5,
          }}
        >
          <div className="flex items-start gap-4">
            <StepBadge status={importStatus} step={3} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <ArrowDownToLine className="h-3.5 w-3.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Import Conversations</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Imports valid rows and skips any rows with errors. Duplicates are updated, not re-inserted.
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={!canImport || anyLoading}
              className="shrink-0 px-4 py-2 text-xs font-semibold rounded-md transition-all duration-150 disabled:opacity-40"
              style={{
                background: canImport
                  ? 'linear-gradient(135deg, hsl(158, 64%, 48%) 0%, hsl(158, 64%, 38%) 100%)'
                  : 'hsl(220, 18%, 13%)',
                color: canImport ? 'hsl(224, 50%, 4%)' : 'hsl(215, 12%, 50%)',
                border: canImport ? 'none' : '1px solid hsl(220, 18%, 18%)',
                boxShadow: canImport ? '0 0 16px hsl(158, 64%, 48%, 0.2)' : undefined,
              }}
            >
              {importStatus === 'loading'
                ? 'Importing…'
                : 'Import Now'
              }
            </button>
          </div>

          {importResult && (
            <div
              className="rounded-md p-4 ml-13"
              style={{
                background: importResult.success ? 'hsl(158, 64%, 48%, 0.06)' : 'hsl(0, 78%, 58%, 0.06)',
                border: `1px solid ${importResult.success ? 'hsl(158, 64%, 48%, 0.15)' : 'hsl(0, 78%, 58%, 0.15)'}`,
              }}
            >
              {importResult.success ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" style={{ color: 'hsl(158, 64%, 48%)' }} />
                    <span className="text-sm font-semibold" style={{ color: 'hsl(158, 64%, 55%)' }}>
                      Import complete
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Imported', value: importResult.imported, icon: BarChart2, color: 'hsl(158, 64%, 48%)' },
                      { label: 'Skipped (errors)', value: importResult.skippedInvalid, icon: XCircle, color: 'hsl(0, 78%, 62%)' },
                      { label: 'Skipped (dupes)', value: importResult.skippedDuplicate, icon: SkipForward, color: 'hsl(38, 90%, 54%)' },
                      { label: 'Total', value: importResult.total, icon: FileSpreadsheet, color: 'hsl(215, 12%, 65%)' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <div key={label} className="rounded px-3 py-2.5" style={{ background: 'hsl(158, 64%, 48%, 0.06)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon className="h-3 w-3" style={{ color }} />
                          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
                        </div>
                        <p className="font-data text-xl font-medium" style={{ color }}>{value.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI analysis will be queued automatically. View results on the{' '}
                    <a href="/dashboard" className="underline" style={{ color: 'hsl(158, 64%, 48%)' }}>Dashboard</a>{' '}
                    and{' '}
                    <a href="/audit" className="underline" style={{ color: 'hsl(158, 64%, 48%)' }}>Audit</a>{' '}
                    pages.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'hsl(0, 78%, 62%)' }} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'hsl(0, 78%, 62%)' }}>Import failed</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{importResult.error}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions panel */}
      <div
        className="rounded-lg p-5"
        style={{
          background: 'hsl(222, 40%, 5%)',
          border: '1px solid hsl(220, 18%, 9%)',
        }}
      >
        <h3
          className="text-[10px] font-mono uppercase tracking-widest mb-4"
          style={{ color: 'hsl(215, 12%, 50%)' }}
        >
          How to Prepare Your Data
        </h3>
        <ol className="space-y-2.5">
          {[
            'Export conversations from Freshchat dashboard (Reports → Conversations → Export CSV)',
            'Open your designated Google Sheet',
            'Go to File → Import → upload the CSV → Replace current sheet',
            'Verify column headers match the expected format (see table below)',
            'Return here and click Test Connection, then Validate, then Import',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold mt-0.5"
                style={{ background: 'hsl(220, 18%, 14%)', color: 'hsl(215, 12%, 55%)' }}
              >
                {i + 1}
              </span>
              <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>

        {/* Column reference */}
        <div className="mt-5">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">
            Expected Sheet Columns
          </p>
          <div
            className="rounded-md overflow-hidden text-[11px]"
            style={{ border: '1px solid hsl(220, 18%, 11%)' }}
          >
            <div
              className="grid grid-cols-[1.5fr_1fr_auto] gap-x-4 px-3 py-2 font-mono uppercase tracking-wider text-[9px]"
              style={{ background: 'hsl(220, 18%, 9%)', color: 'hsl(215, 12%, 50%)', borderBottom: '1px solid hsl(220, 18%, 11%)' }}
            >
              <span>Column Name</span>
              <span>Type</span>
              <span>Required</span>
            </div>
            {[
              ['conversation_id', 'string', true],
              ['customer_id', 'string', true],
              ['start_time', 'ISO 8601 timestamp', true],
              ['end_time', 'ISO 8601 timestamp', true],
              ['status', 'string (e.g. resolved)', true],
              ['agent_id', 'string', false],
              ['first_response_time', 'integer (seconds)', false],
              ['avg_handling_time', 'integer (seconds)', false],
              ['chatbot_handover', 'TRUE / FALSE', false],
              ['handover_reason', 'string', false],
              ['team_name', 'string', false],
            ].map(([col, type, req], i) => (
              <div
                key={col as string}
                className="grid grid-cols-[1.5fr_1fr_auto] gap-x-4 px-3 py-2 items-center"
                style={{
                  borderTop: i > 0 ? '1px solid hsl(220, 18%, 8%)' : undefined,
                }}
              >
                <span className="font-mono text-foreground/80">{col as string}</span>
                <span className="text-muted-foreground">{type as string}</span>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                  style={req
                    ? { background: 'hsl(0, 78%, 58%, 0.1)', color: 'hsl(0, 78%, 65%)', border: '1px solid hsl(0, 78%, 58%, 0.15)' }
                    : { background: 'hsl(220, 18%, 12%)', color: 'hsl(215, 12%, 50%)', border: '1px solid hsl(220, 18%, 16%)' }
                  }
                >
                  {req ? 'required' : 'optional'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
