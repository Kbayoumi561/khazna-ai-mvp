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
  const warnings: ValidationError[] = []

  rows.forEach((row, index) => {
    const rowNum = index + 2

    if (!row.conversation_id?.trim()) {
      warnings.push({ row: rowNum, field: 'conversation_id', error: 'Field is empty', value: row.conversation_id })
    }
    if (!row.customer_id?.trim()) {
      warnings.push({ row: rowNum, field: 'customer_id', error: 'Field is empty', value: row.customer_id })
    }
    if (!row.status?.trim()) {
      warnings.push({ row: rowNum, field: 'status', error: 'Field is empty', value: row.status })
    }
    if (row.start_time && isNaN(Date.parse(row.start_time))) {
      warnings.push({ row: rowNum, field: 'start_time', error: 'Invalid date format', value: row.start_time })
    }
    if (row.end_time && isNaN(Date.parse(row.end_time))) {
      warnings.push({ row: rowNum, field: 'end_time', error: 'Invalid date format', value: row.end_time })
    }
  })

  return {
    valid: true,
    errors: [],
    warnings,
    totalRows: rows.length,
    validRows: rows.length,
  }
}
