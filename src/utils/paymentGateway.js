// Purpose: Shared manual payment gateway helpers for QR, bank transfer, and e-wallet proof flows.
export const paymentMethods = [
  {
    label: 'DuitNow QR',
    value: 'duitnow_qr',
    icon: 'qr_code_2',
    caption: 'Scan seller QR and upload proof.',
  },
  {
    label: 'Bank Transfer',
    value: 'bank_transfer',
    icon: 'account_balance',
    caption: 'Transfer manually and enter the reference.',
  },
  {
    label: 'E-Wallet',
    value: 'ewallet',
    icon: 'account_balance_wallet',
    caption: 'Pay through your wallet and upload proof.',
  },
]

export const getPaymentMethodLabel = (method) =>
  paymentMethods.find((option) => option.value === method)?.label || 'Manual Payment'

export const createPaymentReference = (prefix = 'UPNM') =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`

export const normalizePaymentReference = (reference) => String(reference || '').trim()

export const isValidPaymentReference = (reference) => normalizePaymentReference(reference).length >= 4
