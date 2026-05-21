import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']

export interface ConversationRow {
  conversation_id: string
  customer_id: string
  agent_id?: string
  start_time: string
  end_time: string
  first_response_time?: number
  avg_handling_time?: number
  status: string
  team_name?: string
}

function getJWT() {
  const email = process.env.GOOGLE_SHEETS_CLIENT_EMAIL
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY

  if (!email || !key) {
    throw new Error('Missing Google Sheets credentials. Set GOOGLE_SHEETS_CLIENT_EMAIL and GOOGLE_SHEETS_PRIVATE_KEY environment variables.')
  }

  return new JWT({
    email,
    key: key.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  })
}

async function getGoogleSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID
  if (!sheetId) {
    throw new Error('Missing GOOGLE_SHEET_ID environment variable.')
  }

  const doc = new GoogleSpreadsheet(sheetId, getJWT())
  await doc.loadInfo()
  return doc
}

// Parses durations like "0:02:30", "1:30:00", or plain seconds "150"
function parseDurationToSeconds(val: string | undefined): number | null {
  if (!val || val.trim() === '' || val.trim() === '-') return null
  const trimmed = val.trim()
  // HH:MM:SS or MM:SS
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').map(Number)
    if (parts.some(isNaN)) return null
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
  }
  const num = Number(trimmed)
  return isNaN(num) ? null : Math.round(num)
}

// Combines separate Date and Time columns into an ISO string
function combineDateTime(date: string | undefined, time: string | undefined): string {
  if (!date || date.trim() === '') return new Date().toISOString()
  const combined = time ? `${date.trim()} ${time.trim()}` : date.trim()
  const parsed = new Date(combined)
  return isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString()
}

export async function readConversations(): Promise<ConversationRow[]> {
  const doc = await getGoogleSheet()

  const sheetName = process.env.CONVERSATIONS_SHEET_NAME
  const sheet = sheetName ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0]

  if (!sheet) {
    throw new Error(`Sheet "${sheetName ?? 'first sheet'}" not found in the spreadsheet.`)
  }

  const rows = await sheet.getRows()

  return rows.map((row) => ({
    // Actual Freshchat export column names
    conversation_id: row.get('conversation_id') || '',
    customer_id:     row.get('User Number') || '',
    agent_id:        row.get('First Assigned To') || undefined,
    start_time:      combineDateTime(row.get('Date'), row.get('Time')),
    end_time:        combineDateTime(row.get('Date'), row.get('Time')), // no end column in export
    first_response_time: parseDurationToSeconds(row.get('FRT')) ?? undefined,
    avg_handling_time:   parseDurationToSeconds(row.get('AHT')) ?? undefined,
    status:          row.get('Resolved By') ? 'resolved' : 'open',
    team_name:       row.get('Assigned Group') || undefined,
  }))
}

export async function testConnection(): Promise<{
  success: boolean
  sheetTitle?: string
  sheetName?: string
  rowCount?: number
  error?: string
}> {
  try {
    const doc = await getGoogleSheet()
    const sheetName = process.env.CONVERSATIONS_SHEET_NAME
    const sheet = sheetName ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0]

    if (!sheet) {
      return {
        success: false,
        error: `Sheet "${sheetName ?? 'first sheet'}" not found`,
      }
    }

    const rows = await sheet.getRows()

    return {
      success: true,
      sheetTitle: doc.title,
      sheetName: sheet.title,
      rowCount: rows.length,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
