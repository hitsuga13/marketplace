<template>
  <q-page class="q-pa-md">
    <div class="page-shell">
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Back to marketplace"
        class="q-mb-md"
        @click="$router.back()"
      />
      <SellerProfile
        :seller-id="sellerId"
        :buyer-id="buyerId"
        :viewer-id="viewerId"
        :fallback-seller="fallbackSeller"
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SellerProfile from 'src/components/SellerProfile.vue'
import { getCurrentUser, getUsers } from 'src/database'

const route = useRoute()
const sellerId = computed(() => route.params.sellerId)
const buyerId = computed(() => {
  const user = getCurrentUser()
  return user?.role === 'buyer' ? user.id : ''
})
const viewerId = computed(() => getCurrentUser()?.id || '')
const fallbackSeller = computed(() =>
  getUsers().find((user) => String(user.id) === String(sellerId.value)),
)
</script>
