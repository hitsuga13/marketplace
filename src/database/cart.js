// Purpose: Local cart store for buyer cart items, quantity changes, selected checkout items, and stock-safe cart operations.
import { computed, ref, watch } from 'vue'
import { loadState, saveState } from './storage.js'
import { getProductStock, getProducts } from './products.js'

const getCartStorageKey = () => {
  const user = loadState('upnm-current-user', null)
  if (!user?.id) return 'upnm-cart-guest'

  return `upnm-cart-${user.role || 'user'}-${user.id}`
}

let cartStorageKey = getCartStorageKey()

export const cart = ref(loadState(cartStorageKey, []))

const reloadCartForCurrentUser = () => {
  const nextCartStorageKey = getCartStorageKey()
  if (nextCartStorageKey === cartStorageKey) return

  cartStorageKey = nextCartStorageKey
  cart.value = loadState(cartStorageKey, [])
}

window.addEventListener('upnm-current-user-updated', reloadCartForCurrentUser)
window.addEventListener('storage', reloadCartForCurrentUser)

watch(
  cart,
  (value) => {
    saveState(cartStorageKey, value)
  },
  { deep: true },
)

export const cartCount = computed(() =>
  cart.value.reduce((total, item) => total + Number(item.quantity || 1), 0),
)

export const addToCart = (product, variation, finalPrice, selectedAddons) => {
  const latestProduct = getProducts().find((item) => String(item.id) === String(product.id))
  const stock = getProductStock(latestProduct || product)
  const currentProductQuantity = cart.value
    .filter((item) => String(item.id) === String(product.id))
    .reduce((total, item) => total + Number(item.quantity || 1), 0)

  if (stock !== null && currentProductQuantity >= stock) return false

  const addonIds = selectedAddons
    .map((addon) => addon.label)
    .sort()
    .join(',')
  const uniqueKey = `${product.id}-${variation?.label || 'none'}-${addonIds}`

  const existingItem = cart.value.find((item) => item.uniqueKey === uniqueKey)

  if (existingItem) {
    existingItem.quantity += 1
    return true
  }

  cart.value.push({
    uniqueKey,
    id: product.id,
    name: product.name,
    image: product.image,
    vendor: product.vendor || product.seller || 'Campus Vendor',
    seller: product.seller || product.vendor || 'Campus Vendor',
    sellerId: product.sellerId,
    category: product.category,
    selectedVar: variation,
    selectedAddons: [...selectedAddons],
    price: finalPrice,
    quantity: 1,
    selected: true,
  })

  return true
}

export const removeFromCart = (uniqueKey) => {
  cart.value = cart.value.filter((item) => item.uniqueKey !== uniqueKey)
}

export const clearSelectedCartItems = () => {
  cart.value = cart.value.filter((item) => item.selected === false)
}

export const clearCart = () => {
  cart.value = []
}
