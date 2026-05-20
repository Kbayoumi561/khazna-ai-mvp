import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FreshchatAPI, processConversation } from '@/lib/freshchat'

export async function POST(request: NextRequest) {
  const { fromDate, toDate } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: log, error: logError } = await supabase
    .from('sync_logs')
    .insert({ date_start: fromDate, date_end: toDate, status: 'running' })
    .select()
    .single()

  if (logError) {
    console.error('sync_logs insert failed:', logError)
    return NextResponse.json({ error: `DB error: ${logError.message}` }, { status: 500 })
  }

  try {
    const freshchat = new FreshchatAPI()
    console.log(`Fetching Freshchat conversations from ${fromDate} to ${toDate}`)
    const result = await freshchat.getConversations(fromDate, toDate)
    const conversations = result?.conversations ?? result ?? []
    console.log(`Freshchat returned ${conversations.length} conversations`)

    let processed = 0

    for (const conv of conversations) {
      try {
        await processConversation(conv, supabase)
        processed++
      } catch (error) {
        console.error(`Failed to process ${conv.conversation_id}:`, error)
      }
    }

    await supabase
      .from('sync_logs')
      .update({ status: 'completed', total_synced: processed })
      .eq('id', log.id)

    return NextResponse.json({
      success: true,
      count: processed,
      total: conversations.length,
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Sync failed:', message)

    await supabase
      .from('sync_logs')
      .update({ status: 'failed', error_message: message })
      .eq('id', log.id)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
