// Purpose: Shared upload validation rules so images, QR codes, and receipts stay small enough for online storage.

export const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024
export const MAX_UPLOAD_LABEL = '1.5MB'

export const getUploadSizeError = (file, label = 'file') => {
  if (!file) return ''

  if (file.size > MAX_UPLOAD_BYTES) {
    return `The ${label} is too large. Maximum upload size is ${MAX_UPLOAD_LABEL}.`
  }

  return ''
}
