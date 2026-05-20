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

    // Required fields
    if (!row.conversation_id?.trim()) {
      errors.push({ row: rowNum, field: 'conversation_id', error: 'Required field is missing', value: row.conversation_id })
      rowValid = false
    }

    if (!row.customer_id?.trim()) {
      errors.push({ row: rowNum, field: 'customer_id', error: 'Required field is missing', value: row.customer_id })
      rowValid = false
    }

    if (!row.status?.trim()) {
      errors.push({ row: rowNum, field: 'status', error: 'Required field is missing', value: row.status })
      rowValid = false
    }

    if (!row.start_time?.trim()) {
      errors.push({ row: rowNum, field: 'start_time', error: 'Required field is missing', value: row.start_time })
      rowValid = false
    } else if (isNaN(Date.parse(row.start_time))) {
      errors.push({ row: rowNum, field: 'start_time', error: 'Invalid date format — use ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)', value: row.start_time })
      rowValid = false
    }

    if (!row.end_time?.trim()) {
      errors.push({ row: rowNum, field: 'end_time', error: 'Required field is missing', value: row.end_time })
      rowValid = false
    } else if (isNaN(Date.parse(row.end_time))) {
      errors.push({ row: rowNum, field: 'end_time', error: 'Invalid date format — use ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)', value: row.end_time })
      rowValid = false
    }

    // Logical check: end must be after start
    if (row.start_time && row.end_time && !isNaN(Date.parse(row.start_time)) && !isNaN(Date.parse(row.end_time))) {
      if (new Date(row.end_time) < new Date(row.start_time)) {
        errors.push({
          row: rowNum,
          field: 'end_time',
          error: 'End time is before start time',
          value: `${row.start_time} → ${row.end_time}`,
        })
        rowValid = false
      }
    }

    // Optional field warnings
    if (!row.agent_id) {
      warnings.push({ row: rowNum, field: 'agent_id', error: 'Optional field missing', value: row.agent_id })
    }
    if (!row.team_name) {
      warnings.push({ row: rowNum, field: 'team_name', error: 'Optional field missing', value: row.team_name })
    }

    if (rowValid) validRows++
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalRows: rows.length,
    validRows,
  }
}
