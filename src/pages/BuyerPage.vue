<!-- Purpose: Buyer dashboard for spending metrics, cart count, order progress, cancellation, item received, and purchase history. -->
<template>
  <q-page class="role-page buyer-page">
    <section class="role-hero buyer-hero">
      <div>
        <q-badge color="secondary" text-color="dark" label="Buyer Dashboard" />
        <h1>Welcome back, {{ currentUser?.name || 'Buyer' }}</h1>
        <p>Track your purchases, monitor order progress, and review your buying history.</p>
      </div>
    </section>

    <section class="role-band">
      <div class="buyer-dashboard-grid">
        <q-card flat class="buyer-metric-card">
          <q-card-section>
            <q-icon name="payments" color="primary" size="34px" />
            <div class="buyer-metric-value">RM {{ moneySpent.toFixed(2) }}</div>
            <div class="buyer-metric-label">Money spent</div>
          </q-card-section>
        </q-card>

        <q-card flat class="buyer-metric-card">
          <q-card-section>
            <q-icon name="hourglass_top" color="primary" size="34px" />
            <div class="buyer-metric-value">{{ inProgressOrders.length }}</div>
            <div class="buyer-metric-label">In progress buying</div>
          </q-card-section>
        </q-card>

        <q-card flat class="buyer-metric-card">
          <q-card-section>
            <q-icon name="shopping_cart" color="primary" size="34px" />
            <div class="buyer-metric-value">{{ cartCount }}</div>
            <div class="buyer-metric-label">Items in cart</div>
          </q-card-section>
        </q-card>

        <q-card flat class="buyer-metric-card">
          <q-card-section>
            <q-icon name="receipt_long" color="primary" size="34px" />
            <div class="buyer-metric-value">{{ buyerOrders.length }}</div>
            <div class="buyer-metric-label">Total orders</div>
          </q-card-section>
        </q-card>
      </div>

      <q-card flat bordered class="buyer-overview-card q-mt-lg">
        <q-card-section>
          <div class="row items-center justify-between q-gutter-sm">
            <div>
              <div class="text-h6 text-weight-bold">My Orders</div>
              <div class="text-grey-7">Track purchases, cancel pending orders, or confirm received items.</div>
            </div>
            <q-chip color="primary" text-color="white" icon="receipt_long" :label="`${buyerOrders.length} Orders`" />
          </div>

          <q-list v-if="buyerOrders.length" separator class="q-mt-md buyer-order-list">
            <q-item v-for="order in buyerOrders" :key="order.id" class="buyer-order-item">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(order.image)" :alt="order.productName" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ order.productName }}</q-item-label>
                <q-item-label caption>
                  {{ order.vendor }} - Qty {{ order.quantity || 1 }} - RM {{ Number(order.total || 0).toFixed(2) }}
                </q-item-label>
                <q-item-label v-if="getOrderOptionText(order)" caption>
                  {{ getOrderOptionText(order) }}
                </q-item-label>
                <q-item-label caption>{{ formatDate(order.createdAt) }}</q-item-label>
                <q-linear-progress
                  :value="getOrderProgress(order.status)"
                  :color="getStatusColor(order.status)"
                  rounded
                  class="q-mt-sm buyer-order-progress"
                />
              </q-item-section>
              <q-item-section side class="buyer-order-status">
                <q-chip dense :color="getStatusColor(order.status)" text-color="white" :label="order.status" />
              </q-item-section>
              <q-item-section side class="buyer-order-actions">
                <q-btn
                  v-if="order.status === 'Item Sent'"
                  dense
                  unelevated
                  color="primary"
                  icon="inventory_2"
                  label="Item Received"
                  no-caps
                  @click="updateBuyerOrderStatus(order.id, 'Completed')"
                />
                <q-btn
                  v-if="order.status === 'In Progress'"
                  dense
                  flat
                  color="negative"
                  icon="cancel"
                  label="Cancel"
                  no-caps
                  @click="updateBuyerOrderStatus(order.id, 'Cancelled')"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else class="role-banner q-mt-md">No orders yet.</q-banner>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="buyer-overview-card q-mt-lg">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Recently Purchased</div>
          <q-list v-if="recentPurchases.length" separator class="q-mt-md">
            <q-item v-for="order in recentPurchases" :key="order.id">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(order.image)" :alt="order.productName" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ order.productName }}</q-item-label>
                <q-item-label caption>{{ order.vendor }} - {{ formatDate(order.createdAt) }}</q-item-label>
                <q-item-label v-if="getOrderOptionText(order)" caption>
                  {{ getOrderOptionText(order) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label class="text-primary text-weight-bold">
                  RM {{ Number(order.total || 0).toFixed(2) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-banner v-else class="role-banner q-mt-md">No purchase history yet.</q-banner>
        </q-card-section>
      </q-card>
    </section>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { normalizeStoredImage } from 'src/utils/assets'
import {
  cartCount,
  getBuyerOrders,
  getCurrentUser,
  updateOrderStatus,
} from 'src/database'

const $q = useQuasar()
const currentUser = ref(getCurrentUser())
const buyerOrders = ref(getBuyerOrders(currentUser.value?.id))
const getImageSrc = (src) => normalizeStoredImage(src)
const myOrders = computed(() => buyerOrders.value)
const moneySpent = computed(() =>
  myOrders.value.reduce((sum, order) => (order.status === 'Completed' ? sum + Number(order.total || 0) : sum), 0),
)
const inProgressOrders = computed(() =>
  myOrders.value
    .filter((order) =>
      ['In Progress', 'Seller Confirmed', 'Item Sent'].includes(order.status),
    )
    .slice(0, 4),
)
const recentPurchases = computed(() =>
  myOrders.value
    .filter((order) => order.status === 'Completed')
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4),
)

const getOrderOptionText = (order) => {
  const parts = []
  if (order.selectedVariation) parts.push(`Variation: ${order.selectedVariation}`)
  if (order.selectedAddons?.length) {
    parts.push(`Add-ons: ${order.selectedAddons.map((addon) => addon.label).join(', ')}`)
  }
  return parts.join(' | ')
}

const getOrderProgress = (status) => {
  if (status === 'Completed') return 1
  if (status === 'Item Sent') return 0.9
  if (status === 'Seller Confirmed') return 0.75
  return 0.45
}

const getStatusColor = (status) => {
  if (status === 'Completed') return 'positive'
  if (status === 'Item Sent') return 'info'
  if (status === 'Seller Confirmed') return 'secondary'
  if (status === 'Rejected') return 'negative'
  if (status === 'Cancelled') return 'grey-7'
  if (status === 'Refunded') return 'warning'
  return 'primary'
}

const updateBuyerOrderStatus = (orderId, status) => {
  updateOrderStatus(orderId, status)
  buyerOrders.value = getBuyerOrders(currentUser.value?.id)
  $q.notify({
    color: status === 'Completed' ? 'positive' : 'grey-8',
    icon: status === 'Completed' ? 'check_circle' : 'cancel',
    message:
      status === 'Completed'
        ? 'Order completed. Payment released to seller.'
        : 'Order cancelled.',
    position: 'top',
  })
}

const formatDate = (dateString) =>
  new Intl.DateTimeFormat('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))

</script>

<style scoped>
.detail-modal-card {
  width: 950px;
  max-width: 95vw;
  height: 600px;
  overflow: hidden;
}

.detail-image {
  max-height: 100%;
  width: 100%;
}

.close-btn {
  background: rgba(255, 255, 255, 0.8);
  z-index: 20;
}

.description-box {
  max-height: 130px;
  overflow-y: auto;
  line-height: 1.5;
  white-space: pre-line;
}

.variation-scroll-container {
  max-height: 85px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.buyer-order-item {
  align-items: center;
}

.buyer-order-status,
.buyer-order-actions {
  align-self: center;
  justify-content: center;
}

.buyer-order-actions {
  min-width: 150px;
}

.buyer-order-actions :deep(.q-btn) {
  width: 150px;
}

@media (max-width: 700px) {
  .detail-modal-card {
    width: calc(100vw - 18px);
    max-width: calc(100vw - 18px);
    height: min(92vh, 760px);
    overflow-y: auto;
  }

  .detail-modal-card .full-height {
    height: auto !important;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  .detail-modal-card .col-6 {
    width: 100%;
    max-width: 100%;
    flex: 0 0 auto;
  }

  .detail-image {
    height: 260px;
  }

  .detail-modal-card .text-h4 {
    font-size: 1.55rem;
    line-height: 1.15;
  }

  .detail-modal-card .text-h3 {
    font-size: 2rem;
  }

  .buyer-order-status,
  .buyer-order-actions {
    min-width: 0;
  }

  .buyer-order-actions :deep(.q-btn) {
    width: 120px;
  }
}
</style>
