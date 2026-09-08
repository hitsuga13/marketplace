// Purpose: Verify payment receipt images with the server-side OpenAI Edge Function.
import { supabase, isSupabaseConfigured } from 'src/supabase/client'

export const receiptVerificationStatuses = {
  verified: 'verified',
  suspicious: 'suspicious',
  rejected: 'rejected',
  unavailable: 'unavailable',
}

const unavailableResult = (reason) => ({
  receiptVerificationStatus: receiptVerificationStatuses.unavailable,
  receiptVerificationDecision: 'manual_review_required',
  receiptVerificationConfidence: null,
  receiptVerificationReason: reason,
  receiptVerificationCategories: ['AI unavailable'],
  receiptVerificationCheckedAt: new Date().toISOString(),
})

const normalizeResult = (data = {}) => {
  const allowedStatuses = Object.values(receiptVerificationStatuses)
  const status = allowedStatuses.includes(data.receiptVerificationStatus)
    ? data.receiptVerificationStatus
    : receiptVerificationStatuses.suspicious

  return {
    receiptVerificationStatus: status,
    receiptVerificationDecision: String(data.receiptVerificationDecision || 'manual_review_required'),
    receiptVerificationConfidence:
      data.receiptVerificationConfidence === null || data.receiptVerificationConfidence === undefined
        ? null
        : Math.max(0, Math.min(1, Number(data.receiptVerificationConfidence))),
    receiptVerificationReason: String(
      data.receiptVerificationReason || 'Receipt requires manual seller review.',
    ),
    receiptVerificationCategories: Array.isArray(data.receiptVerificationCategories)
      ? data.receiptVerificationCategories.map(String)
      : [],
    receiptVerificationCheckedAt: new Date().toISOString(),
  }
}

export const verifyReceiptWithAI = async (receipt) => {
  if (!isSupabaseConfigured || !supabase) {
    return unavailableResult('AI receipt verification is unavailable. Seller must review manually.')
  }

  try {
    const { data, error } = await supabase.functions.invoke('verify-receipt', {
      body: {
        image: receipt.image,
        fileName: receipt.fileName,
        productName: receipt.productName,
        sellerName: receipt.sellerName,
        expectedAmount: Number(receipt.expectedAmount || 0),
        paymentReference: receipt.paymentReference,
        paymentMethod: receipt.paymentMethod,
      },
    })

    if (error) throw error
    return normalizeResult(data)
  } catch (error) {
    console.warn('AI receipt verification unavailable', error)
    return unavailableResult('AI check failed. Receipt has been retained for manual seller review.')
  }
}

export const getReceiptVerificationLabel = (status) => {
  if (status === receiptVerificationStatuses.verified) return 'AI Verified'
  if (status === receiptVerificationStatuses.rejected) return 'AI Rejected'
  if (status === receiptVerificationStatuses.suspicious) return 'AI Needs Review'
  return 'Manual Review'
}

export const getReceiptVerificationColor = (status) => {
  if (status === receiptVerificationStatuses.verified) return 'positive'
  if (status === receiptVerificationStatuses.rejected) return 'negative'
  if (status === receiptVerificationStatuses.suspicious) return 'warning'
  return 'grey-7'
}
