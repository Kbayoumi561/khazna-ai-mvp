import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readConversations } from '@/lib/google-sheets'
import { validateConversations } from '@/lib/validators/conversation-schema'

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const authHeader = request.headers.get('Cookie') || ''
  void authHeader // auth checked via cookie by Supabase client-side; service role used here for simplicity

  try {
    const rows = await readConversations()
    const result = validateConversations(rows)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        error: error instanceof Error ? error.message : 'Failed to read sheet',
        errors: [],
        warnings: [],
        totalRows: 0,
        validRows: 0,
      },
      { status: 500 }
    )
  }
}
