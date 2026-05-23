<template>
  <q-layout view="hHh lpR fff" class="bg-red-2">
    <q-header elevated class="bg-primary text-white" height-hint="98">
      <q-toolbar>
        <q-toolbar-title> UPNM Market Place </q-toolbar-title>

        <q-space />

        <q-btn flat round dense color="white" aria-label="open-search" @click="searchDialog = true">
          <q-icon name="search" />
        </q-btn>
      </q-toolbar>

      <q-tabs
        align="center"
        class="bg-primary text-white"
        active-color="white"
        indicator-color="white"
      >
        <q-route-tab to="main" label="Menu" />
        <q-route-tab to="page1" label="Services" />
        <q-route-tab to="page2" label="Food & Beverages" />
        <q-route-tab to="page3" label="Thrift" />
        <q-route-tab to="page4" label="Login/Register" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-primary-8 text-white">
      <div class="row items-center justify-around q-pa-md text-center">
        <div class="col-12 col-md-4">
          <div class="text-h6">Contact Us</div>
          <div>+60 12-345 6789</div>
        </div>

        <div class="col-12 col-md-4">
          <div class="text-h6">Location</div>
          <div>
            Universiti Pertahanan Nasional Malaysia (UPNM)Kem Perdana Sungai Besi57000 Kuala Lumpur
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="text-h6">Operating Hours</div>
          <div>Mon - Fri: 9:00 AM - 6:00 PM</div>
          <div>Sat: 10:00 AM - 4:00 PM</div>
        </div>
      </div>

      <div class="q-pa-none q-mt-md">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3984.156540531506!2d101.72083667462846!3d3.052733753738503!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc357ad56c0001%3A0x3d5c81a579c4ae1d!2sUniversiti%20Pertahanan%20Nasional%20Malaysia!5e0!3m2!1sen!2smy!4v1779377846314!5m2!1sen!2smy"
          width="100%"
          height="250"
          style="border: 0"
          allowfullscreen=""
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </q-footer>
  </q-layout>
  <q-layout>
    <!-- Search dialog -->
    <q-dialog v-model="searchDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Browse / Search</div>
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="search"
            label="Search for products, services, vendors..."
            dense
            autofocus
            @keyup.enter="doSearch"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="primary" v-close-popup @click="searchDialog = false" />
          <q-btn unelevated color="primary" label="Search" @click="doSearch" />
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
    }
  },
  methods: {
    doSearch() {
      const q = (this.search || '').trim()
      this.searchDialog = false
      if (q) {
        this.$router.push({ path: '/', query: { q } })
      }
    },
  },
}
</script>
