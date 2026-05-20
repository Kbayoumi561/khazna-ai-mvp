import OpenAI from 'openai'

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function analyzeConversation(messages: any[]) {
  const prompt = `
Analyze this customer support conversation and return JSON:

${messages.map((m) => `${m.sender_type}: ${m.content}`).join('\n')}

Return JSON with:
{
  "customer_intent": "string",
  "quality_score": 0.85,
  "kb_compliance_score": 0.90,
  "root_cause": "string"
}
`

  const response = await getClient().chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}
