// Purpose: Local chat store for buyer/seller conversations, messages, unread counts, and read-state helpers.
import { ref } from 'vue'
import { loadState, saveState } from './storage.js'
import { syncChatsToSupabase } from './supabaseSync.js'

export const chats = ref(loadState('upnm-chats', []))

if (typeof window !== 'undefined') {
  window.addEventListener('upnm-supabase-cache-updated', () => {
    chats.value = loadState('upnm-chats', [])
  })
}

const saveChats = () => {
  saveState('upnm-chats', chats.value)
  syncChatsToSupabase(chats.value)
}

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
  window.dispatchEvent(new Event('upnm-chat-updated'))
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

const getReadStateKey = (user) =>
  `${user?.role || 'guest'}-${user?.id || user?.name || 'none'}`

export const getUnreadChatCount = (user, readState = loadState('upnm-chat-read-state', {})) => {
  if (!user || !['buyer', 'seller'].includes(user.role)) return 0

  const conversations =
    user.role === 'seller'
      ? getConversationSummaries(user.name)
      : getBuyerConversationSummaries(user.id)
  const readKey = getReadStateKey(user)

  return conversations.reduce((total, conversation) => {
    const lastReadAt = readState[`${readKey}-${conversation.conversationId}`] || ''
    const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0

    const unreadMessages = conversation.messages.filter(
      (message) =>
        message.senderRole !== user.role &&
        new Date(message.createdAt).getTime() > lastReadTime,
    ).length

    return total + unreadMessages
  }, 0)
}
