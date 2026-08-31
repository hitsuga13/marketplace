// Purpose: Local product store for seller-posted products, stock calculation, active products, and seller lookup.
import { loadState, saveState } from './storage.js'
import { getUsers } from './users.js'
import { syncProductsToSupabase } from './supabaseSync.js'
import { normalizeStoredImage } from 'src/utils/assets'

export const starterProducts = []

export const getSellerProducts = () => {
  const sellers = getUsers().filter((user) => user.role === 'seller' && user.active !== false)
  const sellerIds = new Set(sellers.map((seller) => String(seller.id)))
  const sellerNames = new Set(sellers.map((seller) => seller.name.toLowerCase()))

  return loadState('upnm-seller-products', []).filter((product) => {
    if (product.sellerId && sellerIds.has(String(product.sellerId))) return true
    return sellerNames.has(String(product.vendor || product.seller || '').toLowerCase())
  })
}

export const saveSellerProducts = (products) => {
  const sellers = getUsers().filter((user) => user.role === 'seller' && user.active !== false)
  const sellerIds = new Set(sellers.map((seller) => String(seller.id)))
  const validProducts = products.filter((product) => product.sellerId && sellerIds.has(String(product.sellerId)))

  saveState('upnm-seller-products', validProducts)
  syncProductsToSupabase(validProducts)
}

export const getProductStock = (product) => {
  if (product?.stock === '' || product?.stock === undefined || product?.stock === null) return null

  const stock = Number(product.stock)
  return Number.isFinite(stock) ? Math.max(0, stock) : null
}

export const isProductOutOfStock = (product) => {
  const stock = getProductStock(product)
  return stock !== null && stock <= 0
}

export const decreaseProductStock = (productId, quantity = 1) => {
  const products = getSellerProducts()
  const idText = String(productId)
  let updatedProduct = null

  const updatedProducts = products.map((product) => {
    if (String(product.id) !== idText) return product

    const stock = getProductStock(product)
    if (stock === null) {
      updatedProduct = product
      return product
    }

    updatedProduct = {
      ...product,
      stock: Math.max(0, stock - Number(quantity || 0)),
    }
    return updatedProduct
  })

  saveSellerProducts(updatedProducts)
  return updatedProduct
}

export const decreaseProductsStock = (items) => {
  const products = getSellerProducts()
  const quantityByProduct = new Map()

  items.forEach((item) => {
    const key = String(item.productId || item.id)
    quantityByProduct.set(key, (quantityByProduct.get(key) || 0) + Number(item.quantity || 1))
  })

  const updatedProducts = products.map((product) => {
    const quantity = quantityByProduct.get(String(product.id))
    if (!quantity) return product

    const stock = getProductStock(product)
    if (stock === null) return product

    return {
      ...product,
      stock: Math.max(0, stock - quantity),
    }
  })

  saveSellerProducts(updatedProducts)
  return updatedProducts
}

export const getProducts = () => getSellerProducts().map((product) => ({
  ...product,
  active: product.active !== false,
  image: normalizeStoredImage(product.image),
  vendor: product.vendor || product.seller || 'Campus Vendor',
})).filter((product) => product.moderationStatus === 'approved')

export const getSellerForProduct = (product) => {
  const users = getUsers()
  if (product.sellerId) return users.find((user) => user.id === product.sellerId)

  return users.find(
    (user) =>
      user.role === 'seller' &&
      user.name.toLowerCase() === (product.vendor || product.seller || '').toLowerCase(),
  )
}
