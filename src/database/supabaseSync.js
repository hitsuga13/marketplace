// Purpose: Background sync bridge between the existing local browser database and Supabase tables.
import { supabase, isSupabaseConfigured } from 'src/supabase/client'
import { normalizeStoredImage } from 'src/utils/assets'
import { loadState, saveState } from './storage.js'

const pendingTimers = {}
const ORDER_LIST_COLUMNS = [
  'id',
  'local_id',
  'buyer_id',
  'buyer_local_id',
  'product_id',
  'product_local_id',
  'product_name',
  'vendor',
  'image',
  'quantity',
  'total',
  'selected_variation',
  'selected_addons',
  'receipt_file_name',
  'status',
  'created_at',
  'updated_at',
].join(',')

const parseLocalId = (value) => {
  const text = String(value ?? '')
  const number = Number(text)
  return text && Number.isSafeInteger(number) && String(number) === text ? number : text
}

const safeArray = (value) => (Array.isArray(value) ? value : [])

const notifyLocalDataChanged = () => {
  window.dispatchEvent(new Event('upnm-supabase-cache-updated'))
  window.dispatchEvent(new Event('upnm-chat-updated'))
}

const syncCurrentUserFromUsers = (users) => {
  const currentUser = loadState('upnm-current-user', null)
  if (!currentUser) return

  const latestUser = users.find(
    (user) =>
      String(user.id) === String(currentUser.id) ||
      user.email?.toLowerCase() === currentUser.email?.toLowerCase(),
  )

  if (latestUser) saveState('upnm-current-user', latestUser)
}

const queueSync = (name, task) => {
  if (!isSupabaseConfigured) return

  clearTimeout(pendingTimers[name])
  pendingTimers[name] = setTimeout(() => {
    task().catch((error) => {
      console.warn(`Supabase ${name} sync failed`, error)
    })
  }, 350)
}

const assertSupabaseOk = ({ error }, action) => {
  if (error) throw new Error(`${action}: ${error.message}`)
}

const toSupabaseUser = (user) => ({
  id: Number.isSafeInteger(Number(user.id)) ? Number(user.id) : undefined,
  local_id: String(user.id),
  name: user.name || '',
  email: String(user.email || '').toLowerCase(),
  phone: user.phone || '',
  password: user.password || '',
  role: user.role || 'buyer',
  avatar: user.avatar || '',
  payment_qr: user.paymentQr || '',
  recovery_code: user.recoveryCode || '',
  active: user.active !== false,
})

const fromSupabaseUser = (user) => ({
  id: parseLocalId(user.local_id || user.id),
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  password: user.password || '',
  role: user.role,
  avatar: user.avatar || '',
  paymentQr: user.payment_qr || '',
  recoveryCode: user.recovery_code || '',
  active: user.active !== false,
})

const toSupabaseProduct = (product) => ({
  local_id: String(product.id),
  seller_id: null,
  seller_local_id: product.sellerId ? String(product.sellerId) : null,
  seller: product.seller || product.vendor || 'Campus Seller',
  vendor: product.vendor || product.seller || 'Campus Seller',
  category: product.category || 'FnB',
  name: product.name || '',
  image: product.image || '',
  price: Number(product.price || 0),
  stock: product.stock === '' || product.stock === undefined ? null : Number(product.stock),
  desc1: product.desc1 || product.description || '',
  variations: safeArray(product.variations),
  addons: safeArray(product.addons),
  active: product.active !== false,
})

const fromSupabaseProduct = (product) => ({
  id: parseLocalId(product.local_id || product.id),
  sellerId: parseLocalId(product.seller_local_id || product.seller_id),
  seller: product.seller || product.vendor || 'Campus Seller',
  vendor: product.vendor || product.seller || 'Campus Seller',
  category: product.category,
  name: product.name,
  image: normalizeStoredImage(product.image),
  price: Number(product.price || 0),
  stock: product.stock,
  desc1: product.desc1,
  variations: safeArray(product.variations),
  addons: safeArray(product.addons),
  active: product.active !== false,
})

const toSupabaseOrder = (order) => {
  const row = {
    local_id: String(order.id),
    buyer_id: null,
    buyer_local_id: order.buyerId ? String(order.buyerId) : null,
    product_id: null,
    product_local_id: order.productId ? String(order.productId) : null,
    product_name: order.productName || '',
    vendor: order.vendor || 'Campus Vendor',
    image: normalizeStoredImage(order.image || ''),
    quantity: Number(order.quantity || 1),
    total: Number(order.total || 0),
    selected_variation: order.selectedVariation || '',
    selected_addons: safeArray(order.selectedAddons),
    receipt_file_name: order.receiptFileName || '',
    status: order.status || 'In Progress',
    created_at: order.createdAt || new Date().toISOString(),
    updated_at: order.updatedAt || order.reviewedAt || new Date().toISOString(),
  }

  if (Object.prototype.hasOwnProperty.call(order, 'receipt')) {
    row.receipt = order.receipt || ''
  }

  return row
}

const fromSupabaseOrder = (order) => ({
  id: parseLocalId(order.local_id || order.id),
  buyerId: parseLocalId(order.buyer_local_id || order.buyer_id),
  productId: order.product_local_id ? parseLocalId(order.product_local_id) : order.product_id ? parseLocalId(order.product_id) : null,
  productName: order.product_name,
  vendor: order.vendor,
  image: order.image || '',
  quantity: Number(order.quantity || 1),
  total: Number(order.total || 0),
  selectedVariation: order.selected_variation || '',
  selectedAddons: safeArray(order.selected_addons),
  ...(Object.prototype.hasOwnProperty.call(order, 'receipt') ? { receipt: order.receipt || '' } : {}),
  receiptFileName: order.receipt_file_name || '',
  status: order.status,
  createdAt: order.created_at,
  updatedAt: order.updated_at,
})

const toSupabaseMessage = (message) => ({
  local_id: String(message.id),
  conversation_id: message.conversationId,
  buyer_id: null,
  buyer_local_id: message.buyerId ? String(message.buyerId) : null,
  product_id: null,
  product_local_id: message.productId ? String(message.productId) : null,
  product_name: message.productName || '',
  buyer_name: message.buyerName || '',
  seller_name: message.sellerName || 'Campus Seller',
  sender_role: message.senderRole,
  message: message.text || '',
  created_at: message.createdAt || new Date().toISOString(),
})

const fromSupabaseMessage = (message) => ({
  id: parseLocalId(message.local_id || message.id),
  conversationId: message.conversation_id,
  productId: message.product_local_id ? parseLocalId(message.product_local_id) : message.product_id ? parseLocalId(message.product_id) : null,
  productName: message.product_name,
  buyerId: parseLocalId(message.buyer_local_id || message.buyer_id),
  buyerName: message.buyer_name,
  sellerName: message.seller_name,
  senderRole: message.sender_role,
  text: message.message,
  createdAt: message.created_at,
})

export const initializeSupabaseCache = async () => {
  if (!isSupabaseConfigured || !supabase) return false

  try {
    const [usersResult, productsResult, ordersResult, messagesResult] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select(ORDER_LIST_COLUMNS).order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
    ])

    assertSupabaseOk(usersResult, 'Load users')
    assertSupabaseOk(productsResult, 'Load products')
    assertSupabaseOk(ordersResult, 'Load orders')
    assertSupabaseOk(messagesResult, 'Load chat messages')

    const { data: users } = usersResult
    const { data: products } = productsResult
    const { data: orders } = ordersResult
    const { data: messages } = messagesResult

    if (users) {
      const mappedUsers = users.map(fromSupabaseUser)
      saveState('upnm-users', mappedUsers)
      syncCurrentUserFromUsers(mappedUsers)
    }
    if (products) saveState('upnm-seller-products', products.map(fromSupabaseProduct))
    if (orders) saveState('upnm-buyer-orders', orders.map(fromSupabaseOrder))
    if (messages) saveState('upnm-chats', messages.map(fromSupabaseMessage))

    notifyLocalDataChanged()
    return true
  } catch (error) {
    console.warn('Supabase cache initialization failed', error)
    return false
  }
}

export const fetchOrderReceipt = async (orderId) => {
  if (!isSupabaseConfigured || !supabase || !orderId) return null

  try {
    const result = await supabase
      .from('orders')
      .select('local_id, receipt, receipt_file_name')
      .eq('local_id', String(orderId))
      .maybeSingle()

    assertSupabaseOk(result, 'Load order receipt')
    if (!result.data) return null

    const receiptData = {
      receipt: result.data.receipt || '',
      receiptFileName: result.data.receipt_file_name || '',
    }
    const orders = loadState('upnm-buyer-orders', [])
    const updatedOrders = orders.map((order) =>
      String(order.id) === String(orderId) ? { ...order, ...receiptData } : order,
    )
    saveState('upnm-buyer-orders', updatedOrders)

    return receiptData
  } catch (error) {
    console.warn('Supabase receipt load failed', error)
    return null
  }
}

export const syncUsersToSupabase = (users) =>
  queueSync('users', async () => {
    const rows = users.map(toSupabaseUser)
    if (rows.length === 0) return
    assertSupabaseOk(
      await supabase.from('users').upsert(rows, { onConflict: 'local_id' }),
      'Sync users',
    )
  })

export const syncProductsToSupabase = (products) =>
  queueSync('products', async () => {
    const rows = products.map(toSupabaseProduct)

    if (rows.length > 0) {
      assertSupabaseOk(
        await supabase.from('products').upsert(rows, { onConflict: 'local_id' }),
        'Sync products',
      )
    }
  })

export const syncOrdersToSupabase = (orders) =>
  queueSync('orders', async () => {
    const rows = orders.map(toSupabaseOrder)
    if (rows.length === 0) return
    assertSupabaseOk(
      await supabase.from('orders').upsert(rows, { onConflict: 'local_id' }),
      'Sync orders',
    )
  })

export const syncChatsToSupabase = (messages) =>
  queueSync('chat_messages', async () => {
    const rows = messages.map(toSupabaseMessage)
    if (rows.length === 0) return
    assertSupabaseOk(
      await supabase.from('chat_messages').upsert(rows, { onConflict: 'local_id' }),
      'Sync chat messages',
    )
  })
