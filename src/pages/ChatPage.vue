<!-- Purpose: Dedicated buyer/seller chat page with conversation search, unread counts, message bubbles, and read tracking. -->
<template>
  <q-page class="chat-page">
    <section class="chat-shell">
      <aside class="chat-sidebar">
        <div class="chat-sidebar-top">
          <q-input v-model="searchText" outlined dense placeholder="Search chats" class="chat-search">
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
            <template v-slot:append>
              <q-btn
                v-if="searchText"
                flat
                round
                dense
                icon="close"
                color="grey-6"
                aria-label="Clear chat search"
                @click="searchText = ''"
              />
            </template>
          </q-input>
        </div>

        <div class="chat-list">
          <q-item
            v-for="conversation in filteredConversations"
            :key="conversation.conversationId"
            clickable
            :class="[
              'chat-list-item',
              { 'chat-list-item--active': activeConversation?.conversationId === conversation.conversationId },
            ]"
            @click="openConversation(conversation)"
          >
            <q-item-section avatar>
              <q-avatar size="48px" class="chat-contact-avatar">
                <q-icon name="person" />
              </q-avatar>
              <span class="chat-online-dot"></span>
            </q-item-section>
            <q-item-section>
              <q-item-label class="chat-contact-name">{{ getConversationName(conversation) }}</q-item-label>
              <q-item-label caption class="chat-product-name">{{ conversation.productName }}</q-item-label>
              <q-item-label caption class="chat-last-message">{{ conversation.lastMessage }}</q-item-label>
            </q-item-section>
            <q-item-section side top>
              <div class="chat-time">{{ formatTime(conversation.createdAt) }}</div>
              <q-badge
                v-if="getUnreadCount(conversation) > 0"
                color="blue-1"
                text-color="primary"
                :label="getUnreadCount(conversation)"
              />
            </q-item-section>
          </q-item>
          <div v-if="filteredConversations.length === 0" class="chat-list-empty">
            <q-icon name="forum" size="42px" color="primary" />
            <div>No conversations yet</div>
          </div>
        </div>
      </aside>

      <main class="chat-main">
        <template v-if="activeConversation">
          <header class="chat-main-header">
            <q-avatar size="54px" class="chat-contact-avatar">
              <q-icon name="person" />
            </q-avatar>
            <div>
              <div class="chat-main-name">{{ getConversationName(activeConversation) }}</div>
              <div class="chat-main-status">{{ activeConversation.productName }}</div>
            </div>
          </header>

          <div class="chat-messages">
            <div
              v-for="message in activeConversationMessages"
              :key="message.id"
              :class="['chat-message-row', isOwnMessage(message) ? 'chat-message-row--own' : '']"
            >
              <q-avatar v-if="!isOwnMessage(message)" size="40px" class="chat-contact-avatar">
                <q-icon name="person" />
              </q-avatar>
              <div>
                <div v-if="!isOwnMessage(message)" class="chat-message-name">
                  {{ getMessageSenderName(message) }}
                </div>
                <div class="chat-message-bubble">
                  {{ message.text }}
                </div>
                <div v-if="isOwnMessage(message)" class="chat-seen">
                  <q-icon name="done_all" />
                </div>
              </div>
            </div>
          </div>

          <footer class="chat-composer">
            <q-input
              v-model="messageText"
              outlined
              dense
              placeholder="Type a message..."
              class="chat-compose-input"
              @keyup.enter="sendMessage"
            >
              <template v-slot:append>
                <q-btn flat round dense icon="send" color="primary" @click="sendMessage" />
              </template>
            </q-input>
          </footer>
        </template>

        <div v-else class="chat-empty-state">
          <div class="chat-empty-card">
            <q-icon name="forum" size="72px" color="primary" />
            <div class="text-h6 text-weight-bold q-mt-md">No conversation selected</div>
            <div class="text-grey-7">Start a chat from a product detail page.</div>
          </div>
        </div>
      </main>
    </section>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  addMessage,
  getBuyerConversationSummaries,
  getConversationSummaries,
  getCurrentUser,
  loadState,
  saveState,
  subscribeToChatMessages,
} from 'src/database'

const currentUser = ref(getCurrentUser())
const searchText = ref('')
const activeConversation = ref(null)
const messageText = ref('')
const chatReadState = ref(loadState('upnm-chat-read-state', {}))
let unsubscribeChatRealtime = null

const conversations = computed(() => {
  if (!currentUser.value) return []
  if (currentUser.value.role === 'seller') return getConversationSummaries(currentUser.value.name)
  return getBuyerConversationSummaries(currentUser.value.id)
})

const displayedConversations = computed(() => conversations.value)

const filteredConversations = computed(() => {
  const query = searchText.value.trim().toLowerCase()
  if (!query) return displayedConversations.value

  return displayedConversations.value.filter(
    (conversation) =>
      getConversationName(conversation).toLowerCase().includes(query) ||
      conversation.productName.toLowerCase().includes(query) ||
      conversation.lastMessage.toLowerCase().includes(query),
  )
})

const activeConversationMessages = computed(() => activeConversation.value?.messages || [])
const currentReadKey = computed(() => `${currentUser.value?.role || 'guest'}-${currentUser.value?.id || currentUser.value?.name || 'none'}`)

const refreshActiveConversation = () => {
  if (!activeConversation.value) return

  const refreshed = displayedConversations.value.find(
    (conversation) => conversation.conversationId === activeConversation.value.conversationId,
  )
  if (refreshed) activeConversation.value = refreshed
}

const getConversationName = (conversation) => {
  if (!conversation) return ''
  return currentUser.value?.role === 'seller' ? conversation.buyerName : conversation.sellerName
}

const isOwnMessage = (message) => message.senderRole === currentUser.value?.role

const getMessageSenderName = (message) => {
  if (message.senderRole === 'seller') return message.sellerName
  return message.buyerName
}

const formatTime = (dateString) =>
  new Intl.DateTimeFormat('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))

const getLastReadAt = (conversation) =>
  chatReadState.value[`${currentReadKey.value}-${conversation.conversationId}`] || ''

const getUnreadCount = (conversation) => {
  const lastReadAt = getLastReadAt(conversation)
  const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0

  return conversation.messages.filter(
    (message) => !isOwnMessage(message) && new Date(message.createdAt).getTime() > lastReadTime,
  ).length
}

const markConversationRead = (conversation) => {
  if (!conversation || !currentUser.value) return

  chatReadState.value = {
    ...chatReadState.value,
    [`${currentReadKey.value}-${conversation.conversationId}`]: new Date().toISOString(),
  }
  saveState('upnm-chat-read-state', chatReadState.value)
  window.dispatchEvent(new Event('upnm-chat-read-state-updated'))
}

const openConversation = (conversation) => {
  activeConversation.value = conversation
  markConversationRead(conversation)
}

watch(
  filteredConversations,
  (value) => {
    if (!activeConversation.value && value.length > 0) {
      activeConversation.value = value[0]
      markConversationRead(value[0])
    }
  },
  { immediate: true },
)

const sendMessage = () => {
  if (!messageText.value.trim() || !activeConversation.value || !currentUser.value) return

  const firstMessage = activeConversation.value.messages[0]
  const buyer = {
    id: firstMessage.buyerId,
    name: firstMessage.buyerName,
  }
  const product = {
    id: firstMessage.productId,
    name: firstMessage.productName,
    vendor: firstMessage.sellerName,
  }

  addMessage({
    conversationId: activeConversation.value.conversationId,
    product,
    buyer,
    senderRole: currentUser.value.role,
    text: messageText.value.trim(),
  })

  const refreshed = displayedConversations.value.find(
    (conversation) => conversation.conversationId === activeConversation.value.conversationId,
  )
  activeConversation.value = refreshed
  markConversationRead(refreshed)
  messageText.value = ''
}

onMounted(() => {
  unsubscribeChatRealtime = subscribeToChatMessages()
  window.addEventListener('upnm-chat-updated', refreshActiveConversation)
})

onBeforeUnmount(() => {
  if (unsubscribeChatRealtime) unsubscribeChatRealtime()
  window.removeEventListener('upnm-chat-updated', refreshActiveConversation)
})
</script>
