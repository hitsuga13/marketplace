// Purpose: Use GPT-5.6 Luna to pre-screen payment receipt images before seller confirmation.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_RECEIPT_API_KEY') || Deno.env.get('OPENAI_API_KEY')
const OPENAI_MODEL = Deno.env.get('OPENAI_RECEIPT_MODEL') || 'gpt-5.6-luna'

type ReceiptStatus = 'verified' | 'suspicious' | 'rejected'

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

const parseResult = (payload: Record<string, unknown>) => {
  const outputText = getOutputText(payload)
  if (!outputText) throw new Error('OpenAI response did not include receipt verification text.')

  const parsed = JSON.parse(outputText)
  const status: ReceiptStatus = ['verified', 'suspicious', 'rejected'].includes(
    parsed.receiptVerificationStatus,
  )
    ? parsed.receiptVerificationStatus
    : 'suspicious'

  return {
    receiptVerificationStatus: status,
    receiptVerificationDecision: String(
      parsed.receiptVerificationDecision ||
        (status === 'verified' ? 'ai_precheck_passed' : 'manual_review_required'),
    ),
    receiptVerificationConfidence: Math.max(
      0,
      Math.min(1, Number(parsed.receiptVerificationConfidence || 0)),
    ),
    receiptVerificationReason: String(
      parsed.receiptVerificationReason || 'Receipt pre-screening completed.',
    ),
    receiptVerificationCategories: Array.isArray(parsed.receiptVerificationCategories)
      ? parsed.receiptVerificationCategories.map(String)
      : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405)
  if (!OPENAI_API_KEY) return jsonResponse({ error: 'Receipt OpenAI key is not configured.' }, 500)

  try {
    const {
      image,
      fileName,
      productName,
      sellerName,
      expectedAmount,
      paymentReference,
      paymentMethod,
    } = await req.json()

    if (!image || !productName || !sellerName || !expectedAmount || !paymentReference) {
      return jsonResponse({ error: 'Receipt image and order payment details are required.' }, 400)
    }

    if (!String(image).startsWith('data:image/')) {
      return jsonResponse({
        receiptVerificationStatus: 'rejected',
        receiptVerificationDecision: 'invalid_file_type',
        receiptVerificationConfidence: 1,
        receiptVerificationReason: 'AI verification requires an image of the payment receipt.',
        receiptVerificationCategories: ['Not an image receipt'],
      })
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
        max_output_tokens: 450,
        input: [
          {
            role: 'system',
            content:
              'You pre-screen Malaysian bank and e-wallet payment receipt images for a university marketplace. You do not claim that funds were received; only assess image plausibility and consistency with supplied order details.',
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  'Inspect the attached receipt image.',
                  `File: ${fileName || '-'}`,
                  `Product: ${productName}`,
                  `Expected seller: ${sellerName}`,
                  `Expected amount: RM ${Number(expectedAmount).toFixed(2)}`,
                  `Expected payment reference: ${paymentReference}`,
                  `Payment method: ${paymentMethod || '-'}`,
                  'Check whether it looks like a genuine payment receipt, whether visible amount/reference/recipient are consistent, and whether there are obvious signs of an unrelated, blank, duplicate-looking, edited, or fabricated image.',
                  'Use verified only when it is clearly a plausible matching receipt. Use suspicious when important fields are unreadable or uncertain. Use rejected when it is clearly not a receipt or clearly conflicts with the supplied payment.',
                  'Return only valid JSON with keys: receiptVerificationStatus, receiptVerificationDecision, receiptVerificationConfidence, receiptVerificationReason, receiptVerificationCategories.',
                  'receiptVerificationStatus must be verified, suspicious, or rejected.',
                ].join('\n'),
              },
              { type: 'input_image', image_url: image },
            ],
          },
        ],
      }),
    })

    const payload = await response.json()
    if (!response.ok) {
      return jsonResponse(
        { error: payload?.error?.message || 'OpenAI receipt verification request failed.' },
        response.status,
      )
    }

    return jsonResponse(parseResult(payload))
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Unable to verify receipt.' },
      500,
    )
  }
})
