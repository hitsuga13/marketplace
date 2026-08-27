<!-- Purpose: Seller dashboard for shop summary, product posting/editing, stock, options, buyer orders, receipts, and replies. -->
<template>
  <q-page class="role-page seller-page">
    <section class="seller-shop-shell">
      <div class="seller-shop-main">
        <q-card flat class="seller-shop-profile">
          <q-card-section class="seller-shop-info">
            <q-avatar size="132px" class="seller-shop-logo">
              <img v-if="currentUser?.avatar" :src="currentUser.avatar" alt="Seller profile" />
              <q-icon v-else name="storefront" size="68px" />
            </q-avatar>
            <div class="seller-shop-copy">
              <div class="seller-shop-name">
                <span>{{ currentUser?.name || 'Campus Seller' }}</span>
                <q-icon
                  v-if="isSellerVerified(currentUser)"
                  name="check_circle"
                  color="primary"
                  size="24px"
                  class="verified-seller-mark"
                />
              </div>
              <div class="seller-shop-subtitle">UPNM student marketplace seller</div>
              <div class="seller-shop-stats">
                <span><q-icon name="place" /> UPNM Campus</span>
                <span><q-icon name="inventory_2" /> {{ myProducts.length }} Products</span>
                <span><q-icon name="chat" /> {{ conversations.length }} Chats</span>
                <span><q-icon name="receipt_long" /> {{ sellerOrders.length }} Orders</span>
              </div>
            </div>
            <div class="row q-gutter-sm">
              <q-btn
                outline
                color="primary"
                icon="storefront"
                label="Store Profile"
                @click="openStoreProfile"
              />
              <q-btn
                unelevated
                color="primary"
                icon="add_box"
                label="Add Product"
                @click="openAddProduct"
              />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat class="seller-products-panel">
          <q-card-section>
            <div class="seller-products-toolbar">
              <div>
                <div class="text-h6 text-weight-bold">Buyer Orders</div>
                <div class="text-grey-7">Review receipts and confirm buyer payments.</div>
              </div>
              <q-chip
                color="primary"
                text-color="white"
                icon="pending_actions"
                :label="`${pendingOrders.length} Pending`"
              />
            </div>

            <q-list v-if="sellerOrders.length" separator class="q-mt-md seller-order-list">
              <q-item v-for="order in sellerOrders" :key="order.id" class="seller-order-item">
                <q-item-section avatar>
                  <q-avatar square rounded>
                    <img :src="getImageSrc(order.image)" :alt="order.productName" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ order.productName }}</q-item-label>
                  <q-item-label caption>
                    Qty {{ order.quantity || 1 }} - RM {{ Number(order.total || 0).toFixed(2) }}
                  </q-item-label>
                  <q-item-label v-if="getOrderOptionText(order)" caption>
                    {{ getOrderOptionText(order) }}
                  </q-item-label>
                  <q-item-label caption class="text-primary">
                    {{ getPaymentMethodLabel(order.paymentMethod) }} -
                    {{ order.paymentReference || 'No reference' }}
                  </q-item-label>
                  <q-item-label caption>{{ formatDate(order.createdAt) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip
                    dense
                    :color="getStatusColor(order.status)"
                    text-color="white"
                    :label="order.status"
                  />
                </q-item-section>
                <q-item-section side class="seller-order-actions">
                  <q-btn
                    outline
                    dense
                    color="primary"
                    icon="receipt"
                    label="Receipt"
                    no-caps
                    @click="viewReceipt(order)"
                  />
                  <q-btn
                    v-if="order.status === 'In Progress'"
                    dense
                    unelevated
                    color="primary"
                    icon="check_circle"
                    label="Confirm"
                    no-caps
                    @click="updateOrderStatus(order.id, 'Seller Confirmed')"
                  />
                  <q-btn
                    v-if="order.status === 'Seller Confirmed'"
                    dense
                    unelevated
                    color="positive"
                    icon="local_shipping"
                    label="Item Sent"
                    no-caps
                    @click="updateOrderStatus(order.id, 'Item Sent')"
                  />
                  <q-btn
                    v-if="order.status === 'In Progress'"
                    dense
                    flat
                    color="negative"
                    icon="cancel"
                    label="Reject"
                    no-caps
                    @click="updateOrderStatus(order.id, 'Rejected')"
                  />
                </q-item-section>
              </q-item>
            </q-list>

            <q-banner v-else class="role-banner q-mt-md"> No buyer orders yet. </q-banner>
          </q-card-section>
        </q-card>

        <q-card flat class="seller-products-panel">
          <q-card-section>
            <div class="seller-products-toolbar">
              <div>
                <div class="text-h6 text-weight-bold">Seller Products</div>
                <div class="text-grey-7">Manage availability, images, and listed products.</div>
              </div>
              <q-input
                v-model="productSearch"
                outlined
                dense
                placeholder="Search products..."
                class="seller-product-search"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
              </q-input>
            </div>

            <div class="seller-product-grid q-mt-lg">
              <q-card flat bordered class="seller-add-card" @click="openAddProduct">
                <q-icon name="add_circle" size="58px" color="primary" />
                <div class="text-subtitle1 text-weight-bold q-mt-sm">Add Product</div>
                <div class="text-caption text-grey-7 text-center">
                  Upload image and list a new item
                </div>
              </q-card>

              <q-card
                v-for="product in filteredProducts"
                :key="product.id"
                flat
                bordered
                class="seller-product-card"
                @click="openEditProduct(product)"
              >
                <q-img
                  :src="getImageSrc(product.image)"
                  :alt="product.name"
                  ratio="1"
                  fit="cover"
                />
                <q-card-section class="text-center">
                  <div class="text-subtitle2 text-weight-bold ellipsis">{{ product.name }}</div>
                  <div class="text-caption text-grey-7">
                    {{ getCategoryLabel(product.category) }}
                  </div>
                  <div class="text-caption text-grey-7">{{ getStockLabel(product) }}</div>
                  <div class="seller-product-price">
                    RM {{ Number(product.price || 0).toFixed(2) }}
                  </div>
                  <q-toggle
                    v-model="product.active"
                    color="primary"
                    :label="product.active ? 'Active' : 'Hidden'"
                    size="sm"
                    @click.stop
                    @update:model-value="saveProducts"
                  />
                </q-card-section>
                <q-card-actions align="center" class="q-pb-md">
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="edit"
                    @click.stop="openEditProduct(product)"
                  />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    @click.stop="deleteProduct(product.id)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <aside class="seller-side-column">
        <q-card flat class="seller-owner-card">
          <q-card-section class="text-center">
            <div class="text-subtitle1 text-weight-bold">Shop Owner</div>
            <q-avatar size="128px" class="q-mt-md seller-owner-avatar">
              <img v-if="currentUser?.avatar" :src="currentUser.avatar" alt="Shop owner" />
              <q-icon v-else name="person" size="70px" color="primary" />
            </q-avatar>
            <div class="text-weight-bold q-mt-md row items-center justify-center q-gutter-xs">
              <span>{{ currentUser?.name || 'Seller' }}</span>
              <q-icon
                v-if="isSellerVerified(currentUser)"
                name="check_circle"
                color="primary"
                size="18px"
              />
            </div>
            <div class="text-grey-7">{{ currentUser?.email }}</div>
          </q-card-section>
        </q-card>

        <q-card flat class="seller-owner-card q-mt-md">
          <q-card-section>
            <div class="text-subtitle1 text-weight-bold">Chat Inbox</div>
            <q-list separator class="q-mt-sm">
              <q-item
                v-for="conversation in conversations"
                :key="conversation.conversationId"
                clickable
                @click="openConversation(conversation)"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white" icon="chat" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ conversation.buyerName }}</q-item-label>
                  <q-item-label caption>
                    {{ conversation.productName }} - {{ conversation.lastMessage }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-banner v-if="conversations.length === 0" class="role-banner q-mt-md">
              No chat messages yet.
            </q-banner>
          </q-card-section>
        </q-card>
      </aside>
    </section>

    <q-dialog v-model="addProductDialog">
      <q-card class="seller-product-dialog">
        <q-card-section>
          <div class="text-h6 text-weight-bold">
            {{ editingProductId ? 'Edit Product' : 'Add Product' }}
          </div>
          <div class="text-grey-7">Fill in product details and upload your product image.</div>

          <div class="seller-upload-preview q-mt-md">
            <q-img v-if="form.image" :src="getImageSrc(form.image)" ratio="1" fit="cover" />
            <div v-else class="seller-upload-empty">
              <q-icon name="image" size="48px" color="primary" />
              <div>Product image preview</div>
            </div>
            <div class="seller-upload-actions">
              <input
                ref="productImageInput"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="handleProductImage"
              />
              <q-btn
                unelevated
                color="primary"
                icon="photo_camera"
                :label="form.image ? 'Resize photo' : 'Upload photo'"
                no-caps
                @click="openProductCropper"
              />
            </div>
          </div>

          <q-input v-model="form.name" outlined dense label="Product name" class="q-mt-md" />
          <q-select
            v-model="form.category"
            outlined
            dense
            label="Category"
            :options="categoryOptions"
            emit-value
            map-options
            class="q-mt-md"
          />
          <q-input
            v-model="form.price"
            outlined
            dense
            label="Price (RM)"
            type="number"
            class="q-mt-md"
          />
          <q-input
            v-model="form.stock"
            outlined
            dense
            label="Stock quantity"
            type="number"
            min="0"
            class="q-mt-md"
          />
          <div class="text-caption text-grey-7 q-mt-xs">
            This is the base price. Variation and add-on prices are added on top of this price.
          </div>

          <div class="seller-addon-editor q-mt-md">
            <div class="seller-addon-editor__top">
              <div>
                <div class="text-subtitle2 text-weight-bold">Variation Options</div>
                <div class="text-caption text-grey-7">
                  Example: Carbonara or Bolognese. Add an extra price only if the option costs more.
                </div>
              </div>
              <div class="seller-addon-editor__buttons">
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  label="Add Variation"
                  no-caps
                  @click="addVariation()"
                />
              </div>
            </div>

            <div v-if="form.variations.length" class="seller-addon-list q-mt-sm">
              <div
                v-for="(variation, index) in form.variations"
                :key="index"
                class="seller-addon-row"
              >
                <q-input
                  v-model="variation.label"
                  outlined
                  dense
                  label="Variation name"
                  placeholder="Example: Carbonara"
                />
                <q-input
                  v-model="variation.price"
                  outlined
                  dense
                  type="number"
                  label="Extra price (RM)"
                  placeholder="0.00"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  aria-label="Remove variation"
                  @click="removeVariation(index)"
                />
              </div>
            </div>

            <q-banner v-else class="role-banner q-mt-sm">
              No variations yet. Add one if buyers must choose a type before buying.
            </q-banner>
          </div>

          <div class="seller-addon-editor q-mt-md">
            <div class="seller-addon-editor__top">
              <div>
                <div class="text-subtitle2 text-weight-bold">Add-on Options</div>
                <div class="text-caption text-grey-7">
                  Example: Sos, extra cheese, COD, or any option with additional price.
                </div>
              </div>
              <div class="seller-addon-editor__buttons">
                <q-btn
                  unelevated
                  color="primary"
                  icon="add"
                  label="Add Option"
                  no-caps
                  @click="addAddon()"
                />
              </div>
            </div>

            <div v-if="form.addons.length" class="seller-addon-list q-mt-sm">
              <div v-for="(addon, index) in form.addons" :key="index" class="seller-addon-row">
                <q-input
                  v-model="addon.label"
                  outlined
                  dense
                  label="Option name"
                  placeholder="Example: Sos"
                />
                <q-input
                  v-model="addon.price"
                  outlined
                  dense
                  type="number"
                  label="Extra price (RM)"
                  placeholder="0.00"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  aria-label="Remove add-on option"
                  @click="removeAddon(index)"
                />
              </div>
            </div>

            <q-banner v-else class="role-banner q-mt-sm">
              No add-on options yet. Add one if buyers can choose extras.
            </q-banner>
          </div>
          <q-input
            v-model="form.desc1"
            outlined
            dense
            label="Description"
            type="textarea"
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat color="grey-7" label="Cancel" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            :icon="editingProductId ? 'save' : 'add_box'"
            :label="editingProductId ? 'Save Product' : 'Post Product'"
            @click="saveProductForm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <ImageCropDialog
      v-model="productCropDialog"
      :source="productCropSource"
      shape="square"
      title="Preview Product Photo"
      :output-size="640"
      :quality="0.72"
      @confirm="applyProductCrop"
      @select-another="selectAnotherProductPhoto"
    />

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
            Receipt uploaded as {{ selectedReceiptOrder?.receiptFileName || 'file' }}. Image preview
            is only available for image receipts.
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="chatDialog">
      <q-card class="role-dialog-card">
        <q-card-section>
          <div class="text-h6">{{ activeConversation?.buyerName }}</div>
          <div class="text-grey-7">{{ activeConversation?.productName }}</div>

          <div class="chat-thread q-mt-md">
            <div
              v-for="message in activeConversationMessages"
              :key="message.id"
              :class="['chat-bubble', isOwnChatMessage(message) ? 'own' : 'other']"
            >
              {{ message.text }}
            </div>
          </div>

          <q-input v-model="replyText" outlined dense placeholder="Type reply..." class="q-mt-md">
            <template v-slot:append>
              <q-btn flat round dense icon="send" color="primary" @click="sendReply" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ImageCropDialog from 'src/components/ImageCropDialog.vue'
import { getUploadSizeError } from 'src/utils/fileValidation'
import { normalizeStoredImage } from 'src/utils/assets'
import { getPaymentMethodLabel } from 'src/utils/paymentGateway'
import {
  addMessage,
  getConversationSummaries,
  getCurrentUser,
  getProductStock,
  getSellerOrders,
  getSellerProducts,
  isVerifiedSeller,
  fetchOrderReceipt,
  saveSellerProducts,
  subscribeToChatMessages,
  updateOrderStatus as updateStoredOrderStatus,
} from 'src/database'

const $q = useQuasar()
const router = useRouter()
const currentUser = ref(getCurrentUser())
const sellerProducts = ref(getSellerProducts())
const addProductDialog = ref(false)
const chatDialog = ref(false)
const receiptDialog = ref(false)
const activeConversation = ref(null)
const selectedReceiptOrder = ref(null)
const replyText = ref('')
const productSearch = ref('')
const productImageInput = ref(null)
const productCropDialog = ref(false)
const productCropSource = ref('')
const editingProductId = ref(null)
const buyerOrders = ref(getSellerOrders(currentUser.value?.name))
const getImageSrc = (src) => normalizeStoredImage(src)
const isSellerVerified = (seller) => isVerifiedSeller(seller)
let unsubscribeChatRealtime = null

const categoryOptions = [
  { label: 'Food & Beverages', value: 'FnB' },
  { label: 'Services', value: 'Services' },
  { label: 'Thrift', value: 'Thrift' },
]

const emptyForm = () => ({
  name: '',
  category: 'FnB',
  price: '',
  stock: '',
  image: '',
  desc1: '',
  variations: [],
  addons: [],
})

const form = ref(emptyForm())

const myProducts = computed(() =>
  sellerProducts.value.filter((product) => product.sellerId === currentUser.value?.id),
)
const filteredProducts = computed(() => {
  const query = productSearch.value.trim().toLowerCase()
  if (!query) return myProducts.value

  return myProducts.value.filter(
    (product) =>
      product.name.toLowerCase().includes(query) ||
      getCategoryLabel(product.category).toLowerCase().includes(query),
  )
})
const conversations = computed(() => getConversationSummaries(currentUser.value?.name || ''))
const activeConversationMessages = computed(() => activeConversation.value?.messages || [])
const sellerOrders = computed(() => buyerOrders.value)
const pendingOrders = computed(() =>
  sellerOrders.value.filter((order) => order.status === 'In Progress'),
)

const getCategoryLabel = (category) =>
  category === 'FnB' ? 'Food & Beverages' : category || 'General'
const getStockLabel = (product) => {
  const stock = getProductStock(product)
  if (stock === null) return 'Stock not set'
  if (stock === 0) return 'Out of stock'
  return `${stock} in stock`
}
const getOrderOptionText = (order) => {
  const parts = []
  if (order.selectedVariation) parts.push(`Variation: ${order.selectedVariation}`)
  if (order.selectedAddons?.length) {
    parts.push(`Add-ons: ${order.selectedAddons.map((addon) => addon.label).join(', ')}`)
  }
  return parts.join(' | ')
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
const formatDate = (dateString) =>
  new Intl.DateTimeFormat('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))

const saveProducts = () => {
  saveSellerProducts(sellerProducts.value)
}

const openStoreProfile = () => {
  if (currentUser.value?.id) router.push(`/seller-profile/${currentUser.value.id}`)
}

const openAddProduct = () => {
  form.value = emptyForm()
  if (productImageInput.value) productImageInput.value.value = ''
  editingProductId.value = null
  addProductDialog.value = true
}

const openEditProduct = (product) => {
  editingProductId.value = product.id
  form.value = {
    name: product.name,
    category: product.category,
    price: product.price,
    stock: product.stock ?? '',
    image: product.image,
    desc1: product.desc1,
    variations: product.variations ? product.variations.map((variation) => ({ ...variation })) : [],
    addons: product.addons ? product.addons.map((addon) => ({ ...addon })) : [],
  }
  if (productImageInput.value) productImageInput.value.value = ''
  addProductDialog.value = true
}

const openProductCropper = () => {
  if (form.value.image) {
    productCropSource.value = form.value.image
    productCropDialog.value = true
    return
  }

  productImageInput.value?.click()
}

const selectAnotherProductPhoto = () => {
  productImageInput.value?.click()
}

const handleProductImage = (eventOrFile) => {
  const file = eventOrFile?.target?.files?.[0] || eventOrFile
  if (!file) return

  const uploadError = getUploadSizeError(file, 'product image')
  if (uploadError) {
    if (productImageInput.value) productImageInput.value.value = ''
    $q.notify({
      type: 'negative',
      message: uploadError,
      position: 'top',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    productCropSource.value = reader.result
    productCropDialog.value = true
    if (productImageInput.value) productImageInput.value.value = ''
  }
  reader.readAsDataURL(file)
}

const applyProductCrop = (croppedImage) => {
  form.value.image = croppedImage
}

const addAddon = (label = '', price = 0) => {
  form.value.addons.push({ label, price })
}

const removeAddon = (index) => {
  form.value.addons.splice(index, 1)
}

const addVariation = (label = '', price = 0) => {
  form.value.variations.push({ label, price })
}

const removeVariation = (index) => {
  form.value.variations.splice(index, 1)
}

const getCleanVariations = () =>
  form.value.variations
    .map((variation) => ({
      label: variation.label.trim(),
      price: Number(variation.price || 0),
    }))
    .filter((variation) => variation.label)

const getCleanAddons = () =>
  form.value.addons
    .map((addon) => ({
      label: addon.label.trim(),
      price: Number(addon.price || 0),
    }))
    .filter((addon) => addon.label)

const saveProductForm = () => {
  if (
    !form.value.name.trim() ||
    !form.value.desc1.trim() ||
    !form.value.image ||
    form.value.stock === ''
  ) {
    $q.notify({
      type: 'negative',
      message: 'Please fill product name, stock, description, and upload an image.',
      position: 'top',
    })
    return
  }

  const wasEditing = Boolean(editingProductId.value)
  const variations = getCleanVariations()
  const addons = getCleanAddons()
  const stock = Math.max(0, Number(form.value.stock || 0))

  if (wasEditing) {
    sellerProducts.value = sellerProducts.value.map((product) =>
      product.id === editingProductId.value
        ? {
            ...product,
            category: form.value.category,
            name: form.value.name.trim(),
            image: form.value.image,
            price: Number(form.value.price || 0),
            stock,
            desc1: form.value.desc1.trim(),
            variations,
            addons,
          }
        : product,
    )
  } else {
    sellerProducts.value.unshift({
      id: `seller-${Date.now()}`,
      sellerId: currentUser.value?.id,
      seller: currentUser.value?.name || 'Campus Seller',
      vendor: currentUser.value?.name || 'Campus Seller',
      category: form.value.category,
      name: form.value.name.trim(),
      image: form.value.image,
      price: Number(form.value.price || 0),
      stock,
      desc1: form.value.desc1.trim(),
      variations,
      addons,
      active: true,
    })
  }
  saveProducts()
  addProductDialog.value = false
  form.value = emptyForm()
  if (productImageInput.value) productImageInput.value.value = ''
  editingProductId.value = null
  $q.notify({
    color: 'primary',
    icon: 'check_circle',
    message: wasEditing ? 'Product updated.' : 'Product saved.',
    position: 'top',
  })
}

const deleteProduct = (id) => {
  sellerProducts.value = sellerProducts.value.filter((product) => product.id !== id)
  saveProducts()
}

const openConversation = (conversation) => {
  activeConversation.value = conversation
  chatDialog.value = true
}

const isOwnChatMessage = (message) => message.senderRole === currentUser.value?.role

const updateOrderStatus = (orderId, status) => {
  updateStoredOrderStatus(orderId, status)
  refreshSellerData()
  const statusFeedback = {
    'Seller Confirmed': {
      color: 'positive',
      icon: 'check_circle',
      message: 'Order confirmed. Mark it as sent once the item has been delivered.',
    },
    'Item Sent': {
      color: 'positive',
      icon: 'local_shipping',
      message: 'Item marked as sent. Waiting for buyer to confirm received.',
    },
    Rejected: {
      color: 'negative',
      icon: 'cancel',
      message: 'Order rejected.',
    },
  }
  const feedback = statusFeedback[status] || {
    color: 'primary',
    icon: 'info',
    message: `Order marked as ${status}.`,
  }

  $q.notify({
    color: feedback.color,
    icon: feedback.icon,
    message: feedback.message,
    position: 'top',
  })
}

const refreshSellerData = () => {
  const activeConversationId = activeConversation.value?.conversationId

  currentUser.value = getCurrentUser()
  sellerProducts.value = getSellerProducts()
  buyerOrders.value = getSellerOrders(currentUser.value?.name)

  if (activeConversationId) {
    activeConversation.value =
      getConversationSummaries(currentUser.value?.name || '').find(
        (item) => item.conversationId === activeConversationId,
      ) || activeConversation.value
  }
}

const viewReceipt = async (order) => {
  selectedReceiptOrder.value = order
  receiptDialog.value = true

  if (order.receipt) return

  const receiptData = await fetchOrderReceipt(order.id)
  if (receiptData) {
    selectedReceiptOrder.value = {
      ...order,
      ...receiptData,
    }
  }
}

const sendReply = () => {
  if (!replyText.value.trim() || !activeConversation.value) return

  const buyer = {
    id: activeConversation.value.messages[0].buyerId,
    name: activeConversation.value.buyerName,
  }
  const product = {
    id: activeConversation.value.messages[0].productId,
    name: activeConversation.value.productName,
    vendor: currentUser.value.name,
  }

  addMessage({
    conversationId: activeConversation.value.conversationId,
    product,
    buyer,
    senderRole: 'seller',
    text: replyText.value.trim(),
  })

  activeConversation.value = getConversationSummaries(currentUser.value.name).find(
    (item) => item.conversationId === activeConversation.value.conversationId,
  )
  replyText.value = ''
}

onMounted(() => {
  unsubscribeChatRealtime = subscribeToChatMessages()
  window.addEventListener('upnm-supabase-cache-updated', refreshSellerData)
  window.addEventListener('upnm-chat-updated', refreshSellerData)
})

onBeforeUnmount(() => {
  if (unsubscribeChatRealtime) unsubscribeChatRealtime()
  window.removeEventListener('upnm-supabase-cache-updated', refreshSellerData)
  window.removeEventListener('upnm-chat-updated', refreshSellerData)
})
</script>
