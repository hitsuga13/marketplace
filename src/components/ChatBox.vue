<!-- Supabase-backed live chat with connection and browser-network indicators. -->
<template>
  <q-card flat bordered class="chat-box column no-wrap">
    <q-banner dense :class="statusClass()">
      <template #avatar><q-icon :name="statusIcon()" /></template>
      {{ connectionStatus }}
    </q-banner>

    <q-scroll-area ref="scrollArea" class="chat-box__messages q-pa-md">
      <q-chat-message
        v-for="message in messages"
        :key="message.id"
        :sent="isOwnMessage(message)"
        :name="isOwnMessage(message) ? 'You' : 'Seller'"
        :text="[message.content]"
        :stamp="formatTime(message.created_at)"
      />
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
      :disable="connectionStatus === '🔴 Offline'"
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
          :disable="!draft.trim() || connectionStatus === '🔴 Offline'"
          @click="sendMessage"
        />
      </template>
    </q-input>
  </q-card>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { isSupabaseConfigured, supabase } from 'src/supabase/client'

const props = defineProps({
  senderId: { type: [String, Number], required: true },
  receiverId: { type: [String, Number], required: true },
  productId: { type: [String, Number], default: null },
})

const $q = useQuasar()
const messages = ref([])
const draft = ref('')
const sending = ref(false)
const connectionStatus = ref('🟠 Connecting...')
const scrollArea = ref(null)
let channel = null

const statusClass = () => {
  if (connectionStatus.value === '🟢 Online') return 'bg-green-1 text-positive'
  if (connectionStatus.value === '🔴 Offline') return 'bg-red-1 text-negative'
  return 'bg-orange-1 text-warning'
}
const statusIcon = () =>
  connectionStatus.value === '🟢 Online'
    ? 'wifi'
    : connectionStatus.value === '🔴 Offline'
      ? 'wifi_off'
      : 'sync'
const isOwnMessage = (message) => String(message.sender_id) === String(props.senderId)
const formatTime = (date) =>
  new Intl.DateTimeFormat('en-MY', { hour: '2-digit', minute: '2-digit' }).format(new Date(date))
const notifyError = (message) => {
  try {
    $q.notify({ type: 'negative', message, position: 'top' })
  } catch {
    console.error(message)
  }
}
const messageMatchesConversation = (message) => {
  const participants = [String(message.sender_id), String(message.receiver_id)].sort().join(':')
  const expected = [String(props.senderId), String(props.receiverId)].sort().join(':')
  return (
    participants === expected &&
    (!props.productId || String(message.product_id) === String(props.productId))
  )
}
const appendMessage = async (message) => {
  if (
    !messageMatchesConversation(message) ||
    messages.value.some((item) => String(item.id) === String(message.id))
  )
    return
  messages.value.push(message)
  await nextTick()
  scrollArea.value?.setScrollPosition('vertical', 999999, 150)
}
const loadMessages = async () => {
  if (!isSupabaseConfigured || !supabase) return
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${props.senderId},receiver_id.eq.${props.receiverId}),and(sender_id.eq.${props.receiverId},receiver_id.eq.${props.senderId})`,
    )
    .eq('product_id', props.productId)
    .order('created_at')
  if (error) return notifyError(`Unable to load messages: ${error.message}`)
  messages.value = data || []
  await nextTick()
  scrollArea.value?.setScrollPosition('vertical', 999999)
}
const disconnect = async () => {
  if (!channel || !supabase) return
  await supabase.removeChannel(channel)
  channel = null
}
const connect = async () => {
  if (!navigator.onLine) {
    connectionStatus.value = '🔴 Offline'
    return
  }
  if (!isSupabaseConfigured || !supabase) {
    connectionStatus.value = '🔴 Offline'
    return
  }
  connectionStatus.value = '🟠 Connecting...'
  await disconnect()
  channel = supabase
    .channel('chat_room')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages' },
      ({ new: message }) => appendMessage(message),
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') connectionStatus.value = '🟢 Online'
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED')
        connectionStatus.value = '🔴 Offline'
      else connectionStatus.value = '🟠 Connecting...'
    })
}
const sendMessage = async () => {
  if (!draft.value.trim() || sending.value || connectionStatus.value === '🔴 Offline') return
  if (!supabase) return notifyError('Chat is unavailable until Supabase is configured.')
  sending.value = true
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: props.senderId,
        receiver_id: props.receiverId,
        product_id: props.productId,
        content: draft.value.trim(),
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
  connectionStatus.value = '🔴 Offline'
}
const goOnline = () => {
  connectionStatus.value = '🟠 Connecting...'
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
  () => [props.senderId, props.receiverId, props.productId],
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
</style>
