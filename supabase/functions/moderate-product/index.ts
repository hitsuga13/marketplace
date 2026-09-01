// Purpose: Supabase Edge Function that uses GPT-5.6 Luna to moderate product text and image.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const OPENAI_MODEL = Deno.env.get('OPENAI_MODERATION_MODEL') || 'gpt-5.6-luna'

type ModerationStatus = 'approved' | 'rejected'

type ModerationResult = {
  moderationStatus: ModerationStatus
  moderationDecision: string
  moderationConfidence: number
  moderationReason: string
  moderationCategories: string[]
}

const prohibitedCategories = [
  'Nicotine / vape',
  'Cigarettes / tobacco',
  'Alcohol',
  'Drugs',
  'Weapons',
  'Offensive or explicit content',
  'Fraudulent or unsafe service',
]

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

const getOutputText = (payload: Record<string, unknown>) => {
  if (typeof payload.output_text === 'string') return payload.output_text

  const output = Array.isArray(payload.output) ? payload.output : []
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : []
    for (const part of content) {
      if (typeof part?.text === 'string') return part.text
    }
  }

  return ''
}

const parseModeration = (payload: Record<string, unknown>): ModerationResult => {
  const outputText = getOutputText(payload)
  if (!outputText) throw new Error('OpenAI response did not include moderation text.')

  const parsed = JSON.parse(outputText)
  const status = ['approved', 'rejected'].includes(parsed.moderationStatus)
    ? parsed.moderationStatus
    : 'rejected'

  return {
    moderationStatus: status,
    moderationDecision: String(parsed.moderationDecision || status),
    moderationConfidence: Math.max(0, Math.min(1, Number(parsed.moderationConfidence || 0))),
    moderationReason: String(parsed.moderationReason || 'AI moderation completed.'),
    moderationCategories: Array.isArray(parsed.moderationCategories)
      ? parsed.moderationCategories.map(String)
      : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)

  if (!OPENAI_API_KEY) {
    return jsonResponse({ error: 'OPENAI_API_KEY is not configured.' }, 500)
  }

  try {
    const { name, category, description, image } = await req.json()
    if (!name || !description || !image) {
      return jsonResponse({ error: 'Product name, description, and image are required.' }, 400)
    }

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        reasoning: { effort: 'low' },
        max_output_tokens: 350,
        input: [
          {
            role: 'system',
            content:
              'You are a strict marketplace product safety moderator for a Malaysian university campus marketplace. Classify whether the submitted product is allowed.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'Review this product using the image, title, category, and description.',
                  `Title: ${name}`,
                  `Category: ${category || '-'}`,
                  `Description: ${description}`,
                  `Prohibited categories: ${prohibitedCategories.join(', ')}`,
                  'Return only valid JSON with keys: moderationStatus, moderationDecision, moderationConfidence, moderationReason, moderationCategories.',
                  'moderationStatus must be approved or rejected only.',
                  'Do not use pending_review. If uncertain, choose rejected and explain why admin should check the rejection.',
                ].join('\n'),
              },
              {
                type: 'input_image',
                image_url: image,
              },
            ],
          },
        ],
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      return jsonResponse(
        {
          error: payload?.error?.message || 'OpenAI moderation request failed.',
        },
        response.status,
      )
    }

    return jsonResponse(parseModeration(payload))
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unable to moderate product.',
      },
      500,
    )
  }
})
