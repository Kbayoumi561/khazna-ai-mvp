export class FreshchatAPI {
  private baseUrl: string
  private apiKey: string

  constructor() {
    this.baseUrl = process.env.FRESHCHAT_API_URL!
    this.apiKey = process.env.FRESHCHAT_API_KEY!
  }

  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`Freshchat API error: ${response.statusText}`)
    }

    return response.json()
  }

  async getConversations(fromDate: string, toDate: string) {
    return this.request(
      `/conversations?from_date=${fromDate}&to_date=${toDate}&items_per_page=100`
    )
  }

  async getConversationsSince(timestamp: string) {
    return this.request(
      `/conversations?updated_since=${timestamp}&items_per_page=100`
    )
  }

  async getConversation(conversationId: string) {
    return this.request(`/conversations/${conversationId}`)
  }

  async getMessages(conversationId: string) {
    return this.request(`/conversations/${conversationId}/messages`)
  }
}

export async function processConversation(conv: any, supabase: any): Promise<string> {
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .upsert({
      freshchat_id: conv.conversation_id,
      agent_id: conv.assigned_agent_id,
      customer_name: conv.user?.name || 'Unknown',
      conversation_date: conv.created_time,
      status: conv.status,
      frt_seconds: calculateFRT(conv),
      aht_seconds: calculateAHT(conv),
    }, { onConflict: 'freshchat_id' })
    .select()
    .single()

  if (convError) throw convError

  const freshchat = new FreshchatAPI()
  const { messages } = await freshchat.getMessages(conv.conversation_id)

  for (const msg of messages || []) {
    await supabase.from('messages').upsert({
      conversation_id: conversation.id,
      sender_type: msg.actor_type === 'user' ? 'customer' : 'agent',
      content: msg.message_parts?.[0]?.text?.content || '',
      sent_at: msg.created_time,
    }, { onConflict: 'id', ignoreDuplicates: true })
  }

  return conversation.id
}

function calculateFRT(conv: any): number | null {
  const messages = conv.messages || []
  const firstCustomer = messages.find((m: any) => m.actor_type === 'user')
  const firstAgent = messages.find((m: any) => m.actor_type === 'agent')

  if (!firstCustomer || !firstAgent) return null

  const diff = new Date(firstAgent.created_time).getTime() -
               new Date(firstCustomer.created_time).getTime()
  return Math.floor(diff / 1000)
}

function calculateAHT(conv: any): number | null {
  if (!conv.created_time || !conv.updated_time) return null

  const diff = new Date(conv.updated_time).getTime() -
               new Date(conv.created_time).getTime()
  return Math.floor(diff / 1000)
}
