import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: analyses } = await supabase
    .from('ai_analysis')
    .select('*, conversations(customer_name, conversation_date)')
    .not('id', 'in', `(SELECT analysis_id FROM audits)`)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ analyses: analyses || [] })
}
