<!-- Purpose: Main app shell for header, role tabs, cart, checkout, search, menu footer, and routed pages. -->
<template>
  <q-layout view="hHh lpR fff" class="market-layout">
    <q-header elevated class="market-header text-white">
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="row items-center no-wrap">
          <div class="brand-logo">
            <img :src="getPublicAsset('icons/upnm-logo.png')" alt="UPNM logo" />
          </div>
          <div>
            <div class="text-weight-bold brand-title-full">UPNM Campus Marketplace</div>
            <div class="text-weight-bold brand-title-mobile">UPNM Market</div>
            <div class="text-caption text-white-8 gt-xs">
              Student deals, campus services, thrift finds
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <q-btn
          unelevated
          rounded
          color="white"
          text-color="primary"
          icon="search"
          label="Search"
          class="gt-xs header-search-btn q-mr-sm"
          @click="searchModal = true"
        />
        <q-btn
          flat
          round
          dense
          color="white"
          icon="search"
          aria-label="Open search"
          class="lt-sm q-mr-xs"
          @click="searchModal = true"
        />

        <q-btn
          v-if="showCartButton"
          unelevated
          rounded
          color="white"
          text-color="primary"
          icon="shopping_cart"
          label="Cart"
          class="gt-xs header-cart-btn"
          @click="openCartPanel"
        >
          <q-badge v-if="cartCount > 0" color="secondary" text-color="dark" floating>
            {{ cartCount }}
          </q-badge>
        </q-btn>
        <q-btn
          v-if="showCartButton"
          flat
          round
          dense
          color="white"
          icon="shopping_cart"
          aria-label="Open cart"
          class="lt-sm"
          @click="openCartPanel"
        >
          <q-badge v-if="cartCount > 0" color="secondary" text-color="dark" floating>
            {{ cartCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>

      <q-tabs
        align="center"
        class="market-tabs text-white"
        active-color="white"
        indicator-color="secondary"
        outside-arrows
        mobile-arrows
      >
        <q-route-tab to="/main" icon="home" label="Menu" />

        <q-route-tab
          v-if="currentUser?.role === 'buyer'"
          to="/buyer-dashboard"
          icon="dashboard"
          label="Buyer Dashboard"
        />

        <q-route-tab
          v-if="currentUser?.role === 'seller'"
          to="/seller"
          icon="inventory_2"
          label="Seller Dashboard"
        />

        <q-route-tab
          v-if="currentUser?.role === 'buyer' || currentUser?.role === 'seller'"
          to="/chat"
          class="chat-route-tab"
          icon="chat"
          label="Chat"
        >
          <q-badge v-if="unreadChatCount > 0" color="red" text-color="white" floating>
            {{ unreadChatBadge }}
          </q-badge>
        </q-route-tab>

        <q-route-tab
          v-if="currentUser?.role === 'admin'"
          to="/admin"
          icon="admin_panel_settings"
          label="Admin Dashboard"
        />

        <q-route-tab
          to="/page4"
          icon="account_circle"
          :label="currentUser ? 'Account' : 'Login/Register'"
        />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer v-if="isMenuPage" elevated class="market-footer text-white">
      <div class="footer-grid q-pa-lg">
        <div>
          <div class="text-h6">Contact Us</div>
          <div class="text-white-8">+60 12-345 6789</div>
        </div>
        <div>
          <div class="text-h6">Location</div>
          <div class="text-white-8">
            Universiti Pertahanan Nasional Malaysia, Kem Perdana Sungai Besi, 57000 Kuala Lumpur
          </div>
        </div>
        <div>
          <div class="text-h6">Operating Hours</div>
          <div class="text-white-8">Mon - Fri: 9:00 AM - 6:00 PM</div>
          <div class="text-white-8">Sat: 10:00 AM - 4:00 PM</div>
        </div>
      </div>

      <iframe
        title="UPNM map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.156540531506!2d101.72083667462846!3d3.052733753738503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc357ad56c0001%3A0x3d5c81a579c4ae1d!2sUniversiti%20Pertahanan%20Nasional%20Malaysia!5e0!3m2!1sen!2smy!4v1779377846314!5m2!1sen!2smy"
        width="100%"
        height="220"
        style="border: 0"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </q-footer>

    <q-dialog v-model="searchModal" position="top" no-route-dismiss @hide="searchQuery = ''">
      <q-card class="search-panel q-mt-xl">
        <q-card-section class="search-panel__header">
          <div>
            <div class="search-panel__eyebrow">Marketplace Search</div>
            <div class="search-panel__title">Find campus items fast</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="primary"
            aria-label="Close search"
            @click="searchModal = false"
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            outlined
            v-model="searchQuery"
            placeholder="Search for food, services..."
            autofocus
            class="search-input"
            bg-color="white"
            color="primary"
            @keyup.enter="seeAllResults"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
            <template v-slot:append>
              <q-btn
                v-if="searchQuery"
                flat
                round
                dense
                icon="backspace"
                color="grey-6"
                aria-label="Clear search"
                @click="searchQuery = ''"
              />
              <q-btn
                v-else
                unelevated
                round
                dense
                icon="keyboard_return"
                color="secondary"
                text-color="dark"
                aria-label="Submit search"
                @click="seeAllResults"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section v-if="searchQuery" class="search-results">
          <div class="search-results__topline">
            <div
              class="text-subtitle2 text-primary text-weight-bold"
              style="letter-spacing: 0.5px"
            >
              Top Results
            </div>
            <q-chip dense color="primary" text-color="white" class="q-ma-none">
              {{ topResults.length }}
            </q-chip>
          </div>

          <q-list class="search-results__list">
            <q-item
              v-for="item in topResults"
              :key="item.name"
              clickable
              v-ripple
              @click="quickOpenProduct(item)"
              class="search-result-item"
            >
              <q-item-section avatar>
                <q-avatar square class="search-result-item__image">
                  <img :src="getImageSrc(item.image)" :alt="item.name" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-dark text-body1">{{
                  item.name
                }}</q-item-label>
                <q-item-label caption class="text-grey-7">
                  {{ item.category }} &bull; {{ item.vendor || 'Campus Vendor' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label class="search-result-item__price">
                  {{ getPriceDisplay(item) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="topResults.length === 0" class="search-empty q-py-lg">
            <q-icon name="search_off" size="32px" color="grey-5" />
            <div>No items found for "{{ searchQuery }}"</div>
          </div>

          <div v-else class="text-center q-mt-md q-mb-sm">
            <q-btn
              unelevated
              rounded
              color="primary"
              no-caps
              icon-right="arrow_forward"
              @click="seeAllResults"
              :label="`See all results for &quot;${searchQuery}&quot;`"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="cartPanelOpen" position="right" full-height>
      <q-card class="cart-panel">
        <q-card-section class="cart-panel__header">
          <div class="cart-panel__title">My Cart</div>
          <q-btn
            flat
            round
            dense
            icon="close"
            color="dark"
            aria-label="Close cart"
            @click="cartPanelOpen = false"
          />
        </q-card-section>

        <q-card-section class="cart-panel__body">
          <div v-if="cart.length === 0" class="cart-panel__empty">
            <q-icon name="shopping_cart" size="48px" color="grey-5" />
            <div class="text-weight-bold">Your cart is empty</div>
            <div class="text-grey-7">Add products from the menu to see them here.</div>
          </div>

          <div v-else class="cart-panel__items">
            <div v-for="item in cart" :key="item.uniqueKey" class="cart-panel-item">
              <q-checkbox
                v-model="item.selected"
                color="primary"
                class="cart-panel-item__check"
                aria-label="Select item"
              />

              <div class="cart-panel-item__content">
                <q-avatar square class="cart-panel-item__image">
                  <img :src="getImageSrc(item.image)" :alt="item.name" />
                </q-avatar>

                <div class="cart-panel-item__info">
                  <div class="cart-panel-item__top">
                    <div class="cart-panel-item__name">{{ item.name }}</div>
                    <q-btn
                      flat
                      round
                      dense
                      icon="delete_outline"
                      color="grey-8"
                      aria-label="Remove item"
                      @click="removeFromCart(item.uniqueKey)"
                    />
                  </div>

                  <div class="cart-panel-item__meta">
                    {{ item.selectedVar?.label || 'Product' }}
                  </div>

                  <div v-if="item.selectedAddons?.length" class="cart-panel-item__addons">
                    <span
                      v-for="addon in item.selectedAddons"
                      :key="addon.label"
                      class="cart-panel-item__addon"
                    >
                      {{ addon.label }}
                      <strong>+RM {{ Number(addon.price || 0).toFixed(2) }}</strong>
                    </span>
                  </div>

                  <div class="cart-panel-item__bottom">
                    <div class="cart-panel-item__price">RM {{ Number(item.price || 0).toFixed(2) }}</div>
                    <div class="cart-qty-control">
                      <q-btn
                        flat
                        round
                        dense
                        icon="remove"
                        color="grey-8"
                        aria-label="Decrease quantity"
                        @click="decreaseQuantity(item)"
                      />
                      <span>{{ item.quantity }}</span>
                      <q-btn
                        flat
                        round
                        dense
                        icon="add"
                        color="grey-8"
                        aria-label="Increase quantity"
                        @click="increaseQuantity(item)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-section class="cart-panel__footer">
          <div class="cart-panel__select-all">
            <q-checkbox v-model="allCartSelected" color="primary" label="All" />
          </div>
          <div class="cart-panel__checkout-summary">
            <div>
              <div class="cart-panel__subtotal-label">Total</div>
              <div class="cart-panel__subtotal">RM {{ cartSubtotal.toFixed(2) }}</div>
            </div>
          </div>
          <q-btn
            unelevated
            no-caps
            color="primary"
            :label="`Check Out (${selectedCartCount})`"
            :disable="selectedCartItems.length === 0"
            @click="openCheckout"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="checkoutDialog">
      <q-card class="payment-qr-card cart-checkout-card multi-seller-checkout-card">
        <q-card-section>
          <div class="multi-seller-checkout-header">
            <q-avatar color="primary" text-color="white" size="58px">
              <q-icon name="qr_code_2" size="34px" />
            </q-avatar>
            <div>
              <div class="text-h6 text-weight-bold">Pay Seller via QR</div>
              <div class="text-grey-7">
                {{ checkoutGroups.length }} seller(s), {{ selectedCartCount }} item(s) selected
              </div>
            </div>
          </div>

          <div class="multi-seller-checkout-total q-mt-md">
            <span>Total selected payment</span>
            <strong>RM {{ cartSubtotal.toFixed(2) }}</strong>
          </div>

          <div class="multi-seller-checkout-list q-mt-md">
            <div v-for="group in checkoutGroups" :key="group.sellerKey" class="seller-payment-card">
              <div class="seller-payment-card__top">
                <div>
                  <div class="seller-payment-card__seller">{{ group.sellerName }}</div>
                  <div class="seller-payment-card__meta">
                    {{ group.items.length }} item(s) - RM {{ group.total.toFixed(2) }}
                  </div>
                </div>
                <q-chip color="primary" text-color="white" icon="payments" :label="`RM ${group.total.toFixed(2)}`" />
              </div>

              <div class="seller-payment-card__body">
                <div class="seller-payment-card__qr">
                  <q-img
                    v-if="group.paymentQr"
                    :src="group.paymentQr"
                    ratio="1"
                    fit="contain"
                  />
                  <div v-else class="payment-qr-empty">
                    <q-icon name="qr_code_2" size="46px" color="grey-5" />
                    <div>This seller has not uploaded a payment QR yet.</div>
                  </div>
                </div>

                <div class="seller-payment-card__items">
                  <div v-for="item in group.items" :key="item.uniqueKey" class="seller-payment-item">
                    <q-avatar square class="seller-payment-item__image">
                      <img :src="getImageSrc(item.image)" :alt="item.name" />
                    </q-avatar>
                    <div>
                      <div class="seller-payment-item__name">{{ item.name }}</div>
                      <div class="seller-payment-item__meta">
                        Qty {{ item.quantity }} - RM {{ (Number(item.price || 0) * item.quantity).toFixed(2) }}
                      </div>
                      <div v-if="item.selectedAddons?.length" class="seller-payment-item__addons">
                        {{ item.selectedAddons.map((addon) => addon.label).join(', ') }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="seller-payment-card__receipt q-mt-md">
                <input
                  :ref="(element) => setGroupReceiptInput(group.sellerKey, element)"
                  type="file"
                  accept="image/*,.pdf"
                  class="hidden-file-input"
                  @change="(event) => handleGroupReceiptUpload(group, event)"
                />
                <q-btn
                  outline
                  color="primary"
                  icon="upload_file"
                  no-caps
                  class="receipt-upload-btn"
                  :label="getGroupReceipt(group)?.fileName || `Upload receipt for ${group.sellerName}`"
                  @click="groupReceiptInputs[group.sellerKey]?.click()"
                />
              </div>
            </div>
          </div>

          <p class="text-grey-7 q-mt-md q-mb-md">
            Scan each seller QR, complete payment, upload each seller receipt proof, then click the button below.
          </p>
          <div class="checkout-receipt-status">
            {{ uploadedCheckoutReceiptCount }} / {{ checkoutGroups.length }} receipt(s) uploaded
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-px-md q-pb-md">
          <q-btn flat color="grey-7" label="Cancel" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="check_circle"
            label="I have paid"
            :disable="uploadedCheckoutReceiptCount < checkoutGroups.length"
            @click="confirmCartPayment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getUploadSizeError } from 'src/utils/fileValidation'
import { getPublicAsset, normalizeStoredImage } from 'src/utils/assets'
import {
  cart,
  cartCount,
  clearSelectedCartItems,
  createOrders,
  decreaseProductsStock,
  getCurrentUser,
  getUnreadChatCount,
  getProductStock,
  getProducts,
  getSellerForProduct,
  isProductOutOfStock,
  loadState,
  removeFromCart,
} from 'src/database'

export default defineComponent({
  name: 'MainLayout',
  setup() {
    const $q = useQuasar()
    const router = useRouter()
    const route = useRoute()

    const searchModal = ref(false)
    const cartPanelOpen = ref(false)
    const checkoutDialog = ref(false)
    const searchQuery = ref('')
    const groupReceipts = ref({})
    const groupReceiptInputs = ref({})
    const currentUser = ref(getCurrentUser())
    const chatReadState = ref(loadState('upnm-chat-read-state', {}))
    const databaseVersion = ref(0)
    const isMenuPage = computed(() =>
      ['/', '/main', '/page1', '/page2', '/page3'].includes(route.path),
    )
    const showCartButton = computed(() => currentUser.value?.role === 'buyer')
    const unreadChatCount = computed(() => getUnreadChatCount(currentUser.value, chatReadState.value))
    const unreadChatBadge = computed(() => (unreadChatCount.value > 99 ? '99+' : unreadChatCount.value))

    const refreshSession = () => {
      currentUser.value = getCurrentUser()
      chatReadState.value = loadState('upnm-chat-read-state', {})
      databaseVersion.value += 1
    }

    const handleExternalCartOpen = () => {
      refreshSession()
      openCartPanel()
    }

    const handleExternalCheckoutOpen = () => {
      refreshSession()
      cartPanelOpen.value = false
      openCheckout()
    }

    let removeRouterHook

    onMounted(() => {
      removeRouterHook = router.afterEach(refreshSession)
      window.addEventListener('storage', refreshSession)
      window.addEventListener('upnm-supabase-cache-updated', refreshSession)
      window.addEventListener('upnm-chat-updated', refreshSession)
      window.addEventListener('upnm-chat-read-state-updated', refreshSession)
      window.addEventListener('upnm-open-cart', handleExternalCartOpen)
      window.addEventListener('upnm-open-checkout', handleExternalCheckoutOpen)
      refreshSession()
    })

    onBeforeUnmount(() => {
      if (removeRouterHook) removeRouterHook()
      window.removeEventListener('storage', refreshSession)
      window.removeEventListener('upnm-supabase-cache-updated', refreshSession)
      window.removeEventListener('upnm-chat-updated', refreshSession)
      window.removeEventListener('upnm-chat-read-state-updated', refreshSession)
      window.removeEventListener('upnm-open-cart', handleExternalCartOpen)
      window.removeEventListener('upnm-open-checkout', handleExternalCheckoutOpen)
    })

    const topResults = computed(() => {
      databaseVersion.value
      if (!searchQuery.value) return []

      const query = searchQuery.value.toLowerCase()
      return getProducts()
        .filter((product) => product.active !== false)
        .filter(
          (product) =>
            product.name.toLowerCase().includes(query) ||
            (product.category && product.category.toLowerCase().includes(query)) ||
            (product.vendor && product.vendor.toLowerCase().includes(query)),
        )
        .slice(0, 4)
    })

    const getPriceDisplay = (item) => {
      if (item.variations && item.variations.length > 0) return 'Varies'
      if (item.price) return `RM ${item.price.toFixed(2)}`
      return ''
    }

    // FIX: Keep search bar open, but add a timestamp to force Vue Router to trigger
    const quickOpenProduct = (item) => {
      router.push({
        path: '/main', // (or '/' if that is what you were using)
        query: { ...router.currentRoute.value.query, openProduct: item.name, t: Date.now() }, // <--- ADD Date.now()
      })
    }
    const getImageSrc = (src) => normalizeStoredImage(src)

    // FIX: Safely pass the search term to the main page
    const seeAllResults = () => {
      if (!searchQuery.value) return

      const text = searchQuery.value // Save the word before closing
      searchModal.value = false // Close the modal

      // Send the user to the main page with the 'search' query in the URL
      router.push({ path: '/main', query: { search: text } })
    }

    const selectedCartItems = computed(() => cart.value.filter((item) => item.selected !== false))
    const selectedCartCount = computed(() =>
      selectedCartItems.value.reduce((total, item) => total + item.quantity, 0),
    )
    const cartSubtotal = computed(() =>
      selectedCartItems.value.reduce((total, item) => total + Number(item.price || 0) * item.quantity, 0),
    )
    const allCartSelected = computed({
      get: () => cart.value.length > 0 && cart.value.every((item) => item.selected !== false),
      set: (checked) => {
        cart.value.forEach((item) => {
          item.selected = checked
        })
      },
    })
    const getSellerReceiptKey = (sellerName) =>
      String(sellerName || 'Campus Seller').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')

    const checkoutGroups = computed(() => {
      const groups = new Map()

      selectedCartItems.value.forEach((item) => {
        const sellerName = item.vendor || item.seller || 'Campus Seller'
        const sellerKey = getSellerReceiptKey(sellerName)
        const seller = getSellerForProduct(item)
        const existingGroup = groups.get(sellerKey) || {
          sellerKey,
          sellerName,
          seller,
          paymentQr: seller?.paymentQr || '',
          items: [],
          total: 0,
        }

        existingGroup.items.push(item)
        existingGroup.total += Number(item.price || 0) * item.quantity
        groups.set(sellerKey, existingGroup)
      })

      return Array.from(groups.values())
    })

    const getLatestProductForCartItem = (item) =>
      getProducts().find((product) => String(product.id) === String(item.id))

    const getCartItemStock = (item) => {
      const product = getLatestProductForCartItem(item)
      return getProductStock(product || item)
    }

    const validateSelectedCartStock = () => {
      const quantityByProduct = new Map()

      selectedCartItems.value.forEach((item) => {
        const key = String(item.id)
        quantityByProduct.set(key, (quantityByProduct.get(key) || 0) + Number(item.quantity || 1))
      })

      for (const item of selectedCartItems.value) {
        const product = getLatestProductForCartItem(item)
        if (!product || isProductOutOfStock(product)) {
          $q.notify({
            type: 'negative',
            message: `${item.name} is out of stock.`,
            position: 'top',
          })
          return false
        }

        const stock = getProductStock(product)
        if (stock !== null && quantityByProduct.get(String(item.id)) > stock) {
          $q.notify({
            type: 'negative',
            message: `${item.name} only has ${stock} stock left.`,
            position: 'top',
          })
          return false
        }
      }

      return true
    }

    const openCartPanel = () => {
      if (currentUser.value?.role === 'seller' || currentUser.value?.role === 'admin') {
        router.push('/page4')
        return
      }

      cartPanelOpen.value = true
    }

    const increaseQuantity = (item) => {
      const stock = getCartItemStock(item)
      const sameProductQuantity = cart.value
        .filter((cartItem) => String(cartItem.id) === String(item.id))
        .reduce((total, cartItem) => total + Number(cartItem.quantity || 1), 0)

      if (stock !== null && sameProductQuantity >= stock) {
        $q.notify({
          type: 'negative',
          message: `${item.name} only has ${stock} stock left.`,
          position: 'top',
        })
        return
      }

      item.quantity += 1
    }

    const decreaseQuantity = (item) => {
      if (item.quantity <= 1) {
        removeFromCart(item.uniqueKey)
        return
      }

      item.quantity -= 1
    }

    const openCheckout = () => {
      if (currentUser.value?.role !== 'buyer') {
        cartPanelOpen.value = false
        router.push('/page4')
        return
      }

      if (!validateSelectedCartStock()) return

      groupReceipts.value = {}
      groupReceiptInputs.value = {}
      cartPanelOpen.value = false
      checkoutDialog.value = true
    }

    const setGroupReceiptInput = (sellerKey, element) => {
      if (!element) return

      groupReceiptInputs.value = {
        ...groupReceiptInputs.value,
        [sellerKey]: element,
      }
    }

    const getGroupReceipt = (group) =>
      groupReceipts.value[group?.sellerKey] || groupReceipts.value[group?.sellerName]

    const handleGroupReceiptUpload = (group, event) => {
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
        const receipt = {
          receipt: reader.result,
          fileName: file.name,
        }

        groupReceipts.value = {
          ...groupReceipts.value,
          [group.sellerKey]: receipt,
          [group.sellerName]: receipt,
        }
        if (event.target) event.target.value = ''
      }
      reader.readAsDataURL(file)
    }

    const allCheckoutReceiptsUploaded = computed(
      () =>
        checkoutGroups.value.length > 0 &&
        checkoutGroups.value.every((group) => getGroupReceipt(group)?.receipt),
    )
    const uploadedCheckoutReceiptCount = computed(
      () => checkoutGroups.value.filter((group) => getGroupReceipt(group)?.receipt).length,
    )

    const confirmCartPayment = () => {
      if (!currentUser.value) return
      if (uploadedCheckoutReceiptCount.value < checkoutGroups.value.length) {
        const missingSeller = checkoutGroups.value.find((group) => !getGroupReceipt(group)?.receipt)
        $q.notify({
          type: 'negative',
          message: `Please upload receipt for ${missingSeller?.sellerName || 'every seller'} first.`,
          position: 'top',
        })
        return
      }
      if (!validateSelectedCartStock()) return

      createOrders(selectedCartItems.value.map((item) => ({
        ...(() => {
          const sellerName = item.vendor || item.seller || 'Campus Vendor'
          const sellerReceipt =
            groupReceipts.value[getSellerReceiptKey(sellerName)] || groupReceipts.value[sellerName]
          return {
            receipt: sellerReceipt?.receipt || '',
            receiptFileName: sellerReceipt?.fileName || '',
          }
        })(),
        buyerId: currentUser.value.id,
        productId: item.id,
        productName: item.name,
        vendor: item.vendor || item.seller || 'Campus Vendor',
        image: item.image,
        total: Number(item.price || 0) * item.quantity,
        quantity: item.quantity,
        selectedVariation: item.selectedVar?.label || '',
        selectedAddons: item.selectedAddons?.map((addon) => ({ ...addon })) || [],
      })))
      decreaseProductsStock(selectedCartItems.value)

      clearSelectedCartItems()
      checkoutDialog.value = false
      groupReceipts.value = {}
      groupReceiptInputs.value = {}
      $q.notify({
        color: 'primary',
        icon: 'receipt_long',
        message: 'Receipt uploaded. Order is waiting for seller confirmation.',
        position: 'top',
      })
      router.push('/buyer-dashboard')
    }

    const goToCart = () => {
      cartPanelOpen.value = false
      if (currentUser.value?.role === 'buyer') {
        router.push('/buyer-dashboard')
        return
      }

      router.push('/page4')
    }

    return {
      searchModal,
      cartPanelOpen,
      checkoutDialog,
      searchQuery,
      groupReceipts,
      groupReceiptInputs,
      currentUser,
      showCartButton,
      unreadChatCount,
      unreadChatBadge,
      cart,
      cartCount,
      selectedCartItems,
      selectedCartCount,
      allCartSelected,
      cartSubtotal,
      checkoutGroups,
      allCheckoutReceiptsUploaded,
      uploadedCheckoutReceiptCount,
      isMenuPage,
      topResults,
      getPriceDisplay,
      getPublicAsset,
      getImageSrc,
      quickOpenProduct,
      seeAllResults,
      openCartPanel,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity,
      openCheckout,
      setGroupReceiptInput,
      getGroupReceipt,
      handleGroupReceiptUpload,
      confirmCartPayment,
      goToCart,
    }
  },
})
</script>
