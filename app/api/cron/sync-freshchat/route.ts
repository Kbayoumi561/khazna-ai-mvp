import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FreshchatAPI, processConversation } from '@/lib/freshchat'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data: autoSyncSetting } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'auto_sync_enabled')
      .single()

    if (autoSyncSetting?.value === false) {
      return NextResponse.json({ message: 'Auto-sync disabled' })
    }

    const { data: lastSyncData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'last_sync_timestamp')
      .single()

    const lastSync = lastSyncData?.value || new Date(Date.now() - 3600000).toISOString()

    const freshchat = new FreshchatAPI()
    const { conversations } = await freshchat.getConversationsSince(lastSync)

    let processed = 0

    for (const conv of conversations || []) {
      try {
        await processConversation(conv, supabase)
        processed++
      } catch (error) {
        console.error(`Failed to process conversation ${conv.conversation_id}:`, error)
      }
    }

    await supabase
      .from('settings')
      .update({ value: new Date().toISOString() })
      .eq('key', 'last_sync_timestamp')

    return NextResponse.json({
      success: true,
      processed,
      total: conversations?.length || 0,
    })

  } catch (error) {
    console.error('Polling sync error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
