import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { FreshchatAPI, processConversation } from '@/lib/freshchat'
import crypto from 'crypto'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  return hash === signature
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const body = await request.text()
    const signature = request.headers.get('x-freshchat-signature') || ''

    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'webhook_secret')
      .single()

    const webhookSecret = settings?.value || ''

    if (webhookSecret && signature) {
      const isValid = verifySignature(body, signature, webhookSecret)
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const event = JSON.parse(body)

    await supabase.from('webhook_logs').insert({
      event_type: event.event_type || event.type,
      payload: event,
      processed: false,
    })

    switch (event.event_type || event.type) {
      case 'message.created':
      case 'conversation.created':
      case 'conversation.updated':
        await handleConversationEvent(event, supabase)
        break

      case 'conversation.resolved':
        await handleConversationResolved(event, supabase)
        break

      default:
        console.log('Unhandled event type:', event.event_type)
    }

    await supabase
      .from('webhook_logs')
      .update({ processed: true })
      .eq('payload->conversation_id', event.data?.conversation_id)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)

    await supabase.from('webhook_logs').insert({
      event_type: 'error',
      payload: { error: String(error) },
      processed: false,
      error_message: String(error),
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleConversationEvent(event: any, supabase: any) {
  const conversationId = event.data?.conversation_id
  if (!conversationId) return

  const freshchat = new FreshchatAPI()
  const conversation = await freshchat.getConversation(conversationId)
  const dbConvId = await processConversation(conversation, supabase)

  if (event.event_type === 'conversation.created') {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId: dbConvId }),
    })
  }
}

async function handleConversationResolved(event: any, supabase: any) {
  const conversationId = event.data?.conversation_id
  await supabase
    .from('conversations')
    .update({ status: 'resolved' })
    .eq('freshchat_id', conversationId)
}
