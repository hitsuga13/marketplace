// Purpose: Local chat store for buyer/seller conversations, messages, unread counts, and read-state helpers.
import { ref } from 'vue'
import { supabase, isSupabaseConfigured } from 'src/supabase/client'
import { loadState, saveState } from './storage.js'
import { syncChatsToSupabase } from './supabaseSync.js'

export const chats = ref(loadState('upnm-chats', []))
let chatRealtimeChannel = null
let chatRealtimeSubscribers = 0

if (typeof window !== 'undefined') {
  window.addEventListener('upnm-supabase-cache-updated', () => {
    chats.value = loadState('upnm-chats', [])
  })
}

const saveChats = () => {
  saveState('upnm-chats', chats.value)
  syncChatsToSupabase(chats.value)
}

const parseLocalId = (value) => {
  const text = String(value ?? '')
  const number = Number(text)
  return text && Number.isSafeInteger(number) && String(number) === text ? number : text
}

const fromSupabaseMessage = (message) => ({
  id: parseLocalId(message.local_id || message.id),
  conversationId: message.conversation_id,
  productId: message.product_local_id
    ? parseLocalId(message.product_local_id)
    : message.product_id
      ? parseLocalId(message.product_id)
      : null,
  productName: message.product_name,
  buyerId: parseLocalId(message.buyer_local_id || message.buyer_id),
  buyerName: message.buyer_name,
  sellerName: message.seller_name,
  senderRole: message.sender_role,
  text: message.message,
  createdAt: message.created_at,
})

const notifyChatChanged = () => {
  window.dispatchEvent(new Event('upnm-chat-updated'))
}

const mergeIncomingMessage = (message) => {
  const mappedMessage = fromSupabaseMessage(message)
  const alreadyExists = chats.value.some(
    (item) =>
      String(item.id) === String(mappedMessage.id) ||
      (item.conversationId === mappedMessage.conversationId &&
        item.createdAt === mappedMessage.createdAt &&
        item.senderRole === mappedMessage.senderRole &&
        item.text === mappedMessage.text),
  )

  if (alreadyExists) return

  chats.value = [...chats.value, mappedMessage]
  saveState('upnm-chats', chats.value)
  notifyChatChanged()
}

export const subscribeToChatMessages = () => {
  if (!isSupabaseConfigured || !supabase || typeof window === 'undefined') return () => {}

  chatRealtimeSubscribers += 1

  if (!chatRealtimeChannel) {
    chatRealtimeChannel = supabase
      .channel('upnm-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          if (payload.new) mergeIncomingMessage(payload.new)
        },
      )
      .subscribe()
  }

  return () => {
    chatRealtimeSubscribers = Math.max(0, chatRealtimeSubscribers - 1)
    if (chatRealtimeSubscribers > 0 || !chatRealtimeChannel) return

    supabase.removeChannel(chatRealtimeChannel)
    chatRealtimeChannel = null
  }
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
  notifyChatChanged()
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
