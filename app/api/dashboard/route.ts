import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: conversations } = await supabase
    .from('conversations')
    .select('frt_seconds')

  const { data: analyses } = await supabase
    .from('ai_analysis')
    .select('quality_score, kb_compliance_score')

  const totalConversations = conversations?.length || 0
  const avgFRT = totalConversations > 0
    ? (conversations?.reduce((sum, c) => sum + (c.frt_seconds || 0), 0) ?? 0) / totalConversations
    : 0
  const avgQuality = analyses && analyses.length > 0
    ? analyses.reduce((sum, a) => sum + (a.quality_score || 0), 0) / analyses.length
    : 0
  const avgCompliance = analyses && analyses.length > 0
    ? analyses.reduce((sum, a) => sum + (a.kb_compliance_score || 0), 0) / analyses.length
    : 0

  return NextResponse.json({
    totalConversations,
    avgFRT,
    avgQuality,
    avgCompliance,
  })
}
