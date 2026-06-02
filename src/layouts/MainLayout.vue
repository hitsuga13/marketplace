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
          @click="searchDialog = true"
        />
        <q-btn
          flat
          round
          dense
          color="white"
          icon="search"
          aria-label="Open search"
          class="lt-sm"
          @click="searchDialog = true"
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
        <q-route-tab to="/page1" icon="design_services" label="Services" />
        <q-route-tab to="/page2" icon="restaurant" label="Food & Beverages" />
        <q-route-tab to="/page3" icon="checkroom" label="Thrift" />
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

    <q-dialog v-model="searchDialog">
      <q-card class="search-card">
        <q-card-section class="row items-center q-pb-none">
          <div>
            <div class="text-h6">Browse Marketplace</div>
            <div class="text-caption text-grey-7">Try food, printing, hoodie, runner, jersey</div>
          </div>
          <q-space />
          <q-btn v-close-popup flat round dense icon="close" />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="search"
            label="Search products, services, vendors..."
            outlined
            dense
            autofocus
            clearable
            @keyup.enter="doSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="row q-col-gutter-sm">
            <div v-for="item in quickSearches" :key="item.label" class="col-6">
              <q-btn
                align="left"
                class="full-width quick-search-btn"
                unelevated
                no-caps
                :icon="item.icon"
                :label="item.label"
                @click="goTo(item.to)"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" color="primary" v-close-popup />
          <q-btn
            unelevated
            color="primary"
            icon="travel_explore"
            label="Search"
            @click="doSearch"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',
  data() {
    return {
      searchDialog: false,
      search: '',
      quickSearches: [
        { label: 'Campus food', icon: 'restaurant', to: '/page2' },
        { label: 'Printing', icon: 'print', to: '/page1' },
        { label: 'Runner', icon: 'directions_run', to: '/page1' },
        { label: 'Thrift finds', icon: 'checkroom', to: '/page3' },
      ],
    }
  },
  methods: {
    doSearch() {
      const q = (this.search || '').trim()
      this.searchDialog = false

      if (!q) return

      const lower = q.toLowerCase()
      const target =
        lower.includes('food') ||
        lower.includes('beverage') ||
        lower.includes('nasi') ||
        lower.includes('takoyaki') ||
        lower.includes('ramen')
          ? '/page2'
          : lower.includes('print') ||
              lower.includes('service') ||
              lower.includes('runner') ||
              lower.includes('laminate')
            ? '/page1'
            : lower.includes('thrift') ||
                lower.includes('hoodie') ||
                lower.includes('shirt') ||
                lower.includes('jersey') ||
                lower.includes('nike')
              ? '/page3'
              : '/'

      this.$router.push({ path: target, query: { q } })
    },
    goTo(path) {
      this.searchDialog = false
      this.$router.push(path)
    },
  },
}
</script>
