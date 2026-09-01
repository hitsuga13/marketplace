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
  'payment_method',
  'payment_reference',
  'payment_status',
  'receipt_file_name',
  'status',
  'created_at',
  'updated_at',
].join(',')
const USER_LIST_COLUMNS = [
  'id',
  'local_id',
  'auth_id',
  'name',
  'email',
  'phone',
  'password',
  'role',
  'avatar',
  'payment_qr',
  'business_hours',
  'pickup_address',
  'recovery_code',
  'verified_seller',
  'presence_status',
  'last_seen_at',
  'active',
  'created_at',
  'updated_at',
].join(',')
const PRODUCT_LIST_COLUMNS = [
  'id',
  'local_id',
  'seller_id',
  'seller_local_id',
  'seller',
  'vendor',
  'category',
  'name',
  'image',
  'price',
  'stock',
  'desc1',
  'variations',
  'addons',
  'moderation_status',
  'moderation_decision',
  'moderation_reason',
  'moderation_confidence',
  'moderation_categories',
  'moderation_checked_at',
  'reviewed_by',
  'reviewed_at',
  'review_note',
  'active',
  'created_at',
  'updated_at',
].join(',')
const CHAT_LIST_COLUMNS = [
  'id',
  'local_id',
  'conversation_id',
  'product_id',
  'product_local_id',
  'product_name',
  'buyer_id',
  'buyer_local_id',
  'buyer_name',
  'seller_name',
  'sender_role',
  'message',
  'delivered_at',
  'read_at',
  'created_at',
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
  local_id: String(user.id),
  auth_id: user.authId || user.auth_id || undefined,
  name: user.name || '',
  email: String(user.email || '').toLowerCase(),
  phone: user.phone || '',
  password: user.password || '',
  role: user.role || 'buyer',
  avatar: user.avatar || '',
  payment_qr: user.paymentQr || '',
  business_hours: user.businessHours || '',
  pickup_address: user.pickupAddress || '',
  recovery_code: user.recoveryCode || '',
  verified_seller: user.role === 'seller' ? user.verifiedSeller !== false : false,
  presence_status: user.presenceStatus || 'offline',
  last_seen_at: user.lastSeenAt || null,
  active: user.active !== false,
})

const fromSupabaseUser = (user) => ({
  id: parseLocalId(user.local_id || user.id),
  authId: user.auth_id || '',
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  password: user.password || '',
  role: user.role,
  avatar: user.avatar || '',
  paymentQr: user.payment_qr || '',
  businessHours: user.business_hours || '',
  pickupAddress: user.pickup_address || '',
  recoveryCode: user.recovery_code || '',
  verifiedSeller: user.role === 'seller' ? user.verified_seller !== false : false,
  presenceStatus: user.presence_status || 'offline',
  lastSeenAt: user.last_seen_at || '',
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
  moderation_status: product.moderationStatus || 'approved',
  moderation_decision: product.moderationDecision || 'auto_approved',
  moderation_reason: product.moderationReason || '',
  moderation_confidence:
    product.moderationConfidence === undefined ? null : Number(product.moderationConfidence),
  moderation_categories: safeArray(product.moderationCategories),
  moderation_checked_at: product.moderationCheckedAt || null,
  reviewed_by: product.reviewedBy || null,
  reviewed_at: product.reviewedAt || null,
  review_note: product.reviewNote || '',
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
  moderationStatus: product.moderation_status || 'approved',
  moderationDecision: product.moderation_decision || 'auto_approved',
  moderationReason: product.moderation_reason || '',
  moderationConfidence:
    product.moderation_confidence === null || product.moderation_confidence === undefined
      ? null
      : Number(product.moderation_confidence),
  moderationCategories: safeArray(product.moderation_categories),
  moderationCheckedAt: product.moderation_checked_at || '',
  reviewedBy: product.reviewed_by || '',
  reviewedAt: product.reviewed_at || '',
  reviewNote: product.review_note || '',
  active: product.active !== false,
})

const productHasExistingSeller = (product, users = loadState('upnm-users', [])) => {
  const sellers = users.filter((user) => user.role === 'seller' && user.active !== false)
  if (product.seller_local_id && sellers.some((seller) => String(seller.id) === String(product.seller_local_id))) {
    return true
  }

  return sellers.some(
    (seller) =>
      seller.name.toLowerCase() === String(product.vendor || product.seller || '').toLowerCase(),
  )
}

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
    payment_method: order.paymentMethod || 'manual_qr',
    payment_reference: order.paymentReference || '',
    payment_status: order.paymentStatus || 'Pending Seller Verification',
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
  productId: order.product_local_id
    ? parseLocalId(order.product_local_id)
    : order.product_id
      ? parseLocalId(order.product_id)
      : null,
  productName: order.product_name,
  vendor: order.vendor,
  image: order.image || '',
  quantity: Number(order.quantity || 1),
  total: Number(order.total || 0),
  selectedVariation: order.selected_variation || '',
  selectedAddons: safeArray(order.selected_addons),
  paymentMethod: order.payment_method || 'manual_qr',
  paymentReference: order.payment_reference || '',
  paymentStatus: order.payment_status || 'Pending Seller Verification',
  ...(Object.prototype.hasOwnProperty.call(order, 'receipt')
    ? { receipt: order.receipt || '' }
    : {}),
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
  delivered_at: message.deliveredAt || null,
  read_at: message.readAt || null,
  created_at: message.createdAt || new Date().toISOString(),
})

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
  deliveredAt: message.delivered_at || '',
  readAt: message.read_at || '',
  createdAt: message.created_at,
})

const getSyncActor = () => loadState('upnm-current-user', null)

const isAdminActor = (actor) => actor?.role === 'admin'

const isOwnUser = (user, actor = getSyncActor()) =>
  isAdminActor(actor) || (actor && String(user.id) === String(actor.id))

const isOwnProduct = (product, actor = getSyncActor()) =>
  isAdminActor(actor) ||
  (actor?.role === 'seller' &&
    (String(product.sellerId || '') === String(actor.id) ||
      String(product.sellerLocalId || '') === String(actor.id) ||
      String(product.vendor || product.seller || '').toLowerCase() ===
        String(actor.name || '').toLowerCase()))

const isOwnOrder = (order, actor = getSyncActor()) =>
  isAdminActor(actor) ||
  (actor?.role === 'buyer' &&
    (String(order.buyerId || '') === String(actor.id) ||
      String(order.buyerLocalId || '') === String(actor.id))) ||
  (actor?.role === 'seller' &&
    String(order.vendor || '').toLowerCase() === String(actor.name || '').toLowerCase())

const isOwnMessage = (message, actor = getSyncActor()) =>
  isAdminActor(actor) ||
  (actor?.role === 'buyer' &&
    (String(message.buyerId || '') === String(actor.id) ||
      String(message.buyerLocalId || '') === String(actor.id))) ||
  (actor?.role === 'seller' &&
    String(message.sellerName || '').toLowerCase() === String(actor.name || '').toLowerCase())

export const initializeSupabaseCache = async () => {
  if (!isSupabaseConfigured || !supabase) return false

  try {
    const [usersResult, productsResult, ordersResult, messagesResult] = await Promise.all([
      supabase.from('users').select(USER_LIST_COLUMNS).order('created_at', { ascending: true }),
      supabase
        .from('products')
        .select(PRODUCT_LIST_COLUMNS)
        .order('created_at', { ascending: false }),
      supabase.from('orders').select(ORDER_LIST_COLUMNS).order('created_at', { ascending: false }),
      supabase
        .from('chat_messages')
        .select(CHAT_LIST_COLUMNS)
        .order('created_at', { ascending: true })
        .limit(500),
    ])

    assertSupabaseOk(usersResult, 'Load users')
    assertSupabaseOk(productsResult, 'Load products')
    assertSupabaseOk(ordersResult, 'Load orders')
    assertSupabaseOk(messagesResult, 'Load chat messages')

    const { data: users } = usersResult
    const { data: products } = productsResult
    const { data: orders } = ordersResult
    const { data: messages } = messagesResult
    const mappedUsers = users?.map(fromSupabaseUser) || []

    if (users) {
      saveState('upnm-users', mappedUsers)
      syncCurrentUserFromUsers(mappedUsers)
    }
    if (products) {
      saveState(
        'upnm-seller-products',
        products
          .filter((product) => productHasExistingSeller(product, mappedUsers))
          .map(fromSupabaseProduct),
      )
    }
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

export const syncUsersToSupabase = (users, options = {}) => {
  const task = async () => {
    const actor = getSyncActor()
    const rows = users.filter((user) => isOwnUser(user, actor)).map(toSupabaseUser)
    if (rows.length === 0) return
    assertSupabaseOk(
      await supabase.from('users').upsert(rows, { onConflict: 'local_id' }),
      'Sync users',
    )
  }

  if (options.immediate) return isSupabaseConfigured && supabase ? task() : Promise.resolve()
  return queueSync('users', task)
}

export const updateUserProfileInSupabase = async (user) => {
  if (!isSupabaseConfigured || !supabase || !user?.id) return

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) throw new Error(`Update profile: ${sessionError.message}`)
  if (!session?.user?.id) throw new Error('Update profile: no active Supabase session')

  const profile = {
    name: user.name || '',
    email: String(user.email || '').toLowerCase(),
    phone: user.phone || '',
    avatar: user.avatar || '',
    payment_qr: user.paymentQr || '',
    business_hours: user.businessHours || '',
    pickup_address: user.pickupAddress || '',
  }

  let result = await supabase
    .from('users')
    .update(profile)
    .eq('auth_id', session.user.id)
    .eq('role', user.role || 'buyer')
    .select('local_id, auth_id')
    .maybeSingle()

  assertSupabaseOk(result, 'Update profile')

  if (!result.data) {
    result = await supabase
      .from('users')
      .update(profile)
      .eq('local_id', String(user.id))
      .select('local_id, auth_id')
      .maybeSingle()

    assertSupabaseOk(result, 'Update profile')
  }

  if (!result.data) throw new Error('Update profile: no matching profile row')
}

export const syncProductsToSupabase = (products) =>
  queueSync('products', async () => {
    const actor = getSyncActor()
    const rows = products.filter((product) => isOwnProduct(product, actor)).map(toSupabaseProduct)

    if (rows.length > 0) {
      assertSupabaseOk(
        await supabase.from('products').upsert(rows, { onConflict: 'local_id' }),
        'Sync products',
      )
    }
  })

export const deleteProductFromSupabase = (productId) =>
  queueSync(`product-delete-${productId}`, async () => {
    if (!productId) return
    assertSupabaseOk(
      await supabase.from('products').delete().eq('local_id', String(productId)),
      'Delete product',
    )
  })

export const syncOrdersToSupabase = (orders) =>
  queueSync('orders', async () => {
    const actor = getSyncActor()
    const rows = orders.filter((order) => isOwnOrder(order, actor)).map(toSupabaseOrder)
    if (rows.length === 0) return
    assertSupabaseOk(
      await supabase.from('orders').upsert(rows, { onConflict: 'local_id' }),
      'Sync orders',
    )
  })

export const syncChatsToSupabase = (messages) =>
  queueSync('chat_messages', async () => {
    const actor = getSyncActor()
    const rows = messages.filter((message) => isOwnMessage(message, actor)).map(toSupabaseMessage)
    if (rows.length === 0) return
    assertSupabaseOk(
      await supabase.from('chat_messages').upsert(rows, { onConflict: 'local_id' }),
      'Sync chat messages',
    )
  })
