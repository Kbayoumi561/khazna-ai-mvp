import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.FRESHCHAT_API_URL
  const apiKey = process.env.FRESHCHAT_API_KEY

  if (!apiUrl || !apiKey) {
    return NextResponse.json({
      ok: false,
      error: 'Missing env vars',
      FRESHCHAT_API_URL: apiUrl ? 'set' : 'MISSING',
      FRESHCHAT_API_KEY: apiKey ? 'set' : 'MISSING',
    })
  }

  try {
    const testUrl = `${apiUrl}/conversations?items_per_page=1`
    const response = await fetch(testUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    const text = await response.text()
    let body: any
    try { body = JSON.parse(text) } catch { body = text }

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      urlUsed: testUrl,
      responseBody: body,
    })
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      FRESHCHAT_API_URL: apiUrl,
    })
  }
}
