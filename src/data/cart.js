import { ref, computed } from 'vue'

export const cart = ref([])

export const cartCount = computed(() => {
  return cart.value.reduce((total, item) => total + item.quantity, 0)
})

export const addToCart = (product, variation, finalPrice, selectedAddons) => {
  // Creates a unique ID based on selections
  const addonIds = selectedAddons
    .map((a) => a.label)
    .sort()
    .join(',')
  const uniqueKey = `${product.id}-${variation?.label || 'none'}-${addonIds}`

  const existingItem = cart.value.find((item) => item.uniqueKey === uniqueKey)

  if (existingItem) {
    existingItem.quantity++
  } else {
    cart.value.push({
      uniqueKey,
      id: product.id,
      name: product.name,
      image: product.image,
      selectedVar: variation,
      selectedAddons: [...selectedAddons],
      price: finalPrice,
      quantity: 1,
      selected: true, // Default to checked in cart
    })
  }
}

export const removeFromCart = (uniqueKey) => {
  cart.value = cart.value.filter((item) => item.uniqueKey !== uniqueKey)
}
