import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  for (const [key, value] of Object.entries(body)) {
    await supabase
      .from('settings')
      .update({ value: value as any })
      .eq('key', key)
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: settings } = await supabase.from('settings').select('*')

  const result: Record<string, any> = {}
  for (const s of settings || []) {
    result[s.key] = s.value
  }

  return NextResponse.json(result)
}
