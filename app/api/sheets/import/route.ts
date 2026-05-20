import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readConversations } from '@/lib/google-sheets'
import { validateConversations } from '@/lib/validators/conversation-schema'

export async function POST() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const importStart = new Date()

    // Read from Google Sheets
    const rows = await readConversations()

    // Validate
    const validation = validateConversations(rows)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed — fix errors before importing', validation },
        { status: 400 }
      )
    }

    // Transform to DB format
    const conversationsToInsert = rows.map((row) => ({
      freshchat_conversation_id: row.conversation_id,
      customer_id: row.customer_id,
      agent_id: row.agent_id || null,
      conversation_start: new Date(row.start_time),
      conversation_end: new Date(row.end_time),
      frt: row.first_response_time ?? null,
      aht: row.avg_handling_time ?? null,
      chatbot_handover: row.chatbot_handover ?? false,
      handover_reason: row.handover_reason || null,
      status: row.status,
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
    const skippedCount = rows.length - importedCount

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
