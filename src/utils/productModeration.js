// Purpose: Product moderation helpers for OpenAI Vision and local fallback checks.
import { isSupabaseConfigured, supabase } from 'src/supabase/client'

const prohibitedRules = [
  {
    category: 'Nicotine / vape',
    severity: 'illegal',
    terms: ['vape', 'pod', 'pods', 'e-cigarette', 'ecigarette', 'rokok', 'cigarette', 'tobacco'],
  },
  {
    category: 'Alcohol',
    severity: 'illegal',
    terms: ['alcohol', 'arak', 'beer', 'wine', 'liquor', 'whisky', 'vodka', 'rum'],
  },
  {
    category: 'Drugs',
    severity: 'illegal',
    terms: ['drug', 'drugs', 'ganja', 'weed', 'marijuana', 'cannabis', 'pil kuda', 'ketum'],
  },
  {
    category: 'Weapons',
    severity: 'illegal',
    terms: ['weapon', 'knife', 'pisau', 'gun', 'pistol', 'taser', 'pepper spray'],
  },
  {
    category: 'Offensive content',
    severity: 'review',
    terms: ['lucah', 'porn', 'sex', 'explicit', 'offensive'],
  },
]

const normalizeText = (value) => String(value || '').toLowerCase()

export const moderationStatuses = {
  approved: 'approved',
  rejected: 'rejected',
}

export const getModerationStatusLabel = (status) => {
  if (status === moderationStatuses.approved) return 'Approved'
  if (status === moderationStatuses.rejected) return 'Rejected'
  return 'Rejected'
}

export const getModerationStatusColor = (status) => {
  if (status === moderationStatuses.approved) return 'positive'
  if (status === moderationStatuses.rejected) return 'negative'
  return 'negative'
}

const normalizeAiDecision = (decision) => {
  if (decision === moderationStatuses.approved || decision === 'legal') {
    return moderationStatuses.approved
  }
  if (decision === moderationStatuses.rejected || decision === 'illegal') {
    return moderationStatuses.rejected
  }
  return moderationStatuses.rejected
}

const normalizeAiResult = (result) => {
  const status = normalizeAiDecision(result?.moderationStatus || result?.decision)
  return {
    moderationStatus: status,
    moderationDecision: result?.moderationDecision || result?.decision || status,
    moderationConfidence:
      result?.moderationConfidence === undefined || result?.moderationConfidence === null
        ? null
        : Number(result.moderationConfidence),
    moderationReason: result?.moderationReason || result?.reason || 'AI moderation completed.',
    moderationCategories: Array.isArray(result?.moderationCategories)
      ? result.moderationCategories
      : Array.isArray(result?.categories)
        ? result.categories
        : [],
    moderationCheckedAt: new Date().toISOString(),
    reviewedAt: '',
    reviewedBy: '',
    reviewNote: '',
    active: status === moderationStatuses.approved,
  }
}

export const moderateProduct = (product) => {
  const text = normalizeText(
    [product.name, product.category, product.desc1, product.description, product.vendor]
      .filter(Boolean)
      .join(' '),
  )
  const matches = prohibitedRules.flatMap((rule) =>
    rule.terms
      .filter((term) => text.includes(term))
      .map((term) => ({ term, category: rule.category, severity: rule.severity })),
  )

  if (matches.some((match) => match.severity === 'illegal')) {
    const categories = [...new Set(matches.map((match) => match.category))]
    return {
      moderationStatus: moderationStatuses.rejected,
      moderationDecision: 'flagged',
      moderationConfidence: 0.92,
      moderationReason: `Potential prohibited item detected: ${categories.join(', ')}.`,
      moderationCategories: categories,
      moderationCheckedAt: new Date().toISOString(),
      reviewedAt: '',
      reviewedBy: '',
      reviewNote: '',
      active: false,
    }
  }

  if (matches.length > 0) {
    return {
      moderationStatus: moderationStatuses.rejected,
      moderationDecision: 'flagged',
      moderationConfidence: 0.68,
      moderationReason: 'Content may need manual admin review before publication.',
      moderationCategories: [...new Set(matches.map((match) => match.category))],
      moderationCheckedAt: new Date().toISOString(),
      reviewedAt: '',
      reviewedBy: '',
      reviewNote: '',
      active: false,
    }
  }

  return {
    moderationStatus: moderationStatuses.approved,
    moderationDecision: 'auto_approved',
    moderationConfidence: 0.81,
    moderationReason: 'No prohibited terms detected by built-in moderation.',
    moderationCategories: [],
    moderationCheckedAt: new Date().toISOString(),
    reviewedAt: '',
    reviewedBy: '',
    reviewNote: '',
    active: true,
  }
}

export const moderateProductWithAI = async (product) => {
  const fallback = moderateProduct(product)
  if (!isSupabaseConfigured || !supabase) return fallback

  try {
    const { data, error } = await supabase.functions.invoke('moderate-product', {
      body: {
        name: product.name,
        category: product.category,
        description: product.desc1 || product.description,
        image: product.image,
      },
    })

    if (error) throw error
    return normalizeAiResult(data)
  } catch (error) {
    console.warn('AI moderation unavailable, using built-in moderation fallback', error)
    return {
      ...fallback,
      moderationReason: `${fallback.moderationReason} AI moderation unavailable; built-in fallback used.`,
    }
  }
}
