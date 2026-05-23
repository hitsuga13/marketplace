<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg q-mx-auto" style="max-width: 600px; width: 100%">
      <q-card-section>
        <div class="text-h5 text-center q-mb-md">🛍️ UniMarket Login</div>
      </q-card-section>

      <q-card-section class="q-gutter-md">
        <q-input v-model="form.email" label="Email" type="email" outlined />
        <q-input v-model="form.password" label="Password" type="password" outlined />
        <div v-if="error" class="text-negative text-center">{{ error }}</div>
        <q-btn
          label="Login"
          color="primary"
          class="full-width"
          :loading="loading"
          @click="handleLogin"
        />
      </q-card-section>

      <q-card-section class="text-center">
        Don't have an account?
        <router-link to="/register" class="text-primary">Register here</router-link>
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref } from 'vue'

const form = ref({
  email: '',
  password: '',
})
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  error.value = ''
  loading.value = true
  try {
    // login logic here
  } catch {
    error.value = 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
