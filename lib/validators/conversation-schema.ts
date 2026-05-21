import { ConversationRow } from '../google-sheets'

export interface ValidationError {
  row: number
  field: string
  error: string
  value: any
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  totalRows: number
  validRows: number
}

export function validateConversations(rows: ConversationRow[]): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []
  let validRows = 0

  rows.forEach((row, index) => {
    const rowNum = index + 2 // +2 for 1-based + header row
    let rowValid = true

    // Only truly skip rows with no conversation_id
    if (!row.conversation_id?.trim()) {
      errors.push({ row: rowNum, field: 'conversation_id', error: 'Missing — row will be skipped', value: row.conversation_id })
      rowValid = false
    }

    // Everything else is a warning — import proceeds with defaults
    if (!row.customer_id?.trim()) {
      warnings.push({ row: rowNum, field: 'customer_id', error: 'Missing — will use "unknown"', value: row.customer_id })
    }

    if (!row.status?.trim()) {
      warnings.push({ row: rowNum, field: 'status', error: 'Missing — will import anyway', value: row.status })
    }

    if (!row.start_time?.trim()) {
      warnings.push({ row: rowNum, field: 'start_time', error: 'Missing — will use current time', value: row.start_time })
    } else if (isNaN(Date.parse(row.start_time))) {
      warnings.push({ row: rowNum, field: 'start_time', error: 'Invalid date — will use current time', value: row.start_time })
    }

    if (!row.end_time?.trim()) {
      warnings.push({ row: rowNum, field: 'end_time', error: 'Missing — will use current time', value: row.end_time })
    } else if (isNaN(Date.parse(row.end_time))) {
      warnings.push({ row: rowNum, field: 'end_time', error: 'Invalid date — will use current time', value: row.end_time })
    }

    if (!row.agent_id) {
      warnings.push({ row: rowNum, field: 'agent_id', error: 'Optional field missing', value: row.agent_id })
    }
    if (!row.team_name) {
      warnings.push({ row: rowNum, field: 'team_name', error: 'Optional field missing', value: row.team_name })
    }

    if (rowValid) validRows++
  })

  return {
    valid: true, // Always true — validation is informational only
    errors,
    warnings,
    totalRows: rows.length,
    validRows,
  }
}
