<template>
  <q-page class="auth-page">
    <section class="auth-shell">
      <q-card class="auth-card" flat bordered>
        <q-card-section class="auth-heading">
          <q-avatar color="primary" text-color="white" size="54px">
            <q-icon name="storefront" size="30px" />
          </q-avatar>
          <div>
            <div class="text-h5 text-weight-bold">UPNM Marketplace Account</div>
            <div class="text-grey-7">Log in or register based on your system role.</div>
          </div>
        </q-card-section>

        <q-tabs
          v-model="authMode"
          dense
          active-color="primary"
          indicator-color="primary"
          align="justify"
          class="auth-tabs"
        >
          <q-tab name="login" icon="login" label="Login" />
          <q-tab name="register" icon="person_add" label="Register" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="authMode" animated>
          <q-tab-panel name="login" class="q-pa-lg">
            <q-select
              v-model="loginForm.role"
              outlined
              dense
              label="Login as"
              :options="roleOptions"
              emit-value
              map-options
            />
            <q-input
              v-model="loginForm.email"
              outlined
              dense
              label="Email"
              type="email"
              class="q-mt-md"
            />
            <q-input
              v-model="loginForm.password"
              outlined
              dense
              label="Password"
              type="password"
              class="q-mt-md"
              @keyup.enter="handleLogin"
            />

            <q-banner v-if="message" :class="['auth-message q-mt-md', messageType]">
              {{ message }}
            </q-banner>

            <q-btn
              color="primary"
              unelevated
              icon="login"
              label="Login"
              class="full-width q-mt-md"
              :loading="loading"
              @click="handleLogin"
            />

            <q-btn
              flat
              color="primary"
              icon="lock_reset"
              label="Forgot password"
              class="full-width q-mt-sm"
              @click="handleForgotPassword"
            />
          </q-tab-panel>

          <q-tab-panel name="register" class="q-pa-lg">
            <q-select
              v-model="registerForm.role"
              outlined
              dense
              label="Register as"
              :options="registerRoleOptions"
              emit-value
              map-options
            />
            <q-input
              v-model="registerForm.name"
              outlined
              dense
              label="Full name / Store name"
              class="q-mt-md"
            />
            <q-input
              v-model="registerForm.email"
              outlined
              dense
              label="Email"
              type="email"
              class="q-mt-md"
            />
            <q-input
              v-model="registerForm.password"
              outlined
              dense
              label="Password"
              type="password"
              class="q-mt-md"
              @keyup.enter="handleRegister"
            />

            <q-banner v-if="message" :class="['auth-message q-mt-md', messageType]">
              {{ message }}
            </q-banner>

            <q-btn
              color="primary"
              unelevated
              icon="person_add"
              label="Register account"
              class="full-width q-mt-md"
              :loading="loading"
              @click="handleRegister"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>

      <q-card class="auth-status-card" flat bordered>
        <q-card-section>
          <div class="text-h6">Current session</div>
          <div v-if="currentUser" class="q-mt-md">
            <div class="text-weight-bold">{{ currentUser.name }}</div>
            <div class="text-grey-7">{{ currentUser.email }}</div>
            <q-badge color="primary" class="q-mt-sm" :label="currentUser.role" />
            <q-btn
              flat
              color="negative"
              icon="logout"
              label="Log out"
              class="full-width q-mt-md"
              @click="handleLogout"
            />
          </div>
          <div v-else class="text-grey-7 q-mt-md">
            No user logged in. Guests can still browse products and view details.
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle2 text-weight-bold">Test accounts</div>
          <q-list dense class="q-mt-sm">
            <q-item v-for="account in starterUsers" :key="account.email">
              <q-item-section>
                <q-item-label>{{ account.role.toUpperCase() }}</q-item-label>
                <q-item-label caption>{{ account.email }} / {{ account.password }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </section>
  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'

const starterUsers = [
  { id: 1, name: 'Aiman Buyer', email: 'buyer@upnm.test', role: 'buyer', password: '123456', active: true },
  { id: 2, name: 'Campus Kitchen', email: 'seller@upnm.test', role: 'seller', password: '123456', active: true },
  { id: 3, name: 'Admin UPNM', email: 'admin@upnm.test', role: 'admin', password: '123456', active: true },
]

const roleOptions = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Admin', value: 'admin' },
]

const registerRoleOptions = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
]

const loadState = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

const users = ref(loadState('upnm-users', starterUsers))
const currentUser = ref(loadState('upnm-current-user', null))
const authMode = ref('login')
const loading = ref(false)
const message = ref('')
const messageType = ref('info')

const loginForm = ref({
  role: 'buyer',
  email: 'buyer@upnm.test',
  password: '123456',
})

const registerForm = ref({
  role: 'buyer',
  name: '',
  email: '',
  password: '',
})

watch(users, (value) => localStorage.setItem('upnm-users', JSON.stringify(value)), { deep: true })
watch(currentUser, (value) => localStorage.setItem('upnm-current-user', JSON.stringify(value)), {
  deep: true,
})

const setMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
}

const handleLogin = () => {
  message.value = ''
  loading.value = true

  const user = users.value.find(
    (item) =>
      item.email.toLowerCase() === loginForm.value.email.toLowerCase() &&
      item.password === loginForm.value.password &&
      item.role === loginForm.value.role,
  )

  loading.value = false

  if (!user) {
    setMessage('Invalid email, password, or role.', 'error')
    return
  }

  if (!user.active) {
    setMessage('This account has been suspended by admin.', 'error')
    return
  }

  currentUser.value = user
  setMessage(`Logged in as ${user.name}.`, 'success')
}

const handleRegister = () => {
  message.value = ''
  loading.value = true

  const name = registerForm.value.name.trim()
  const email = registerForm.value.email.trim().toLowerCase()
  const password = registerForm.value.password

  loading.value = false

  if (!name || !email || !password) {
    setMessage('Please fill in name, email, and password.', 'error')
    return
  }

  const exists = users.value.some((user) => user.email.toLowerCase() === email)
  if (exists) {
    setMessage('Account already exists. Please log in.', 'error')
    return
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: registerForm.value.role,
    active: true,
  }

  users.value.push(newUser)
  currentUser.value = newUser
  authMode.value = 'login'
  loginForm.value = {
    role: newUser.role,
    email: newUser.email,
    password: newUser.password,
  }
  registerForm.value = { role: 'buyer', name: '', email: '', password: '' }
  setMessage(`${newUser.role.toUpperCase()} account registered and logged in.`, 'success')
}

const handleForgotPassword = () => {
  const email = loginForm.value.email.trim().toLowerCase()
  const user = users.value.find(
    (item) => item.email.toLowerCase() === email && item.role === loginForm.value.role,
  )

  setMessage(
    user ? `Password reset link prepared for ${user.email}.` : 'No account found for that role.',
    user ? 'success' : 'error',
  )
}

const handleLogout = () => {
  currentUser.value = null
  setMessage('Logged out successfully.', 'success')
}
</script>
