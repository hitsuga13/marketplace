<!-- Purpose: Public marketplace menu page for browsing, searching, product details, chat, cart, and buy-now flow. -->
<template>
  <q-page class="home-page">
    <section class="hero-section">
      <div class="hero-media">
        <img
          :src="getPublicAsset('icons/f&b.jpg')"
          alt="UPNM Campus Marketplace featured food and campus items"
        />
      </div>

      <div class="hero-content">
        <q-badge color="secondary" text-color="dark" class="q-mb-md" label="Campus marketplace" />
        <h1>UPNM Campus Marketplace</h1>
        <p>
          Discover student-run food, reliable campus services, and thrift finds around UPNM in one
          quick place.
        </p>

        <div class="row q-col-gutter-sm hero-actions">
          <div class="col-12 col-sm-auto">
            <q-btn
              outline
              color="white"
              icon="storefront"
              label="Browse All"
              @click="scrollToMarketplace('All')"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="category-band">
      <div class="page-shell">
        <div class="section-heading">
          <div>
            <q-badge color="secondary" text-color="dark" label="All" />
            <h2>All Campus Items</h2>
          </div>
          <p>Showing actual real-time availability from student vendors.</p>
        </div>

        <div class="row q-col-gutter-lg">
          <div v-for="category in categories" :key="category.title" class="col-12 col-md-4">
            <q-card class="category-card" flat bordered>
              <q-img
                :src="getImageSrc(category.image)"
                :alt="category.title"
                ratio="4/3"
                :img-attrs="{ loading: 'lazy', decoding: 'async' }"
              />
              <q-card-section>
                <div class="row items-center no-wrap">
                  <q-icon :name="category.icon" color="primary" size="28px" class="q-mr-sm" />
                  <div class="text-h6">{{ category.title }}</div>
                </div>
                <p class="q-mt-sm text-grey-8">{{ category.description }}</p>
              </q-card-section>
              <q-card-actions class="q-px-md q-pb-md">
                <q-btn
                  unelevated
                  color="primary"
                  :label="category.cta"
                  @click="scrollToMarketplace(category.filterTarget)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <section
      id="marketplace-display"
      class="spotlight-band q-pt-xl"
      style="scroll-margin-top: 130px"
    >
      <div class="page-shell">
        <div class="section-heading">
          <div>
            <q-badge
              color="secondary"
              text-color="dark"
              :label="activeSearch ? 'Search Results' : getCategoryLabel(activeCategory)"
            />

            <h2>
              {{
                activeSearch
                  ? `Results for "${activeSearch}"`
                  : activeCategory === 'All'
                    ? 'All Campus Items'
                    : getCategoryLabel(activeCategory)
              }}
            </h2>
          </div>
          <p v-if="activeSearch">Found {{ filteredItems.length }} item(s) matching your search.</p>
          <p v-else>Showing actual real-time availability from student vendors.</p>
        </div>

        <div class="row q-mb-xl justify-center">
          <q-btn-toggle
            v-model="activeCategory"
            toggle-color="primary"
            flat
            stretch
            unelevated
            :options="tabOptions"
            @update:model-value="handleTabToggle"
          />
        </div>

        <div class="row q-col-gutter-md">
          <div v-for="item in filteredItems" :key="item.id" class="col-12 col-sm-6 col-lg-3">
            <q-card
              class="product-card cursor-pointer hover-shadow"
              flat
              bordered
              @click="showDetails(item)"
            >
              <q-img :src="getImageSrc(item.image)" :alt="item.name" ratio="1" fit="cover" />
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold ellipsis">{{ item.name }}</div>
                <div class="text-caption text-grey-7">{{ getCategoryLabel(item.category) }}</div>
                <div
                  :class="[
                    'text-caption',
                    isProductOutOfStock(item) ? 'text-negative' : 'text-grey-7',
                  ]"
                >
                  {{ getStockLabel(item) }}
                </div>

                <div class="price text-primary text-bold q-mt-sm">
                  <span v-if="item.variations?.length > 0"
                    >From RM {{ Number(item.price || 0).toFixed(2) }}</span
                  >
                  <span v-else-if="item.price !== undefined"
                    >RM {{ Number(item.price).toFixed(2) }}</span
                  >
                  <span v-else class="text-caption text-grey-6 text-weight-regular"
                    >See Details</span
                  >
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div v-if="filteredItems.length === 0" class="col-12 text-center q-pa-xl text-grey-6">
            <q-icon name="storefront" size="60px" />
            <div class="text-h6 q-mt-sm">No items found matching this filter criteria.</div>
          </div>
        </div>
      </div>
    </section>

    <q-dialog v-model="detailsModal">
      <q-card class="detail-modal-card">
        <q-card-section class="row no-wrap q-pa-none full-height">
          <div class="col-6 bg-grey-2 flex flex-center relative-position">
            <q-img :src="getImageSrc(selectedItem.image)" class="detail-image" fit="contain" />
            <q-btn
              icon="close"
              flat
              round
              dense
              v-close-popup
              class="absolute-top-left q-ma-sm close-btn"
            />
          </div>

          <div class="col-6 q-pa-lg column no-wrap shadow-2 detail-info-panel">
            <div class="q-mb-md">
              <div class="text-overline text-primary">
                {{ getCategoryLabel(selectedItem.category) }}
              </div>
              <div class="text-h4 text-bold">{{ selectedItem.name }}</div>
            </div>

            <div class="col q-pr-md detail-scroll-area">
              <div class="detail-seller-row q-mb-md">
                <q-avatar size="44px" class="detail-seller-avatar">
                  <img
                    v-if="selectedSeller?.avatar"
                    :src="selectedSeller.avatar"
                    alt="Seller profile"
                  />
                  <q-icon v-else name="storefront" />
                </q-avatar>
                <div>
                  <div class="detail-seller-label">Seller</div>
                  <div class="detail-seller-name">
                    <span>{{ selectedItem.vendor || selectedItem.seller || 'Campus Seller' }}</span>
                    <q-icon
                      v-if="isSellerVerified(selectedSeller)"
                      name="verified"
                      color="primary"
                      size="18px"
                      class="verified-seller-mark"
                    />
                  </div>
                </div>
                <q-btn
                  v-if="selectedSeller?.id"
                  flat
                  dense
                  color="primary"
                  icon="storefront"
                  label="Store profile"
                  class="q-ml-auto"
                  @click="openSellerProfile"
                />
              </div>

              <div class="description-box q-mb-md text-body1 text-grey-9">
                {{ selectedItem.desc1 }}
              </div>

              <q-chip
                dense
                :color="isProductOutOfStock(selectedItem) ? 'negative' : 'primary'"
                text-color="white"
                icon="inventory_2"
                :label="getStockLabel(selectedItem)"
                class="q-mb-md"
              />

              <div v-if="selectedItem.variations?.length > 0" class="q-mb-md">
                <div class="text-subtitle2 q-mb-xs text-bold text-grey-9">Variation</div>
                <div class="text-caption text-grey-7 q-mb-sm">
                  Variation price is added on top of the base product price.
                </div>
                <div class="variation-scroll-container">
                  <div class="row q-gutter-xs">
                    <q-btn
                      v-for="v in selectedItem.variations"
                      :key="v.label"
                      :label="v.label"
                      :outline="selectedVar?.label !== v.label"
                      color="primary"
                      rounded
                      size="sm"
                      @click="selectVariation(v)"
                    />
                  </div>
                </div>
              </div>

              <div v-if="selectedItem.addons?.length > 0" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm text-bold text-grey-9">
                  Add-ons (Optional)
                  <span
                    v-if="selectedItem.variations?.length > 0 && !selectedVar"
                    class="text-caption text-negative q-ml-sm text-weight-regular"
                  >
                    *Select a variation first
                  </span>
                </div>
                <div class="variation-scroll-container">
                  <div class="row q-gutter-xs">
                    <q-btn
                      v-for="addon in selectedItem.addons"
                      :key="addon.label"
                      :label="`${addon.label} (+RM ${addon.price.toFixed(2)})`"
                      :outline="!isAddonSelected(addon)"
                      :color="isAddonSelected(addon) ? 'primary' : 'grey-8'"
                      :disable="selectedItem.variations?.length > 0 && !selectedVar"
                      @click="toggleAddon(addon)"
                      rounded
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="q-mt-md detail-actions">
              <div
                class="price-section q-py-md text-center bg-grey-1 rounded-borders q-mb-md"
                style="
                  border: 2px dashed #1976d2;
                  min-height: 110px;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                "
              >
                <div class="text-caption text-grey-7">Pricing Structure</div>

                <div
                  v-if="isPriceAvailable"
                  class="text-h3 text-bold text-primary q-px-sm"
                  style="line-height: 1.2"
                >
                  RM {{ finalPrice.toFixed(2) }}
                </div>
                <div
                  v-else-if="selectedItem.variations?.length > 0 && !selectedVar"
                  class="text-h5 text-bold text-negative q-px-sm"
                >
                  Select Variation
                </div>
                <div v-else class="text-subtitle1 text-bold text-grey-7 q-px-sm">
                  Refer to Description
                </div>
              </div>

              <div class="row q-gutter-sm no-wrap">
                <q-btn
                  outline
                  color="primary"
                  icon="chat"
                  label="Chat"
                  class="col-auto"
                  style="min-width: 80px"
                  @click="openChat"
                />
                <q-btn
                  outline
                  color="primary"
                  icon="shopping_cart"
                  label="ADD"
                  class="col"
                  :disable="isProductOutOfStock(selectedItem)"
                  @click="handleAddToCart"
                />
                <q-btn
                  unelevated
                  color="primary"
                  label="BUY NOW"
                  class="col-5 text-bold"
                  :disable="isProductOutOfStock(selectedItem)"
                  @click="handleBuyNow"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="chatDialog">
      <q-card class="login-required-card">
        <q-card-section>
          <div class="text-h6">Chat with {{ selectedItem.vendor || 'Campus Vendor' }}</div>
          <div class="chat-thread q-mt-md">
            <div
              v-for="message in activeMessages"
              :key="message.id"
              :class="['chat-bubble', message.senderRole === 'buyer' ? 'buyer' : 'seller']"
            >
              {{ message.text }}
            </div>
            <div v-if="activeMessages.length === 0" class="text-grey-7 text-center">
              Start a conversation about {{ selectedItem.name }}.
            </div>
          </div>
          <q-input v-model="chatText" outlined dense placeholder="Type message..." class="q-mt-md">
            <template v-slot:append>
              <q-btn flat round dense icon="send" color="primary" @click="sendChat" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="loginRequiredDialog">
      <q-card class="login-required-card">
        <q-card-section class="text-center q-pa-lg">
          <q-avatar color="primary" text-color="white" size="58px">
            <q-icon name="lock" size="32px" />
          </q-avatar>
          <div class="text-h6 text-weight-bold q-mt-md">Please login first</div>
          <p class="text-grey-7 q-mt-sm q-mb-none">
            You need to sign in or sign up as a buyer before adding products to cart.
          </p>
        </q-card-section>

        <q-card-actions align="center" class="q-px-lg q-pb-lg">
          <q-btn flat color="grey-7" label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" icon="login" label="Go to Sign in" @click="goToLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="paymentDialog">
      <q-card class="payment-qr-card">
        <q-card-section class="text-center">
          <q-avatar color="primary" text-color="white" size="58px">
            <q-icon name="qr_code_2" size="34px" />
          </q-avatar>
          <div class="text-h6 text-weight-bold q-mt-md">Pay Seller via QR</div>
          <div class="text-grey-7 row items-center justify-center q-gutter-xs">
            <span>{{ selectedItem.vendor || 'Campus Seller' }}</span>
            <q-icon
              v-if="isSellerVerified(selectedSeller)"
              name="verified"
              color="primary"
              size="16px"
            />
          </div>
          <div class="text-h5 text-primary text-weight-bold q-mt-sm">
            RM {{ finalPrice.toFixed(2) }}
          </div>

          <div class="payment-qr-box q-mt-md">
            <q-img v-if="sellerPaymentQr" :src="sellerPaymentQr" ratio="1" fit="contain" />
            <div v-else class="payment-qr-empty">
              <q-icon name="qr_code_2" size="54px" color="grey-5" />
              <div>This seller has not uploaded a payment QR yet.</div>
            </div>
          </div>

          <p class="text-grey-7 q-mt-md q-mb-md">
            Scan the QR, complete payment, upload your receipt, then click the button below.
          </p>

          <input
            ref="receiptInput"
            type="file"
            accept="image/*,.pdf"
            class="hidden-file-input"
            @change="handleReceiptUpload"
          />
          <q-btn
            outline
            color="primary"
            icon="upload_file"
            no-caps
            class="receipt-upload-btn"
            :label="receiptFileName || 'Upload payment receipt'"
            @click="receiptInput?.click()"
          />
        </q-card-section>
        <q-card-actions align="center" class="q-px-md q-pb-md">
          <q-btn flat color="grey-7" label="Cancel" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="check_circle"
            label="I have paid"
            :disable="!paymentReceipt"
            @click="confirmBuyNowPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getUploadSizeError } from 'src/utils/fileValidation'
import { getPublicAsset, normalizeStoredImage } from 'src/utils/assets'
import {
  addMessage,
  addToCart,
  createOrder,
  getConversationId,
  getCurrentUser,
  getProductStock,
  getProductMessages,
  getProducts,
  getSellerForProduct,
  isVerifiedSeller,
  isProductOutOfStock,
  decreaseProductStock,
  subscribeToChatMessages,
} from 'src/database'

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const activeCategory = ref('All')
const activeSearch = ref('')
const loginRequiredDialog = ref(false)
const chatDialog = ref(false)
const paymentDialog = ref(false)
const chatText = ref('')
const paymentReceipt = ref('')
const receiptFileName = ref('')
const receiptInput = ref(null)
const databaseVersion = ref(0)
let unsubscribeProductChatRealtime = null

// This dynamically changes the tab text if a search is active!
const tabOptions = computed(() => [
  { label: activeSearch.value ? `Search: "${activeSearch.value}"` : 'All Items', value: 'All' },
  { label: 'Food & Beverages', value: 'FnB' },
  { label: 'Services', value: 'Services' },
  { label: 'Thrift', value: 'Thrift' },
])

const categories = [
  {
    title: 'Services',
    description: 'Printing, laminating, runners, and practical help from students nearby.',
    image: 'icons/services_3.jpg',
    icon: 'design_services',
    cta: 'Find Services',
    filterTarget: 'Services',
  },
  {
    title: 'Food & Beverages',
    description: 'Affordable meals, snacks, and quick cravings delivered around campus.',
    image: 'icons/f&b_2.jpg',
    icon: 'restaurant',
    cta: 'See Menu',
    filterTarget: 'FnB',
  },
  {
    title: 'Thrift',
    description: 'Pre-loved streetwear, jerseys, sneakers, and accessories with character.',
    image: 'icons/thrift_3.jpg',
    icon: 'checkroom',
    cta: 'Shop Thrift',
    filterTarget: 'Thrift',
  },
]

const detailsModal = ref(false)
const selectedItem = ref({})
const selectedVar = ref(null)
const selectedAddons = ref([])
const activeMessages = computed(() => {
  databaseVersion.value
  const currentUser = getCurrentUser()
  if (!selectedItem.value?.id || !currentUser) return []
  return getProductMessages(getConversationId(selectedItem.value, currentUser))
})
const selectedSeller = computed(() => {
  databaseVersion.value
  return getSellerForProduct(selectedItem.value)
})
const sellerPaymentQr = computed(() => selectedSeller.value?.paymentQr || '')
const getImageSrc = (src) => normalizeStoredImage(src)
const isSellerVerified = (seller) => isVerifiedSeller(seller)

const getCategoryLabel = (catKey) => {
  if (catKey === 'FnB') return 'Food & Beverages'
  return catKey || 'General'
}

const getStockLabel = (item) => {
  const stock = getProductStock(item)
  if (stock === null) return 'Stock available'
  if (stock === 0) return 'Out of stock'
  return `${stock} in stock`
}

// Data Filter Calculations Engine
// Data Filter Calculations Engine
const filteredItems = computed(() => {
  databaseVersion.value
  let baseItems = getProducts().filter((item) => item.active !== false)

  // Use activeSearch instead of route.query directly
  if (activeSearch.value) {
    const searchLow = activeSearch.value.toLowerCase()
    return baseItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLow) ||
        (item.category && item.category.toLowerCase().includes(searchLow)) ||
        (item.vendor && item.vendor.toLowerCase().includes(searchLow)),
    )
  }

  if (activeCategory.value === 'All') return baseItems
  return baseItems.filter((item) => item.category === activeCategory.value)
})

const refreshMarketplaceData = () => {
  databaseVersion.value += 1

  if (selectedItem.value?.id) {
    const latestProduct = getProducts().find(
      (product) => String(product.id) === String(selectedItem.value.id),
    )
    if (latestProduct) selectedItem.value = { ...selectedItem.value, ...latestProduct }
  }
}

onMounted(() => {
  window.addEventListener('upnm-supabase-cache-updated', refreshMarketplaceData)
})

onBeforeUnmount(() => {
  if (unsubscribeProductChatRealtime) unsubscribeProductChatRealtime()
  window.removeEventListener('upnm-supabase-cache-updated', refreshMarketplaceData)
})

const isPriceAvailable = computed(() => {
  if (selectedItem.value.variations?.length > 0) {
    return selectedVar.value !== null
  }
  return selectedItem.value.price !== undefined
})

const finalPrice = computed(() => {
  if (!isPriceAvailable.value) return 0
  let base = selectedItem.value.price !== undefined ? Number(selectedItem.value.price || 0) : 0
  if (selectedVar.value && selectedVar.value.price !== undefined) {
    base += Number(selectedVar.value.price || 0)
  }
  selectedAddons.value.forEach((addon) => {
    base += Number(addon.price || 0)
  })
  return base
})

// === ANTI-JUMP SCROLLING & NAVIGATION LOGIC ===

const executeScrollAnimation = () => {
  setTimeout(() => {
    const targetElement = document.getElementById('marketplace-display')
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, 100)
}

// HELPER: Updates the URL silently in the background.
// This prevents Vue Router from firing its default "scroll to top" behavior.
const updateUrlSilently = (categoryVal) => {
  const url = new URL(globalThis.location.href)

  url.searchParams.delete('search') // <--- ADD THIS: Clears search from URL

  if (categoryVal === 'All') {
    url.searchParams.delete('category')
  } else {
    url.searchParams.set('category', categoryVal)
  }
  globalThis.history.replaceState({}, '', url)
}

const handleTabToggle = (val) => {
  activeSearch.value = '' // <--- ADD THIS: Clears search word
  updateUrlSilently(val)
}

const scrollToMarketplace = (categoryName) => {
  activeSearch.value = '' // <--- ADD THIS: Clears search word
  activeCategory.value = categoryName
  updateUrlSilently(categoryName)
  executeScrollAnimation()
}

// Clean up product URL silently when closing the modal so it doesn't jump!
watch(detailsModal, (isOpen) => {
  if (!isOpen) {
    const url = new URL(globalThis.location.href)
    if (url.searchParams.has('openProduct')) {
      url.searchParams.delete('openProduct')
      globalThis.history.replaceState({}, '', url)
    }
  }
})

watch(chatDialog, (isOpen) => {
  if (isOpen && !unsubscribeProductChatRealtime) {
    unsubscribeProductChatRealtime = subscribeToChatMessages()
    return
  }

  if (!isOpen && unsubscribeProductChatRealtime) {
    unsubscribeProductChatRealtime()
    unsubscribeProductChatRealtime = null
  }
})

// === MODAL & CART LOGIC ===

const showDetails = (item) => {
  selectedItem.value = item
  selectedVar.value = null
  selectedAddons.value = []
  detailsModal.value = true
}

// 3. Central Watcher: Listens ONLY to hard navigations
watch(
  () => route.query,
  (newQuery) => {
    if (newQuery.category) {
      activeCategory.value = newQuery.category
    }

    if (newQuery.search) {
      activeSearch.value = newQuery.search // <--- SAVE the search word here
      activeCategory.value = 'All'
      executeScrollAnimation()
    } else {
      activeSearch.value = '' // <--- Clear it if the URL has no search
    }

    if (newQuery.doScroll) {
      executeScrollAnimation()
      const url = new URL(globalThis.location.href)
      url.searchParams.delete('doScroll')
      globalThis.history.replaceState({}, '', url)
    }

    // Handle Search Modal quick opens
    if (newQuery.openProduct) {
      const foundProduct = getProducts().find((p) => p.name === newQuery.openProduct)

      // Removed the '!detailsModal.value' check so it always triggers
      if (foundProduct) {
        showDetails(foundProduct)
      }

      // Silently wipe both 'openProduct' AND 't' from the URL
      const url = new URL(globalThis.location.href)
      url.searchParams.delete('openProduct')
      url.searchParams.delete('t') // <--- Clean up the timestamp
      globalThis.history.replaceState({}, '', url)
    }
  },
  { immediate: true },
)

const selectVariation = (v) => {
  selectedVar.value = v
}
const toggleAddon = (addon) => {
  const index = selectedAddons.value.findIndex((a) => a.label === addon.label)
  index > -1 ? selectedAddons.value.splice(index, 1) : selectedAddons.value.push(addon)
}
const isAddonSelected = (addon) => selectedAddons.value.some((a) => a.label === addon.label)

const requireBuyerLogin = () => {
  const currentUser = getCurrentUser()
  if (currentUser?.role === 'buyer') return true

  loginRequiredDialog.value = true
  return false
}

const openChat = () => {
  if (!requireBuyerLogin()) return
  chatDialog.value = true
}

const openSellerProfile = () => {
  if (!selectedSeller.value?.id) return
  detailsModal.value = false
  router.push(`/seller-profile/${selectedSeller.value.id}`)
}

const handleAddToCart = () => {
  if (!requireBuyerLogin()) return

  if (!validateSelection()) return

  const added = addToCart(
    selectedItem.value,
    selectedVar.value,
    finalPrice.value,
    selectedAddons.value,
  )
  if (!added) {
    $q.notify({
      type: 'negative',
      message: `${selectedItem.value.name} does not have enough stock.`,
      position: 'top',
      timeout: 2000,
    })
    return
  }

  $q.notify({
    message: 'Added to cart',
    icon: 'check_circle',
    color: 'black',
    textColor: 'white',
    position: 'center',
    timeout: 1100,
    classes: 'custom-added-notify',
    badgeStyle: 'display: none',
  })
}

const validateSelection = () => {
  if (isProductOutOfStock(selectedItem.value)) {
    $q.notify({
      type: 'negative',
      message: 'This product is out of stock.',
      position: 'top',
      timeout: 2000,
    })
    return false
  }

  if (selectedItem.value.variations?.length > 0 && !selectedVar.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a variation first!',
      position: 'top',
      timeout: 2000,
    })
    return false
  }

  return true
}

const handleBuyNow = () => {
  if (!requireBuyerLogin()) return
  if (!validateSelection()) return

  paymentReceipt.value = ''
  receiptFileName.value = ''
  paymentDialog.value = true
}

const handleReceiptUpload = (event) => {
  const file = event?.target?.files?.[0]
  if (!file) return

  const uploadError = getUploadSizeError(file, 'receipt')
  if (uploadError) {
    if (event.target) event.target.value = ''
    $q.notify({
      type: 'negative',
      message: uploadError,
      position: 'top',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    paymentReceipt.value = reader.result
    receiptFileName.value = file.name
    if (receiptInput.value) receiptInput.value.value = ''
  }
  reader.readAsDataURL(file)
}

const confirmBuyNowPayment = () => {
  const currentUser = getCurrentUser()
  if (!paymentReceipt.value || !currentUser) return

  createOrder({
    buyerId: currentUser.id,
    productId: selectedItem.value.id,
    productName: selectedItem.value.name,
    vendor: selectedItem.value.vendor || selectedItem.value.seller || 'Campus Vendor',
    image: selectedItem.value.image,
    total: finalPrice.value,
    quantity: 1,
    selectedVariation: selectedVar.value?.label || '',
    selectedAddons: selectedAddons.value.map((addon) => ({ ...addon })),
    receipt: paymentReceipt.value,
    receiptFileName: receiptFileName.value,
  })
  const updatedProduct = decreaseProductStock(selectedItem.value.id, 1)
  if (updatedProduct) selectedItem.value = { ...selectedItem.value, stock: updatedProduct.stock }

  paymentDialog.value = false
  detailsModal.value = false
  paymentReceipt.value = ''
  receiptFileName.value = ''
  $q.notify({
    color: 'primary',
    icon: 'receipt_long',
    message: 'Receipt uploaded. Order is waiting for seller confirmation.',
    position: 'top',
  })
}

const goToLogin = () => {
  loginRequiredDialog.value = false
  detailsModal.value = false
  router.push('/page4')
}

const sendChat = () => {
  const currentUser = getCurrentUser()
  if (!chatText.value.trim() || !currentUser) return

  addMessage({
    conversationId: getConversationId(selectedItem.value, currentUser),
    product: selectedItem.value,
    buyer: currentUser,
    senderRole: 'buyer',
    text: chatText.value.trim(),
  })

  chatText.value = ''
}
</script>

<style scoped>
.product-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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
.detail-scroll-area {
  min-height: 0;
  overflow-y: auto;
}
.variation-scroll-container {
  max-height: 85px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
.login-required-card {
  width: min(420px, calc(100vw - 32px));
  border-radius: 8px;
}
.chat-thread {
  display: grid;
  gap: 10px;
  max-height: 260px;
  overflow-y: auto;
  padding: 14px;
  border-radius: 8px;
  background: #eef2f8;
}
.chat-bubble {
  width: fit-content;
  max-width: 82%;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.4;
}
.chat-bubble.seller {
  background: white;
  color: #17233d;
}
.chat-bubble.buyer {
  justify-self: end;
  background: #27459a;
  color: white;
}

:deep(.custom-added-notify) {
  width: 140px;
  height: 140px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.85) !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
:deep(.custom-added-notify .q-notification__icon) {
  font-size: 52px;
  margin-bottom: 8px;
}
:deep(.custom-added-notify .q-notification__message) {
  font-size: 15px;
  font-weight: bold;
}

@media (max-width: 700px) {
  .detail-modal-card {
    width: calc(100vw - 18px);
    max-width: calc(100vw - 18px);
    height: min(94vh, 760px);
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

  .detail-info-panel {
    padding: 18px !important;
    display: flex;
    flex-direction: column;
    flex: 0 0 auto;
    min-height: 0;
  }

  .detail-scroll-area {
    flex: 0 0 auto !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
    padding-right: 0 !important;
  }

  .detail-image {
    height: 190px;
  }

  .detail-modal-card .text-h4 {
    font-size: 1.55rem;
    line-height: 1.15;
  }

  .detail-modal-card .text-h3 {
    font-size: 1.55rem;
  }

  .detail-seller-row {
    margin-bottom: 8px !important;
  }

  .description-box {
    max-height: 70px;
    margin-bottom: 8px !important;
    font-size: 0.9rem;
  }

  .variation-scroll-container {
    max-height: 96px;
    padding: 6px;
  }

  .variation-scroll-container :deep(.q-btn) {
    min-height: 30px;
    font-size: 0.72rem;
    padding: 4px 9px;
  }

  .price-section {
    min-height: 78px !important;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    margin-bottom: 10px !important;
  }

  .detail-actions {
    margin-top: 8px !important;
  }

  .detail-actions .q-btn {
    min-height: 44px;
    padding-left: 8px;
    padding-right: 8px;
    font-size: 0.82rem;
  }
}
</style>
