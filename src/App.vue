<!-- Purpose: Root Vue component; it renders whichever page Vue Router selects. -->
<template>
  <router-view v-if="isReady" />
  <div v-else class="app-loading-screen">Loading marketplace...</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { initializeSupabaseCache } from 'src/database'

const isReady = ref(false)

onMounted(async () => {
  await initializeSupabaseCache()
  isReady.value = true
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
