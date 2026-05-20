import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FreshchatAPI, processConversation } from '@/lib/freshchat'

export async function POST(request: NextRequest) {
  const { fromDate, toDate } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: log } = await supabase
    .from('sync_logs')
    .insert({ date_start: fromDate, date_end: toDate, status: 'running' })
    .select()
    .single()

  try {
    const freshchat = new FreshchatAPI()
    const { conversations } = await freshchat.getConversations(fromDate, toDate)

    let processed = 0

    for (const conv of conversations || []) {
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
      total: conversations?.length || 0,
    })

  } catch (error) {
    await supabase
      .from('sync_logs')
      .update({ status: 'failed', error_message: String(error) })
      .eq('id', log.id)

    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
