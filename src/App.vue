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
let lastSupabaseRefreshAt = 0
const SUPABASE_REFRESH_COOLDOWN_MS = 60000

if (typeof document !== 'undefined') {
  document.documentElement.style.setProperty(
    '--asset-fnb',
    `url("${getPublicAsset('icons/f&b.jpg')}")`,
  )
  document.documentElement.style.setProperty(
    '--asset-fnb-menu',
    `url("${getPublicAsset('icons/f&b_2.jpg')}")`,
  )
  document.documentElement.style.setProperty(
    '--asset-services',
    `url("${getPublicAsset('icons/services_3.jpg')}")`,
  )
  document.documentElement.style.setProperty(
    '--asset-thrift',
    `url("${getPublicAsset('icons/thrift_3.jpg')}")`,
  )
}

const refreshSupabaseCache = async (force = false) => {
  const now = Date.now()
  if (!force && now - lastSupabaseRefreshAt < SUPABASE_REFRESH_COOLDOWN_MS) return

  lastSupabaseRefreshAt = now
  await initializeSupabaseCache()
}

const refreshWhenVisible = () => {
  if (document.visibilityState === 'visible') refreshSupabaseCache()
}

onMounted(async () => {
  await refreshSupabaseCache(true)
  isReady.value = true

  window.addEventListener('online', refreshSupabaseCache)
  window.addEventListener('focus', refreshSupabaseCache)
  document.addEventListener('visibilitychange', refreshWhenVisible)
})

onBeforeUnmount(() => {
  window.removeEventListener('online', refreshSupabaseCache)
  window.removeEventListener('focus', refreshSupabaseCache)
  document.removeEventListener('visibilitychange', refreshWhenVisible)
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
