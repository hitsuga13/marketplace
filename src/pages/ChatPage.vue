<!-- Purpose: Dedicated buyer/seller chat page with conversation search, unread counts, message bubbles, and read tracking. -->
<template>
  <q-page class="chat-page">
    <section class="chat-shell">
      <aside class="chat-sidebar">
        <div class="chat-sidebar-top">
          <q-input
            v-model="searchText"
            outlined
            dense
            placeholder="Search chats"
            class="chat-search"
          >
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
              {
                'chat-list-item--active':
                  activeConversation?.conversationId === conversation.conversationId,
              },
            ]"
            @click="openConversation(conversation)"
          >
            <q-item-section avatar>
              <q-avatar size="48px" class="chat-contact-avatar">
                <q-icon name="person" />
              </q-avatar>
              <span :class="['chat-online-dot', `chat-online-dot--${getPresenceStatus(conversation)}`]"></span>
            </q-item-section>
            <q-item-section>
              <q-item-label class="chat-contact-name">{{
                getConversationName(conversation)
              }}<q-icon
                v-if="isConversationSellerVerified(conversation)"
                name="check_circle"
                color="primary"
                size="16px"
                class="verified-seller-mark"
              /></q-item-label>
              <q-item-label caption :class="['chat-presence-label', `chat-presence-label--${getPresenceStatus(conversation)}`]">
                {{ getPresenceLabel(conversation) }}
              </q-item-label>
              <q-item-label caption class="chat-product-name">{{
                conversation.productName
              }}</q-item-label>
              <q-item-label caption class="chat-last-message">{{
                conversation.lastMessage
              }}</q-item-label>
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
              <div class="chat-main-name">
                <span>{{ getConversationName(activeConversation) }}</span>
                <q-icon
                  v-if="isConversationSellerVerified(activeConversation)"
                  name="check_circle"
                  color="primary"
                  size="22px"
                  class="verified-seller-mark"
                />
              </div>
              <div class="chat-main-status">
                {{ activeConversation.productName }} - {{ getPresenceLabel(activeConversation) }}
              </div>
            </div>
          </header>

          <ChatBox
            v-if="chatRecipientId && chatProductId"
            class="chat-live-module"
            :sender-id="currentUser.id"
            :receiver-id="chatRecipientId"
            :product-id="chatProductId"
            :conversation-id="activeConversation.conversationId"
            :product-name="activeConversation.productName"
            :buyer-id="chatBuyerId"
            :buyer-name="chatBuyerName"
            :seller-name="chatSellerName"
            :sender-role="currentUser.role"
          />
          <q-banner v-else class="q-ma-md bg-orange-1 text-warning">
            This conversation is missing participant or product details.
          </q-banner>
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
  getBuyerConversationSummaries,
  getConversationSummaries,
  getCurrentUser,
  getUserPresenceStatus,
  getUsers,
  isVerifiedSeller,
  loadState,
  saveState,
  subscribeToChatMessages,
} from 'src/database'
import ChatBox from 'src/components/ChatBox.vue'

const currentUser = ref(getCurrentUser())
const searchText = ref('')
const activeConversation = ref(null)
const chatReadState = ref(loadState('upnm-chat-read-state', {}))
const presenceTick = ref(Date.now())
let unsubscribeChatRealtime = null
let presenceTimer = null

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
const chatProductId = computed(() => activeConversationMessages.value[0]?.productId || null)
const chatRecipientId = computed(() => {
  if (!activeConversation.value || !currentUser.value) return null
  if (currentUser.value.role === 'seller')
    return activeConversation.value.buyerId || activeConversationMessages.value[0]?.buyerId || null
  return (
    getUsers().find(
      (user) => user.role === 'seller' && user.name === activeConversation.value.sellerName,
    )?.id || null
  )
})
const chatBuyerId = computed(() =>
  currentUser.value?.role === 'buyer' ? currentUser.value.id : chatRecipientId.value,
)
const chatBuyerName = computed(() =>
  currentUser.value?.role === 'buyer' ? currentUser.value.name : activeConversation.value?.buyerName || '',
)
const chatSellerName = computed(() =>
  currentUser.value?.role === 'seller' ? currentUser.value.name : activeConversation.value?.sellerName || '',
)
const currentReadKey = computed(
  () =>
    `${currentUser.value?.role || 'guest'}-${currentUser.value?.id || currentUser.value?.name || 'none'}`,
)

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

const getConversationSeller = (conversation) => {
  if (!conversation) return null
  if (currentUser.value?.role === 'seller') return currentUser.value

  return getUsers().find(
    (user) => user.role === 'seller' && user.name === conversation.sellerName,
  )
}

const getPresenceStatus = (conversation) => {
  presenceTick.value
  return getUserPresenceStatus(getConversationSeller(conversation))
}

const getPresenceLabel = (conversation) => {
  const status = getPresenceStatus(conversation)
  if (status === 'online') return 'Online'
  if (status === 'idle') return 'Idle'
  return 'Offline'
}

const isConversationSellerVerified = (conversation) => {
  const seller = getConversationSeller(conversation)
  if (isVerifiedSeller(seller)) return true
  if (currentUser.value?.role === 'seller') return true

  return Boolean(conversation?.sellerName)
}

const isOwnMessage = (message) => message.senderRole === currentUser.value?.role

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

onMounted(() => {
  unsubscribeChatRealtime = subscribeToChatMessages()
  window.addEventListener('upnm-chat-updated', refreshActiveConversation)
  window.addEventListener('upnm-presence-updated', refreshActiveConversation)
  window.addEventListener('upnm-supabase-cache-updated', refreshActiveConversation)
  presenceTimer = window.setInterval(() => {
    presenceTick.value = Date.now()
  }, 30000)
})

onBeforeUnmount(() => {
  if (unsubscribeChatRealtime) unsubscribeChatRealtime()
  if (presenceTimer) window.clearInterval(presenceTimer)
  window.removeEventListener('upnm-chat-updated', refreshActiveConversation)
  window.removeEventListener('upnm-presence-updated', refreshActiveConversation)
  window.removeEventListener('upnm-supabase-cache-updated', refreshActiveConversation)
})
</script>

<style scoped>
.chat-main {
  display: flex;
  flex-direction: column;
}

.chat-live-module {
  flex: 1;
  min-height: 0;
  margin: 12px;
}
</style>
