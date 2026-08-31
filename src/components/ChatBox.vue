<!-- Supabase-backed live chat with message receipts. -->
<template>
  <q-card flat bordered class="chat-box column no-wrap">
    <q-banner dense :class="statusClass">
      <template #avatar><q-icon :name="statusIcon" /></template>
      {{ connectionStatusLabel }}
    </q-banner>

    <q-scroll-area ref="scrollArea" class="chat-box__messages q-pa-md">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['chat-message-row', { 'chat-message-row--own': isOwnMessage(message) }]"
      >
        <q-chat-message
          :sent="isOwnMessage(message)"
          :name="isOwnMessage(message) ? 'You' : otherParticipantName"
          :text="[message.message]"
          :stamp="formatMessageStamp(message)"
        />
        <div v-if="isOwnMessage(message)" :class="['message-receipt', receiptClass(message)]">
          <q-icon :name="receiptIcon(message)" size="16px" />
        </div>
      </div>
      <div v-if="!messages.length" class="text-center text-grey-7 q-pa-lg">
        No messages yet. Start the conversation.
      </div>
    </q-scroll-area>

    <q-input
      v-model="draft"
      outlined
      dense
      class="q-pa-sm"
      placeholder="Type a message..."
      :disable="connectionStatus === 'offline'"
      @keyup.enter="sendMessage"
    >
      <template #append>
        <q-btn
          flat
          round
          dense
          color="primary"
          icon="send"
          :loading="sending"
          :disable="!draft.trim() || connectionStatus === 'offline'"
          @click="sendMessage"
        />
      </template>
    </q-input>
  </q-card>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { isSupabaseConfigured, supabase } from 'src/supabase/client'

const props = defineProps({
  senderId: { type: [String, Number], required: true },
  receiverId: { type: [String, Number], required: true },
  productId: { type: [String, Number], default: null },
  conversationId: { type: String, required: true },
  productName: { type: String, default: '' },
  buyerId: { type: [String, Number], required: true },
  buyerName: { type: String, default: '' },
  sellerName: { type: String, default: 'Campus Seller' },
  senderRole: { type: String, required: true },
})

const $q = useQuasar()
const messages = ref([])
const draft = ref('')
const sending = ref(false)
const connectionStatus = ref('connecting')
const scrollArea = ref(null)
let channel = null

const statusClass = computed(() => {
  if (connectionStatus.value === 'connected') return 'bg-green-1 text-positive'
  if (connectionStatus.value === 'offline') return 'bg-red-1 text-negative'
  return 'bg-orange-1 text-warning'
})
const connectionStatusLabel = computed(() => {
  if (connectionStatus.value === 'connected') return 'Chat connected'
  if (connectionStatus.value === 'offline') return 'Chat offline'
  return 'Connecting chat...'
})
const statusIcon = computed(() => {
  if (connectionStatus.value === 'connected') return 'wifi'
  if (connectionStatus.value === 'offline') return 'wifi_off'
  return 'sync'
})
const otherParticipantName = computed(() =>
  props.senderRole === 'seller' ? props.buyerName : props.sellerName,
)

const isOwnMessage = (message) => message.sender_role === props.senderRole
const formatTime = (date) =>
  new Intl.DateTimeFormat('en-MY', { hour: '2-digit', minute: '2-digit' }).format(new Date(date))
const formatMessageStamp = (message) => formatTime(message.created_at)
const receiptIcon = (message) => (message.delivered_at || message.read_at ? 'done_all' : 'done')
const receiptClass = (message) => (message.read_at ? 'message-receipt--read' : '')

const notifyError = (message) => {
  try {
    $q.notify({ type: 'negative', message, position: 'top' })
  } catch {
    console.error(message)
  }
}

const messageMatchesConversation = (message) => message.conversation_id === props.conversationId

const updateLocalMessage = (updatedMessage) => {
  const index = messages.value.findIndex(
    (message) => String(message.id) === String(updatedMessage.id),
  )
  if (index > -1) messages.value[index] = { ...messages.value[index], ...updatedMessage }
}

const markConversationRead = async () => {
  if (!isSupabaseConfigured || !supabase) return

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('chat_messages')
    .update({ delivered_at: now, read_at: now })
    .eq('conversation_id', props.conversationId)
    .neq('sender_role', props.senderRole)
    .is('read_at', null)
    .select()

  if (error) {
    notifyError(`Unable to update message receipts: ${error.message}`)
    return
  }

  data?.forEach(updateLocalMessage)
}

const appendMessage = async (message) => {
  if (
    !messageMatchesConversation(message) ||
    messages.value.some((item) => String(item.id) === String(message.id))
  )
    return

  messages.value.push(message)
  if (!isOwnMessage(message)) await markConversationRead()
  await nextTick()
  scrollArea.value?.setScrollPosition('vertical', 999999, 150)
}

const mergeMessage = async (message) => {
  if (!messageMatchesConversation(message)) return

  const existing = messages.value.some((item) => String(item.id) === String(message.id))
  if (existing) {
    updateLocalMessage(message)
    return
  }

  await appendMessage(message)
}

const loadMessages = async () => {
  if (!isSupabaseConfigured || !supabase) return

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', props.conversationId)
    .order('created_at')

  if (error) return notifyError(`Unable to load messages: ${error.message}`)

  messages.value = data || []
  await markConversationRead()
  await nextTick()
  scrollArea.value?.setScrollPosition('vertical', 999999)
}

const disconnect = async () => {
  if (!channel || !supabase) return
  await supabase.removeChannel(channel)
  channel = null
}

const connect = async () => {
  if (!navigator.onLine || !isSupabaseConfigured || !supabase) {
    connectionStatus.value = 'offline'
    return
  }

  connectionStatus.value = 'connecting'
  await disconnect()
  channel = supabase
    .channel(`chat-room-${props.conversationId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'chat_messages' },
      ({ new: message }) => mergeMessage(message),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') connectionStatus.value = 'connected'
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        connectionStatus.value = 'offline'
      } else {
        connectionStatus.value = 'connecting'
      }
    })
}

const sendMessage = async () => {
  if (!draft.value.trim() || sending.value || connectionStatus.value === 'offline') return
  if (!supabase) return notifyError('Chat is unavailable until Supabase is configured.')

  sending.value = true
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        local_id: `msg-${Date.now()}`,
        conversation_id: props.conversationId,
        buyer_id: null,
        buyer_local_id: String(props.buyerId),
        product_id: null,
        product_local_id: props.productId ? String(props.productId) : null,
        product_name: props.productName,
        buyer_name: props.buyerName,
        seller_name: props.sellerName,
        sender_role: props.senderRole,
        message: draft.value.trim(),
      })
      .select()
      .single()

    if (error) throw error

    draft.value = ''
    await appendMessage(data)
  } catch (error) {
    notifyError(error?.message || 'Unable to send message.')
  } finally {
    sending.value = false
  }
}

const goOffline = () => {
  connectionStatus.value = 'offline'
}
const goOnline = () => {
  connectionStatus.value = 'connecting'
  connect()
}

onMounted(async () => {
  window.addEventListener('offline', goOffline)
  window.addEventListener('online', goOnline)
  await loadMessages()
  await connect()
})

onBeforeUnmount(async () => {
  window.removeEventListener('offline', goOffline)
  window.removeEventListener('online', goOnline)
  await disconnect()
})

watch(
  () => [props.senderId, props.receiverId, props.productId, props.conversationId],
  async () => {
    await loadMessages()
    await connect()
  },
)
</script>

<style scoped>
.chat-box {
  min-height: 0;
  height: 100%;
}

.chat-box__messages {
  flex: 1;
  min-height: 320px;
}

.chat-message-row {
  position: relative;
}

.message-receipt {
  display: flex;
  justify-content: flex-end;
  color: #7b8794;
  margin-top: -18px;
  padding-right: 12px;
}

.message-receipt--read {
  color: #1e88e5;
}
</style>
