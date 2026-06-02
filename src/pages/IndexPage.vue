<template>
  <q-page class="home-page">
    <section class="hero-section">
      <div class="hero-media">
        <img src="/icons/f&b.jpg" alt="UPNM Marketplace featured food and campus items" />
      </div>

      <div class="hero-content">
        <q-badge color="secondary" text-color="dark" class="q-mb-md" label="Campus marketplace" />
        <h1>UPNM Marketplace</h1>
        <p>
          Discover student-run food, reliable campus services, and thrift finds around UPNM in one
          quick place.
        </p>

        <div class="row q-col-gutter-sm hero-actions">
          <div class="col-12 col-sm-auto">
            <q-btn
              unelevated
              color="secondary"
              text-color="dark"
              icon="restaurant_menu"
              label="Explore Food"
              @click="scrollToMarketplace('FnB')"
            />
          </div>
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

        <div class="row q-col-gutter-lg">
          <div v-for="category in categories" :key="category.title" class="col-12 col-md-4">
            <q-card class="category-card" flat bordered>
              <q-img :src="category.image" :alt="category.title" ratio="4/3" />
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
              <q-img :src="item.image" :alt="item.name" ratio="1" fit="cover" />
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold ellipsis">{{ item.name }}</div>
                <div class="text-caption text-grey-7">{{ getCategoryLabel(item.category) }}</div>

                <div class="price text-primary text-bold q-mt-sm">
                  <span v-if="item.variations?.length > 0">Options Available</span>
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
            <q-img :src="selectedItem.image" class="detail-image" fit="contain" />
            <q-btn
              icon="close"
              flat
              round
              dense
              v-close-popup
              class="absolute-top-left q-ma-sm close-btn"
            />
          </div>

          <div class="col-6 q-pa-lg column no-wrap shadow-2">
            <div class="q-mb-md">
              <div class="text-overline text-primary">
                {{ getCategoryLabel(selectedItem.category) }}
                <span v-if="selectedItem.vendor">/ {{ selectedItem.vendor }}</span>
              </div>
              <div class="text-h4 text-bold">{{ selectedItem.name }}</div>
            </div>

            <q-scroll-area class="col q-pr-md">
              <div class="description-box q-mb-md text-body1 text-grey-9">
                {{ selectedItem.desc1 }}
              </div>

              <div v-if="selectedItem.variations?.length > 0" class="q-mb-md">
                <div class="text-subtitle2 q-mb-sm text-bold text-grey-9">Variation</div>
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
            </q-scroll-area>

            <div class="q-mt-md">
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
                />
                <q-btn
                  outline
                  color="primary"
                  icon="shopping_cart"
                  label="ADD"
                  class="col"
                  @click="handleAddToCart"
                />
                <q-btn unelevated color="primary" label="BUY NOW" class="col-5 text-bold" />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { allProducts } from '../data/products.js'
import { addToCart } from '../data/cart.js'

const $q = useQuasar()
const route = useRoute()

const activeCategory = ref('All')
const activeSearch = ref('')

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
    image: '/icons/services.jpg',
    icon: 'design_services',
    cta: 'Find Services',
    filterTarget: 'Services',
  },
  {
    title: 'Food & Beverages',
    description: 'Affordable meals, snacks, and quick cravings delivered around campus.',
    image: '/icons/f&b_3.jpg',
    icon: 'restaurant',
    cta: 'See Menu',
    filterTarget: 'FnB',
  },
  {
    title: 'Thrift',
    description: 'Pre-loved streetwear, jerseys, sneakers, and accessories with character.',
    image: '/icons/thrift.jpg',
    icon: 'checkroom',
    cta: 'Shop Thrift',
    filterTarget: 'Thrift',
  },
]

const detailsModal = ref(false)
const selectedItem = ref({})
const selectedVar = ref(null)
const selectedAddons = ref([])

const getCategoryLabel = (catKey) => {
  if (catKey === 'FnB') return 'Food & Beverages'
  return catKey || 'General'
}

// Data Filter Calculations Engine
// Data Filter Calculations Engine
const filteredItems = computed(() => {
  let baseItems = allProducts

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

const isPriceAvailable = computed(() => {
  if (selectedItem.value.variations?.length > 0) {
    return selectedVar.value !== null
  }
  return selectedItem.value.price !== undefined
})

const finalPrice = computed(() => {
  if (!isPriceAvailable.value) return 0
  let base =
    selectedVar.value && selectedVar.value.price !== undefined
      ? selectedVar.value.price
      : selectedItem.value.price || 0
  selectedAddons.value.forEach((addon) => {
    base += addon.price
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
      const foundProduct = allProducts.find((p) => p.name === newQuery.openProduct)

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

const handleAddToCart = () => {
  if (selectedItem.value.variations?.length > 0 && !selectedVar.value) {
    $q.notify({
      type: 'negative',
      message: 'Please select a variation first!',
      position: 'top',
      timeout: 2000,
    })
    return
  }

  addToCart(selectedItem.value, selectedVar.value, finalPrice.value, selectedAddons.value)

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
.variation-scroll-container {
  max-height: 85px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
</style>
