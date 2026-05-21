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

    const rows = await readConversations()

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'No data found in sheet' }, { status: 400 })
    }

    // Map sheet rows to actual DB column names
    const conversationsToInsert = rows
      .filter((row) => row.conversation_id?.trim())
      .map((row) => ({
        freshchat_id: row.conversation_id,
        customer_name: row.customer_id || null,
        agent_id: null, // sheet has string IDs; FK requires UUID — skip for now
        team_id: null,  // sheet has team name; FK requires UUID — skip for now
        conversation_date:
          row.start_time && !isNaN(Date.parse(row.start_time))
            ? new Date(row.start_time)
            : new Date(),
        frt_seconds: row.first_response_time != null ? Math.round(Number(row.first_response_time)) : null,
        aht_seconds: row.avg_handling_time != null ? Math.round(Number(row.avg_handling_time)) : null,
        status: row.status || null,
      }))

    const skippedCount = rows.length - conversationsToInsert.length

    const { data: inserted, error: insertError } = await supabase
      .from('conversations')
      .upsert(conversationsToInsert, {
        onConflict: 'freshchat_id',
        ignoreDuplicates: false,
      })
      .select('id')

    if (insertError) {
      throw new Error(insertError.message)
    }

    const importedCount = inserted?.length ?? 0

    // Log import using actual sync_logs columns
    await supabase.from('sync_logs').insert({
      date_start: importStart.toISOString().split('T')[0],
      date_end: new Date().toISOString().split('T')[0],
      status: 'completed',
      total_synced: importedCount,
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
