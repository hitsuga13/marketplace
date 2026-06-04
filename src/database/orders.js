// Purpose: Local order store for buyer purchases, seller/admin status updates, receipts, and order queries.
import { loadState, saveState } from './storage.js'
import { syncOrdersToSupabase } from './supabaseSync.js'

const ORDER_KEY = 'upnm-buyer-orders'

export const getOrders = () => loadState(ORDER_KEY, [])

export const saveOrders = (orders) => {
  saveState(ORDER_KEY, orders)
  syncOrdersToSupabase(orders)
}

export const createOrder = (order) => {
  const orders = getOrders()
  const newOrder = {
    id: `order-${Date.now()}`,
    status: 'In Progress',
    createdAt: new Date().toISOString(),
    ...order,
  }

  saveOrders([newOrder, ...orders])
  return newOrder
}

export const createOrders = (orders) => {
  const currentOrders = getOrders()
  const createdAt = new Date().toISOString()
  const newOrders = orders.map((order, index) => ({
    id: `order-${Date.now()}-${index}`,
    status: 'In Progress',
    createdAt,
    ...order,
  }))

  saveOrders([...newOrders, ...currentOrders])
  return newOrders
}

export const getBuyerOrders = (buyerId) => getOrders().filter((order) => order.buyerId === buyerId)

export const getSellerOrders = (sellerName) =>
  getOrders()
    .filter((order) => order.vendor === sellerName)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

export const updateOrderStatus = (orderId, status) => {
  const orders = getOrders().map((order) =>
    order.id === orderId
      ? { ...order, status, reviewedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      : order,
  )

  saveOrders(orders)
  return orders
}
