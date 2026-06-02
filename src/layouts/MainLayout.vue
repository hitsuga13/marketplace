<template>
  <q-layout view="hHh lpR fff" class="market-layout">
    <q-header elevated class="market-header text-white">
      <q-toolbar class="q-px-md">
        <q-toolbar-title class="row items-center no-wrap">
          <div class="brand-logo">
            <img src="/icons/upnm-logo.png" alt="UPNM logo" />
          </div>
          <div>
            <div class="text-weight-bold">UPNM Marketplace</div>
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
          class="gt-xs"
          @click="searchModal = true"
        />
        <q-btn
          flat
          round
          dense
          color="white"
          icon="search"
          aria-label="Open search"
          class="lt-sm"
          @click="searchModal = true"
        />
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
          :to="{ path: '/main', query: { category: 'All', doScroll: 'true' } }"
          icon="dashboard"
          label="Buyer Dashboard"
        />

        <q-route-tab to="/page4" icon="account_circle" label="Login/Register" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="market-footer text-white">
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

    <q-dialog v-model="searchModal" position="top" @hide="searchQuery = ''">
      <q-card
        class="bg-grey-10 text-white q-mt-xl"
        style="
          width: 500px;
          max-width: 90vw;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
        "
      >
        <q-card-section class="q-pb-none q-pt-sm">
          <q-input
            dark
            borderless
            v-model="searchQuery"
            placeholder="Search for food, services..."
            autofocus
            class="text-h6"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-5" />
            </template>
            <template v-slot:append>
              <q-icon
                name="close"
                class="cursor-pointer text-grey-5"
                @click="searchModal = false"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section v-if="searchQuery" class="q-pt-sm">
          <div
            class="text-subtitle2 text-grey-5 q-mb-sm text-weight-bold"
            style="letter-spacing: 0.5px"
          >
            Top Results
          </div>

          <q-list dark>
            <q-item
              v-for="item in topResults"
              :key="item.name"
              clickable
              v-ripple
              @click="quickOpenProduct(item)"
              class="q-px-none q-py-sm rounded-borders"
            >
              <q-item-section avatar>
                <q-avatar square style="border-radius: 4px; width: 48px; height: 48px">
                  <img :src="item.image" :alt="item.name" style="object-fit: cover" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold text-white text-body1">{{
                  item.name
                }}</q-item-label>
                <q-item-label caption class="text-grey-5">
                  {{ item.category }} &bull; {{ item.vendor || 'Campus Vendor' }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-item-label class="text-grey-3 text-body2">
                  {{ getPriceDisplay(item) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="topResults.length === 0" class="text-center text-grey-5 q-py-md">
            No items found for "{{ searchQuery }}"
          </div>

          <div v-else class="text-center q-mt-md q-mb-sm">
            <q-btn
              flat
              color="primary"
              no-caps
              @click="seeAllResults"
              :label="`See all results for &quot;${searchQuery}&quot;`"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { allProducts } from '../data/products.js'

export default defineComponent({
  name: 'MainLayout',
  setup() {
    const router = useRouter()

    const searchModal = ref(false)
    const searchQuery = ref('')

    const topResults = computed(() => {
      if (!searchQuery.value) return []

      const query = searchQuery.value.toLowerCase()
      return allProducts
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
        query: { openProduct: item.name, t: Date.now() }, // <--- ADD Date.now()
      })
    }

    // FIX: Safely pass the search term to the main page
    const seeAllResults = () => {
      if (!searchQuery.value) return

      const text = searchQuery.value // Save the word before closing
      searchModal.value = false // Close the modal

      // Send the user to the main page with the 'search' query in the URL
      router.push({ path: '/main', query: { search: text } })
    }

    return {
      searchModal,
      searchQuery,
      topResults,
      getPriceDisplay,
      quickOpenProduct,
      seeAllResults,
    }
  },
})
</script>
