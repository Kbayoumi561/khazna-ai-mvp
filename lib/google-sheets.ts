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
  chatbot_handover?: boolean
  handover_reason?: string
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

export async function readConversations(): Promise<ConversationRow[]> {
  const doc = await getGoogleSheet()

  const sheetName = process.env.CONVERSATIONS_SHEET_NAME
  const sheet = sheetName ? doc.sheetsByTitle[sheetName] : doc.sheetsByIndex[0]

  if (!sheet) {
    throw new Error(`Sheet "${sheetName ?? 'first sheet'}" not found in the spreadsheet.`)
  }

  const rows = await sheet.getRows()

  return rows.map((row) => ({
    conversation_id: row.get('conversation_id') || '',
    customer_id: row.get('customer_id') || '',
    agent_id: row.get('agent_id') || undefined,
    start_time: row.get('start_time') || '',
    end_time: row.get('end_time') || '',
    first_response_time: row.get('first_response_time')
      ? parseInt(row.get('first_response_time'), 10)
      : undefined,
    avg_handling_time: row.get('avg_handling_time')
      ? parseInt(row.get('avg_handling_time'), 10)
      : undefined,
    chatbot_handover: row.get('chatbot_handover')?.toUpperCase() === 'TRUE',
    handover_reason: row.get('handover_reason') || undefined,
    status: row.get('status') || '',
    team_name: row.get('team_name') || undefined,
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
