import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { analyzeConversation } from '@/lib/openai'

export async function POST(request: NextRequest) {
  const { conversationId } = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('sent_at')

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'No messages found' }, { status: 404 })
  }

  const analysis = await analyzeConversation(messages)

  await supabase.from('ai_analysis').insert({
    conversation_id: conversationId,
    customer_intent: analysis.customer_intent,
    quality_score: analysis.quality_score,
    kb_compliance_score: analysis.kb_compliance_score,
    root_cause: analysis.root_cause,
    analysis_data: analysis,
  })

  return NextResponse.json({ success: true, analysis })
}
