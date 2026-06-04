<!-- Purpose: Admin dashboard for user/product/order management, receipt audit, refunds, and CSV report generation. -->
<template>
  <q-page class="role-page admin-page">
    <section class="role-hero admin-hero">
      <div>
        <q-badge color="secondary" text-color="dark" label="Admin Dashboard" />
        <h1>Manage marketplace users and products</h1>
        <p>Review users, control product visibility, and generate a simple marketplace report.</p>
      </div>
    </section>

    <section class="role-band">
      <q-card flat bordered class="role-card admin-report-module">
        <q-card-section>
          <div class="admin-report-header">
            <div>
              <div class="text-h6 text-weight-bold">Report Module</div>
              <div class="text-grey-7">Pick a report type, generate report, then export to CSV.</div>
            </div>
            <q-chip
              :color="generatedReport ? 'positive' : 'grey-5'"
              text-color="white"
              icon="summarize"
              :label="generatedReport ? 'Report Ready' : 'Waiting for Generate'"
            />
          </div>

          <div class="admin-report-flow q-mt-md">
            <q-select
              v-model="selectedReportType"
              outlined
              dense
              label="Report type"
              :options="reportTypeOptions"
              emit-value
              map-options
            />
            <q-btn
              unelevated
              color="primary"
              icon="play_arrow"
              label="Generate Report"
              no-caps
              @click="generateReport"
            />
            <q-btn
              outline
              color="primary"
              icon="download"
              label="Export CSV"
              no-caps
              :disable="!generatedReport"
              @click="exportReportCsv"
            />
          </div>

          <div class="admin-report-filters q-mt-md">
            <q-select
              v-model="reportSellerFilter"
              outlined
              dense
              clearable
              label="Seller filter"
              :options="reportSellerOptions"
            />
            <q-select
              v-model="reportStatusFilter"
              outlined
              dense
              clearable
              label="Order status"
              :options="reportStatusOptions"
            />
            <q-input v-model="reportStartDate" outlined dense type="date" label="Start date" />
            <q-input v-model="reportEndDate" outlined dense type="date" label="End date" />
            <q-btn flat color="grey-7" icon="restart_alt" label="Clear" no-caps @click="clearReportFilters" />
          </div>

          <div v-if="generatedReport" class="admin-report-output q-mt-lg">
            <div class="admin-report-summary">
              <div>
                <span>{{ generatedReport.title }}</span>
                <small>{{ generatedReport.rows.length }} row(s) generated</small>
              </div>
              <q-badge color="primary" :label="generatedReport.generatedAt" />
            </div>

            <q-markup-table flat bordered class="q-mt-md admin-report-table">
              <thead>
                <tr>
                  <th v-for="column in generatedReport.columns" :key="column.key" class="text-left">
                    {{ column.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in generatedReport.rows" :key="index">
                  <td v-for="column in generatedReport.columns" :key="column.key">
                    {{ row[column.key] }}
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>

          <q-banner v-else class="role-banner q-mt-md">
            Open report module by choosing a report type, then click Generate Report.
          </q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section class="role-band">
      <div class="report-grid">
        <div class="report-metric">
          <span>{{ users.length }}</span>
          <small>Total users</small>
        </div>
        <div class="report-metric">
          <span>{{ sellerProducts.length }}</span>
          <small>Seller products</small>
        </div>
        <div class="report-metric">
          <span>{{ activeProducts }}</span>
          <small>Active products</small>
        </div>
        <div class="report-metric">
          <span>{{ pendingOrders.length }}</span>
          <small>Pending payments</small>
        </div>
        <div class="report-metric">
          <span>RM {{ totalSales.toFixed(2) }}</span>
          <small>Confirmed sales</small>
        </div>
        <div class="report-metric">
          <span>{{ orders.length }}</span>
          <small>Total orders</small>
        </div>
      </div>
    </section>

    <section class="role-band admin-grid">
      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div class="text-h6 text-weight-bold">Manage Users</div>
          </div>
          <q-list separator class="q-mt-md">
            <q-item v-for="user in users" :key="user.id">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ user.name }}</q-item-label>
                <q-item-label caption>{{ user.email }} / {{ user.role }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="user.active" color="primary" @update:model-value="saveUsers" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="text-h6 text-weight-bold">Manage Products</div>
          <q-list separator class="q-mt-md">
            <q-item v-for="product in sellerProducts" :key="product.id">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(product.image)" :alt="product.name" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ product.name }}</q-item-label>
                <q-item-label caption>{{ product.vendor }} / {{ product.category }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="product.active" color="primary" @update:model-value="saveProducts" />
              </q-item-section>
              <q-item-section side>
                <q-btn flat round color="negative" icon="delete" @click="deleteProduct(product.id)" />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-if="sellerProducts.length === 0" class="role-banner q-mt-md">
            No seller product yet.
          </q-banner>
        </q-card-section>
      </q-card>
    </section>

    <section class="role-band">
      <q-card flat bordered class="role-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6 text-weight-bold">Payment Receipts & Orders</div>
              <div class="text-grey-7">Audit buyer receipts and marketplace order status.</div>
            </div>
            <q-chip color="primary" text-color="white" icon="receipt_long" :label="`${pendingOrders.length} Pending`" />
          </div>

          <q-list v-if="orders.length" separator class="q-mt-md">
            <q-item v-for="order in orders" :key="order.id">
              <q-item-section avatar>
                <q-avatar square rounded>
                  <img :src="getImageSrc(order.image)" :alt="order.productName" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ order.productName }}</q-item-label>
                <q-item-label caption>
                  {{ order.vendor }} / RM {{ Number(order.total || 0).toFixed(2) }}
                </q-item-label>
                <q-item-label v-if="getOrderOptionText(order)" caption>
                  {{ getOrderOptionText(order) }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-chip dense :color="getStatusColor(order.status)" text-color="white" :label="order.status" />
              </q-item-section>
              <q-item-section side class="admin-order-actions">
                <q-btn outline dense color="primary" icon="receipt" label="Receipt" no-caps @click="viewReceipt(order)" />
                <q-btn
                  v-if="order.status !== 'Completed'"
                  dense
                  unelevated
                  color="positive"
                  icon="check_circle"
                  label="Complete"
                  no-caps
                  @click="updateAdminOrderStatus(order.id, 'Completed')"
                />
                <q-btn
                  v-if="order.status !== 'Refunded'"
                  dense
                  flat
                  color="warning"
                  icon="undo"
                  label="Refund"
                  no-caps
                  @click="updateAdminOrderStatus(order.id, 'Refunded')"
                />
                <q-btn
                  v-if="order.status === 'In Progress' || order.status === 'Seller Confirmed'"
                  dense
                  flat
                  color="negative"
                  icon="cancel"
                  label="Reject"
                  no-caps
                  @click="updateAdminOrderStatus(order.id, 'Rejected')"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <q-banner v-else class="role-banner q-mt-md">No buyer orders yet.</q-banner>
        </q-card-section>
      </q-card>
    </section>

    <q-dialog v-model="receiptDialog">
      <q-card class="receipt-preview-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6 text-weight-bold">Payment Receipt</div>
            <div class="text-grey-7">{{ selectedReceiptOrder?.productName }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-card-section>
          <q-img
            v-if="selectedReceiptOrder?.receipt?.startsWith('data:image')"
            :src="selectedReceiptOrder.receipt"
            fit="contain"
            class="receipt-preview-image"
          />
          <q-banner v-else class="role-banner">
            Receipt uploaded as {{ selectedReceiptOrder?.receiptFileName || 'file' }}. Image preview is only available for image receipts.
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { normalizeStoredImage } from 'src/utils/assets'
import {
  getOrders,
  getSellerProducts,
  getUsers,
  saveSellerProducts,
  saveUsers as saveStoredUsers,
  updateOrderStatus,
} from 'src/database'

const $q = useQuasar()
const users = ref(getUsers())
const sellerProducts = ref(getSellerProducts())
const orders = ref(getOrders())
const receiptDialog = ref(false)
const selectedReceiptOrder = ref(null)
const selectedReportType = ref('marketplace-summary')
const generatedReport = ref(null)
const reportSellerFilter = ref(null)
const reportStatusFilter = ref(null)
const reportStartDate = ref('')
const reportEndDate = ref('')
const getImageSrc = (src) => normalizeStoredImage(src)

const reportTypeOptions = [
  { label: 'Marketplace Summary', value: 'marketplace-summary' },
  { label: 'User Report', value: 'user-report' },
  { label: 'Product Report', value: 'product-report' },
  { label: 'Order & Payment Report', value: 'order-payment-report' },
]

const activeProducts = computed(() => sellerProducts.value.filter((product) => product.active !== false).length)
const reportSellerOptions = computed(() =>
  [...new Set(sellerProducts.value.map((product) => product.vendor || product.seller).filter(Boolean))].sort(),
)
const reportStatusOptions = ['In Progress', 'Seller Confirmed', 'Item Sent', 'Completed', 'Rejected', 'Cancelled', 'Refunded']
const pendingOrders = computed(() =>
  orders.value.filter((order) => ['In Progress', 'Seller Confirmed', 'Item Sent'].includes(order.status)),
)
const totalSales = computed(() =>
  orders.value.reduce((sum, order) => (order.status === 'Completed' ? sum + Number(order.total || 0) : sum), 0),
)

const saveUsers = () => {
  saveStoredUsers(users.value)
}

const refreshAdminData = () => {
  users.value = getUsers()
  sellerProducts.value = getSellerProducts()
  orders.value = getOrders()
}

const saveProducts = () => {
  saveSellerProducts(sellerProducts.value)
}

const deleteProduct = (id) => {
  sellerProducts.value = sellerProducts.value.filter((product) => product.id !== id)
  saveProducts()
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

const getOrderOptionText = (order) => {
  const parts = []
  if (order.selectedVariation) parts.push(`Variation: ${order.selectedVariation}`)
  if (order.selectedAddons?.length) {
    parts.push(`Add-ons: ${order.selectedAddons.map((addon) => addon.label).join(', ')}`)
  }
  return parts.join(' | ')
}

const viewReceipt = (order) => {
  selectedReceiptOrder.value = order
  receiptDialog.value = true
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'

  return new Intl.DateTimeFormat('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString))
}

const isWithinReportDateRange = (dateString) => {
  if (!dateString) return true

  const orderTime = new Date(dateString).getTime()
  const startTime = reportStartDate.value ? new Date(`${reportStartDate.value}T00:00:00`).getTime() : null
  const endTime = reportEndDate.value ? new Date(`${reportEndDate.value}T23:59:59`).getTime() : null

  if (startTime && orderTime < startTime) return false
  if (endTime && orderTime > endTime) return false
  return true
}

const getFilteredOrdersForReport = () =>
  orders.value.filter((order) => {
    const matchesSeller = !reportSellerFilter.value || order.vendor === reportSellerFilter.value
    const matchesStatus = !reportStatusFilter.value || order.status === reportStatusFilter.value
    return matchesSeller && matchesStatus && isWithinReportDateRange(order.createdAt)
  })

const getFilteredProductsForReport = () =>
  sellerProducts.value.filter((product) => {
    if (!reportSellerFilter.value) return true
    return (product.vendor || product.seller) === reportSellerFilter.value
  })

const clearReportFilters = () => {
  reportSellerFilter.value = null
  reportStatusFilter.value = null
  reportStartDate.value = ''
  reportEndDate.value = ''
  generatedReport.value = null
}

const createMarketplaceSummaryReport = () => ({
  title: 'Marketplace Summary Report',
  columns: [
    { key: 'metric', label: 'Metric' },
    { key: 'value', label: 'Value' },
  ],
  rows: [
    { metric: 'Total Users', value: users.value.length },
    { metric: 'Buyers', value: users.value.filter((user) => user.role === 'buyer').length },
    { metric: 'Sellers', value: users.value.filter((user) => user.role === 'seller').length },
    { metric: 'Admins', value: users.value.filter((user) => user.role === 'admin').length },
    { metric: 'Seller Products', value: getFilteredProductsForReport().length },
    { metric: 'Active Products', value: getFilteredProductsForReport().filter((product) => product.active !== false).length },
    { metric: 'Filtered Orders', value: getFilteredOrdersForReport().length },
    {
      metric: 'Filtered Pending Payments',
      value: getFilteredOrdersForReport().filter((order) =>
        ['In Progress', 'Seller Confirmed', 'Item Sent'].includes(order.status),
      ).length,
    },
    {
      metric: 'Filtered Confirmed Sales',
      value: `RM ${getFilteredOrdersForReport()
        .reduce((sum, order) => (order.status === 'Completed' ? sum + Number(order.total || 0) : sum), 0)
        .toFixed(2)}`,
    },
  ],
})

const createUserReport = () => ({
  title: 'User Report',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
  ],
  rows: users.value.map((user) => ({
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '-',
    status: user.active === false ? 'Suspended' : 'Active',
  })),
})

const createProductReport = () => ({
  title: 'Product Report',
  columns: [
    { key: 'name', label: 'Product' },
    { key: 'seller', label: 'Seller' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Base Price' },
    { key: 'stock', label: 'Stock' },
    { key: 'variations', label: 'Variations' },
    { key: 'status', label: 'Status' },
  ],
  rows: getFilteredProductsForReport().map((product) => ({
    name: product.name,
    seller: product.vendor || product.seller || '-',
    category: product.category || '-',
    price: `RM ${Number(product.price || 0).toFixed(2)}`,
    stock: product.stock ?? 'Not set',
    variations: product.variations?.length || 0,
    status: product.active === false ? 'Hidden' : 'Active',
  })),
})

const createOrderPaymentReport = () => ({
  title: 'Order & Payment Report',
  columns: [
    { key: 'orderId', label: 'Order ID' },
    { key: 'productName', label: 'Product' },
    { key: 'vendor', label: 'Seller' },
    { key: 'quantity', label: 'Qty' },
    { key: 'options', label: 'Options' },
    { key: 'total', label: 'Total' },
    { key: 'status', label: 'Status' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'createdAt', label: 'Created At' },
  ],
  rows: getFilteredOrdersForReport().map((order) => ({
    orderId: order.id,
    productName: order.productName,
    vendor: order.vendor,
    quantity: order.quantity || 1,
    options: [
      order.selectedVariation ? `Variation: ${order.selectedVariation}` : '',
      order.selectedAddons?.length ? `Add-ons: ${order.selectedAddons.map((addon) => addon.label).join(', ')}` : '',
    ].filter(Boolean).join(' | ') || '-',
    total: `RM ${Number(order.total || 0).toFixed(2)}`,
    status: order.status,
    receipt: order.receiptFileName || (order.receipt ? 'Uploaded' : 'Not Uploaded'),
    createdAt: formatDateTime(order.createdAt),
  })),
})

const generateReport = () => {
  const reportFactories = {
    'marketplace-summary': createMarketplaceSummaryReport,
    'user-report': createUserReport,
    'product-report': createProductReport,
    'order-payment-report': createOrderPaymentReport,
  }

  const report = reportFactories[selectedReportType.value]?.()
  if (!report) return

  generatedReport.value = {
    ...report,
    generatedAt: formatDateTime(new Date().toISOString()),
  }

  $q.notify({
    color: 'primary',
    icon: 'summarize',
    message: `${generatedReport.value.title} generated.`,
    position: 'top',
  })
}

const escapeCsvValue = (value) => {
  const text = String(value ?? '')
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`

  return text
}

const exportReportCsv = () => {
  if (!generatedReport.value) return

  const header = generatedReport.value.columns.map((column) => escapeCsvValue(column.label)).join(',')
  const rows = generatedReport.value.rows.map((row) =>
    generatedReport.value.columns.map((column) => escapeCsvValue(row[column.key])).join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const filename = `${selectedReportType.value}-${new Date().toISOString().slice(0, 10)}.csv`

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  $q.notify({
    color: 'positive',
    icon: 'download',
    message: `${generatedReport.value.title} exported to CSV.`,
    position: 'top',
  })
}

const updateAdminOrderStatus = (orderId, status) => {
  orders.value = updateOrderStatus(orderId, status)
  $q.notify({
    color: status === 'Completed' ? 'positive' : status === 'Refunded' ? 'warning' : 'negative',
    icon: status === 'Completed' ? 'check_circle' : status === 'Refunded' ? 'undo' : 'cancel',
    message: `Order marked as ${status}.`,
    position: 'top',
  })
}

onMounted(() => {
  window.addEventListener('upnm-supabase-cache-updated', refreshAdminData)
})

onBeforeUnmount(() => {
  window.removeEventListener('upnm-supabase-cache-updated', refreshAdminData)
})
</script>
