import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readConversations } from '@/lib/google-sheets'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const importStart = new Date()

    // Read from Google Sheets
    const rows = await readConversations()

    // Only skip rows with no conversation_id — everything else imports with defaults
    const conversationsToInsert = rows
      .filter((row) => row.conversation_id?.trim())
      .map((row) => ({
        freshchat_conversation_id: row.conversation_id,
        customer_id: row.customer_id || 'unknown',
        agent_id: row.agent_id || null,
        conversation_start: row.start_time && !isNaN(Date.parse(row.start_time)) ? new Date(row.start_time) : new Date(),
        conversation_end: row.end_time && !isNaN(Date.parse(row.end_time)) ? new Date(row.end_time) : new Date(),
        frt: row.first_response_time ?? null,
        aht: row.avg_handling_time ?? null,
        chatbot_handover: row.chatbot_handover ?? false,
        handover_reason: row.handover_reason || null,
        status: row.status || null,
        team_name: row.team_name || null,
      }))

    // Upsert — duplicates are updated, not duplicated
    const { data: inserted, error: insertError } = await supabase
      .from('conversations')
      .upsert(conversationsToInsert, {
        onConflict: 'freshchat_conversation_id',
        ignoreDuplicates: false,
      })
      .select('id')

    if (insertError) {
      throw new Error(insertError.message)
    }

    const importedCount = inserted?.length ?? 0
    const skippedCount = rows.length - conversationsToInsert.length

    // Log import
    await supabase.from('sync_logs').insert({
      sync_start: importStart,
      sync_end: new Date(),
      sync_status: 'completed',
      total_conversations: rows.length,
      failed_conversations: 0,
    })

    return NextResponse.json({
      success: true,
      imported: importedCount,
      skipped: skippedCount,
      total: rows.length,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      },
      { status: 500 }
    )
  }
}
