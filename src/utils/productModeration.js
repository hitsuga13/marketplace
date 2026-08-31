// Purpose: Lightweight built-in product moderation before external AI/Vision is connected.
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
  pendingReview: 'pending_review',
}

export const getModerationStatusLabel = (status) => {
  if (status === moderationStatuses.approved) return 'Approved'
  if (status === moderationStatuses.rejected) return 'Rejected'
  if (status === moderationStatuses.pendingReview) return 'Pending Admin Review'
  return 'Pending Admin Review'
}

export const getModerationStatusColor = (status) => {
  if (status === moderationStatuses.approved) return 'positive'
  if (status === moderationStatuses.rejected) return 'negative'
  if (status === moderationStatuses.pendingReview) return 'warning'
  return 'warning'
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
      moderationStatus: moderationStatuses.pendingReview,
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
      moderationStatus: moderationStatuses.pendingReview,
      moderationDecision: 'needs_review',
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
    reviewedBy: 'Built-in moderation',
    reviewNote: '',
    active: true,
  }
}
