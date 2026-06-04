/*
  OLD FILE ARCHIVE
  Original location: src/utils/roleStore.js
  Current active replacements:
  - src/database/users.js
  - src/database/products.js
  - src/database/storage.js

  This file used to combine users, products, localStorage helpers,
  current session, seller lookup, and role redirects in one place.
  It was archived because the active system now separates data by entity.

  import { allProducts } from 'src/data/products.js'

  export const starterUsers = [...]

  export const loadState = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback
    } catch {
      return fallback
    }
  }

  export const saveState = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }

  export const getCurrentUser = () => loadState('upnm-current-user', null)
  export const getUsers = () => loadState('upnm-users', starterUsers)
  export const getSellerProducts = () => loadState('upnm-seller-products', [])
  export const saveSellerProducts = (products) => saveState('upnm-seller-products', products)

  export const getSellerForProduct = (product) => {
    const users = getUsers()
    if (product.sellerId) return users.find((user) => user.id === product.sellerId)

    return users.find(
      (user) =>
        user.role === 'seller' &&
        user.name.toLowerCase() === (product.vendor || product.seller || '').toLowerCase(),
    )
  }

  export const getProducts = () => {
    const sellerProducts = getSellerProducts()

    return [...sellerProducts, ...allProducts].map((product) => ({
      ...product,
      active: product.active !== false,
      vendor: product.vendor || product.seller || 'Campus Vendor',
    }))
  }

  export const getRoleHome = (role) => {
    if (role === 'seller') return '/seller'
    if (role === 'admin') return '/admin'
    return '/buyer-dashboard'
  }
*/
