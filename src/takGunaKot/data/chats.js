/*
  OLD FILE ARCHIVE
  Original location: src/data/chats.js
  Current active replacement: src/database/chats.js

  import { ref } from 'vue'

  const loadChats = () => {
    try {
      return JSON.parse(localStorage.getItem('upnm-chats')) || []
    } catch {
      return []
    }
  }

  const saveChats = () => {
    localStorage.setItem('upnm-chats', JSON.stringify(chats.value))
  }

  export const chats = ref(loadChats())

  export const getConversationId = (product, buyer) => {
    const vendor = product.vendor || product.seller || 'Campus Vendor'
    return `${buyer.id}-${product.id}-${vendor}`.toLowerCase().replace(/\s+/g, '-')
  }

  export const getProductMessages = (conversationId) =>
    chats.value.filter((message) => message.conversationId === conversationId)

  export const getSellerMessages = (sellerName) =>
    chats.value.filter((message) => message.sellerName === sellerName)

  export const addMessage = ({ conversationId, product, buyer, senderRole, text }) => {
    const message = {
      id: Date.now(),
      conversationId,
      productId: product.id,
      productName: product.name,
      sellerName: product.vendor || product.seller || 'Campus Vendor',
      buyerId: buyer.id,
      buyerName: buyer.name,
      senderRole,
      text,
      createdAt: new Date().toISOString(),
    }

    chats.value.push(message)
    saveChats()
    return message
  }

  export const getConversationSummaries = (sellerName) => {
    const sellerMessages = getSellerMessages(sellerName)
    const map = new Map()

    sellerMessages.forEach((message) => {
      map.set(message.conversationId, {
        conversationId: message.conversationId,
        productName: message.productName,
        buyerName: message.buyerName,
        lastMessage: message.text,
        createdAt: message.createdAt,
        messages: sellerMessages.filter((item) => item.conversationId === message.conversationId),
      })
    })

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  export const getBuyerConversationSummaries = (buyerId) => {
    const buyerMessages = chats.value.filter((message) => message.buyerId === buyerId)
    const map = new Map()

    buyerMessages.forEach((message) => {
      map.set(message.conversationId, {
        conversationId: message.conversationId,
        productName: message.productName,
        buyerName: message.buyerName,
        sellerName: message.sellerName,
        lastMessage: message.text,
        createdAt: message.createdAt,
        messages: buyerMessages.filter((item) => item.conversationId === message.conversationId),
      })
    })

    return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
*/
