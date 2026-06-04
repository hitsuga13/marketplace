/*
  OLD FILE ARCHIVE
  Original location: src/data/cart.js
  Current active replacement: src/database/cart.js

  import { computed, ref, watch } from 'vue'

  const loadCart = () => {
    try {
      return JSON.parse(localStorage.getItem('upnm-cart')) || []
    } catch {
      return []
    }
  }

  export const cart = ref(loadCart())

  watch(
    cart,
    (value) => {
      localStorage.setItem('upnm-cart', JSON.stringify(value))
    },
    { deep: true },
  )

  export const cartCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0)
  })

  export const addToCart = (product, variation, finalPrice, selectedAddons) => {
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
    }
  }

  export const removeFromCart = (uniqueKey) => {
    cart.value = cart.value.filter((item) => item.uniqueKey !== uniqueKey)
  }

  export const clearCart = () => {
    cart.value = []
  }
*/
