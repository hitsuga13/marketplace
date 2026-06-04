<!-- Purpose: Root Vue component; it renders whichever page Vue Router selects. -->
<template>
  <router-view v-if="isReady" />
  <div v-else class="app-loading-screen">Loading marketplace...</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { initializeSupabaseCache } from 'src/database'
import { getPublicAsset } from 'src/utils/assets'

const isReady = ref(false)
let supabaseRefreshTimer = null

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty(
    '--asset-fnb',
    `url("${getPublicAsset('icons/f&b.jpg')}")`,
  )
  document.documentElement.style.setProperty(
    '--asset-fnb-menu',
    `url("${getPublicAsset('icons/f&b_3.jpg')}")`,
  )
  document.documentElement.style.setProperty(
    '--asset-services',
    `url("${getPublicAsset('icons/services.jpg')}")`,
  )
  document.documentElement.style.setProperty(
    '--asset-thrift',
    `url("${getPublicAsset('icons/thrift.jpg')}")`,
  )
}

onMounted(async () => {
  await initializeSupabaseCache()
  isReady.value = true

  // Keep live pages fresh when another user sends chats, posts products, or updates orders.
  supabaseRefreshTimer = window.setInterval(() => {
    initializeSupabaseCache()
  }, 5000)
})

onBeforeUnmount(() => {
  if (supabaseRefreshTimer) window.clearInterval(supabaseRefreshTimer)
})
</script>

<style>
.app-loading-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #eef3fb;
  color: #27459a;
  font-family: Poppins, sans-serif;
  font-weight: 700;
}
</style>
