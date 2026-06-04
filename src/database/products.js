// Purpose: Local product store for seller-posted products, stock calculation, active products, and seller lookup.
import { loadState, saveState } from './storage.js'
import { getUsers } from './users.js'
import { syncProductsToSupabase } from './supabaseSync.js'
import { normalizeStoredImage } from 'src/utils/assets'

export const starterProducts = []

export const getSellerProducts = () => {
  return loadState('upnm-seller-products', [])
}

export const saveSellerProducts = (products) => {
  saveState('upnm-seller-products', products)
  syncProductsToSupabase(products)
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
}))

export const getSellerForProduct = (product) => {
  const users = getUsers()
  if (product.sellerId) return users.find((user) => user.id === product.sellerId)

  return users.find(
    (user) =>
      user.role === 'seller' &&
      user.name.toLowerCase() === (product.vendor || product.seller || '').toLowerCase(),
  )
}
