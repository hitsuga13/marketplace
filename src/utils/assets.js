// Purpose: Build public asset URLs that work locally and under the GitHub Pages /marketplace/ base path.
export const getPublicAsset = (path) => {
  const base = import.meta.env.BASE_URL || '/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  const cleanPath = String(path || '').replace(/^\/+/, '')

  return `${cleanBase}${cleanPath}`
}

export const normalizeStoredImage = (src) => {
  if (!src) return ''

  const text = String(src)
  if (/^(data:|blob:|https?:)/i.test(text)) return text
  if (text.startsWith('/icons/') || text.startsWith('icons/')) {
    return getPublicAsset(text.replace(/^\/+/, ''))
  }

  return text
}
