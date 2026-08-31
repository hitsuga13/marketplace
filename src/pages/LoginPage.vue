<!-- Purpose: Handles sign in, sign up, account profile editing, recovery codes, profile photo crop, and seller QR upload. -->
<template>
  <q-page class="auth-page">
    <section :class="currentUser ? 'profile-shell' : 'auth-shell'">
      <q-card v-if="currentUser" class="profile-card" flat bordered>
        <q-card-section class="profile-topbar">
          <div>
            <div class="profile-welcome">Welcome, {{ firstName }}</div>
            <div class="profile-date">{{ todayText }}</div>
          </div>
        </q-card-section>

        <div class="profile-cover"></div>

        <q-card-section class="profile-main">
          <div class="profile-identity-row">
            <div class="profile-identity">
              <q-avatar size="86px" class="profile-avatar">
                <img v-if="profileForm.avatar" :src="profileForm.avatar" alt="Profile picture" />
                <q-icon v-else name="person" size="48px" />
              </q-avatar>
              <div>
                <div class="profile-name">{{ currentUser.name }}</div>
                <div class="profile-email">{{ currentUser.email }}</div>
                <q-badge color="primary" class="q-mt-sm" :label="currentUser.role" />
              </div>
            </div>
            <q-btn
              unelevated
              color="primary"
              :icon="isEditingProfile ? 'edit' : undefined"
              :label="isEditingProfile ? 'Editing' : 'Edit'"
              class="profile-edit-btn"
              @click="startProfileEdit"
            />
          </div>

          <div class="profile-form-grid">
            <div class="col-12 col-md-6">
              <div class="profile-field-label">Full Name</div>
              <q-input
                ref="nameInput"
                v-model="profileForm.name"
                borderless
                dense
                :readonly="!isEditingProfile"
                placeholder="Your full name"
                class="profile-field"
              />
            </div>
            <div class="col-12 col-md-6">
              <div class="profile-field-label">Phone Number</div>
              <q-input
                v-model="profileForm.phone"
                borderless
                dense
                :readonly="!isEditingProfile"
                placeholder="Your phone number"
                class="profile-field"
              />
            </div>
            <div class="col-12 col-md-6">
              <div class="profile-field-label">Email Address</div>
              <q-input
                v-model="profileForm.email"
                borderless
                dense
                :readonly="!isEditingProfile"
                placeholder="Your email"
                type="email"
                class="profile-field"
              />
            </div>
            <div class="col-12 col-md-6">
              <div class="profile-field-label">Profile Picture</div>
              <div class="profile-picture-control">
                <q-avatar size="74px" class="profile-picture-control__avatar">
                  <img v-if="profileForm.avatar" :src="profileForm.avatar" alt="Profile picture" />
                  <q-icon v-else name="person" size="42px" />
                </q-avatar>
                <div class="profile-picture-control__actions">
                  <input
                    ref="profilePictureInput"
                    type="file"
                    accept="image/*"
                    class="hidden-file-input"
                    @change="handleProfilePicture"
                  />
                  <q-btn
                    unelevated
                    color="primary"
                    icon="photo_camera"
                    label="Change profile picture"
                    no-caps
                    class="profile-upload-btn"
                    @click="openProfileCropper"
                  />
                  <q-btn
                    v-if="profileForm.avatar"
                    flat
                    dense
                    color="negative"
                    icon="delete"
                    label="Delete profile picture"
                    no-caps
                    @click="deleteProfilePicture"
                  />
                </div>
              </div>
            </div>
            <div v-if="currentUser.role === 'seller'" class="col-12">
              <div class="profile-field-label">Seller Payment QR</div>
              <div class="seller-qr-profile">
                <q-img
                  v-if="profileForm.paymentQr"
                  :src="profileForm.paymentQr"
                  ratio="1"
                  fit="contain"
                  class="seller-qr-preview"
                />
                <div v-else class="seller-qr-empty">
                  <q-icon name="qr_code_2" size="44px" color="primary" />
                  <div>Upload QR code for buyer payment</div>
                </div>
              </div>
              <input
                ref="paymentQrInput"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="handlePaymentQr"
              />
              <q-btn
                unelevated
                color="primary"
                icon="qr_code_2"
                :label="profileForm.paymentQr ? 'Resize payment QR' : 'Upload payment QR'"
                no-caps
                class="profile-upload-btn q-mt-sm"
                @click="openPaymentQrCropper"
              />
            </div>
          </div>

          <q-banner v-if="message" :class="['auth-message q-mt-md', messageType]">
            {{ message }}
          </q-banner>

          <div class="row q-col-gutter-sm q-mt-md">
            <div class="col-12 col-sm-6">
              <q-btn
                unelevated
                color="primary"
                icon="save"
                label="Save profile"
                class="full-width profile-action-btn"
                @click="handleSaveProfile"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-btn
                outline
                color="negative"
                icon="logout"
                label="Log out"
                class="full-width profile-action-btn"
                @click="handleLogout"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <ImageCropDialog
        v-model="profileCropDialog"
        :source="profileCropSource"
        shape="circle"
        title="Preview Profile Picture"
        :output-size="420"
        :quality="0.72"
        @confirm="applyProfileCrop"
        @select-another="selectAnotherProfilePicture"
      />

      <ImageCropDialog
        v-model="paymentQrCropDialog"
        :source="paymentQrCropSource"
        shape="square"
        title="Preview Payment QR"
        :output-size="720"
        :quality="0.82"
        @confirm="applyPaymentQrCrop"
        @select-another="selectAnotherPaymentQr"
      />

      <div
        v-if="!currentUser"
        :class="['auth-morph-card', { 'auth-morph-card--signup': authMode === 'register' }]"
      >
        <div class="auth-shape auth-shape--corner"></div>
        <div class="auth-shape auth-shape--circle"></div>

        <section class="auth-form-pane">
          <div class="auth-brand">
            <img :src="getPublicAsset('icons/upnm-logo.png')" alt="UPNM logo" />
            <span>UPNM Campus Marketplace</span>
          </div>

          <transition :name="authTransitionName" mode="out-in">
            <div v-if="authMode === 'login'" key="signin" class="auth-form-content">
              <h1>Sign in to UPNM</h1>
              <div class="auth-social-row">
                <q-btn round outline color="primary" icon="school" />
                <q-btn round outline color="primary" icon="mail" />
                <q-btn round outline color="primary" icon="person" />
              </div>
              <div class="auth-helper">or use your marketplace account</div>

              <q-select
                v-model="loginForm.role"
                borderless
                dense
                :options="roleOptions"
                emit-value
                map-options
                class="auth-morph-field"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="grey-6" />
                </template>
              </q-select>
              <q-input
                v-model="loginForm.email"
                borderless
                dense
                placeholder="Email"
                type="email"
                class="auth-morph-field"
              >
                <template v-slot:prepend>
                  <q-icon name="mail_outline" color="grey-6" />
                </template>
              </q-input>
              <q-input
                v-model="loginForm.password"
                borderless
                dense
                placeholder="Password"
                type="password"
                class="auth-morph-field"
                @keyup.enter="handleLogin"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="grey-6" />
                </template>
              </q-input>

              <q-btn
                flat
                color="dark"
                label="Forgot your password?"
                no-caps
                class="auth-link-btn"
                @click="handleForgotPassword"
              />

              <q-btn
                unelevated
                color="primary"
                label="SIGN IN"
                class="auth-main-btn"
                :loading="loading"
                @click="handleLogin"
              />

              <q-banner v-if="message" :class="['auth-message q-mt-md', messageType]">
                {{ message }}
              </q-banner>
            </div>

            <div v-else key="signup" class="auth-form-content">
              <h1>Create Account</h1>
              <div class="auth-social-row">
                <q-btn round outline color="primary" icon="school" />
                <q-btn round outline color="primary" icon="mail" />
                <q-btn round outline color="primary" icon="person" />
              </div>
              <div class="auth-helper">or use your email for sign up</div>

              <q-select
                v-model="registerForm.role"
                borderless
                dense
                :options="registerRoleOptions"
                emit-value
                map-options
                class="auth-morph-field"
              >
                <template v-slot:prepend>
                  <q-icon name="badge" color="grey-6" />
                </template>
              </q-select>
              <q-input
                v-model="registerForm.name"
                borderless
                dense
                placeholder="Full name / Store name"
                class="auth-morph-field"
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" color="grey-6" />
                </template>
              </q-input>
              <q-input
                v-model="registerForm.phone"
                borderless
                dense
                placeholder="Phone number"
                class="auth-morph-field"
              >
                <template v-slot:prepend>
                  <q-icon name="phone" color="grey-6" />
                </template>
              </q-input>
              <q-input
                v-model="registerForm.email"
                borderless
                dense
                placeholder="Email"
                type="email"
                class="auth-morph-field"
              >
                <template v-slot:prepend>
                  <q-icon name="mail_outline" color="grey-6" />
                </template>
              </q-input>
              <q-input
                v-model="registerForm.password"
                borderless
                dense
                placeholder="Password"
                type="password"
                class="auth-morph-field"
                @keyup.enter="handleRegister"
              >
                <template v-slot:prepend>
                  <q-icon name="lock_outline" color="grey-6" />
                </template>
              </q-input>

              <q-banner v-if="message" :class="['auth-message q-mt-md', messageType]">
                {{ message }}
              </q-banner>

              <q-btn
                unelevated
                color="primary"
                label="SIGN UP"
                class="auth-main-btn"
                :loading="loading"
                @click="handleRegister"
              />
            </div>
          </transition>
        </section>

        <section class="auth-panel-pane">
          <div class="auth-panel-shape auth-panel-shape--one"></div>
          <div class="auth-panel-shape auth-panel-shape--two"></div>
          <transition :name="authTransitionName" mode="out-in">
            <div v-if="authMode === 'login'" key="signup-panel" class="auth-panel-content">
              <h2>Hello, Friend!</h2>
              <p>Enter your details and start your UPNM marketplace journey with us.</p>
              <q-btn outline color="white" label="SIGN UP" class="auth-panel-btn" @click="authMode = 'register'" />
            </div>
            <div v-else key="signin-panel" class="auth-panel-content">
              <h2>Welcome Back!</h2>
              <p>To keep connected with campus sellers, sign in with your personal info.</p>
              <q-btn outline color="white" label="SIGN IN" class="auth-panel-btn" @click="authMode = 'login'" />
            </div>
          </transition>
        </section>
      </div>

      <q-dialog v-model="recoveryCodeDialog" persistent>
        <q-card class="recovery-dialog-card">
          <q-card-section class="text-center">
            <q-avatar color="primary" text-color="white" size="58px">
              <q-icon name="vpn_key" size="32px" />
            </q-avatar>
            <div class="text-h6 text-weight-bold q-mt-md">{{ recoveryDialogTitle }}</div>
            <p class="text-grey-7 q-mt-sm">
              {{ recoveryDialogDescription }}
            </p>

            <div class="recovery-code-display q-mt-md">{{ recoveryCodeToShow }}</div>

            <q-banner class="auth-message error q-mt-md">
              Important: if you forget this recovery code and your login details, you cannot
              recover your account from the system. The only other option is to contact the admin
              and send proof that you are the real account holder.
            </q-banner>
          </q-card-section>

          <q-card-actions align="center" class="q-px-md q-pb-md">
            <q-btn
              outline
              color="primary"
              icon="download"
              label="Save as Image"
              no-caps
              @click="downloadRecoveryCodeImage"
            />
            <q-btn
              unelevated
              color="primary"
              icon="check_circle"
              :label="recoveryPrimaryActionLabel"
              no-caps
              @click="finishRecoveryCodeNotice"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="forgotPasswordDialog" persistent>
        <q-card class="recovery-dialog-card">
          <q-card-section>
            <div class="text-h6 text-weight-bold">Recover Account</div>
            <div class="text-grey-7 q-mt-xs">
              Enter your account email, role, recovery code, and new password.
            </div>

            <q-select
              v-model="forgotForm.role"
              outlined
              dense
              :options="roleOptions"
              emit-value
              map-options
              label="Account role"
              class="q-mt-md"
            />
            <q-input
              v-model="forgotForm.email"
              outlined
              dense
              type="email"
              label="Email"
              class="q-mt-md"
            />
            <q-input
              v-model="forgotForm.recoveryCode"
              outlined
              dense
              label="Recovery code"
              class="q-mt-md"
            />
            <q-input
              v-model="forgotForm.newPassword"
              outlined
              dense
              type="password"
              label="New password"
              class="q-mt-md"
              @keyup.enter="resetPasswordWithRecoveryCode"
            />

            <q-banner class="auth-message error q-mt-md">
              If you do not have this recovery code, contact admin and provide proof that you are
              the real account holder.
            </q-banner>

            <q-banner v-if="forgotMessage" :class="['auth-message q-mt-md', forgotMessageType]">
              {{ forgotMessage }}
            </q-banner>
          </q-card-section>

          <q-card-actions align="right" class="q-px-md q-pb-md">
            <q-btn flat color="grey-7" label="Cancel" v-close-popup />
            <q-btn
              unelevated
              color="primary"
              icon="lock_reset"
              label="Reset password"
              @click="resetPasswordWithRecoveryCode"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </section>

  </q-page>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import ImageCropDialog from 'src/components/ImageCropDialog.vue'
import { getUploadSizeError } from 'src/utils/fileValidation'
import { getPublicAsset } from 'src/utils/assets'
import { isSupabaseConfigured, supabase } from 'src/supabase/client'
import {
  generateRecoveryCode,
  getCurrentUser,
  getRoleHome,
  getUsers,
  markCurrentUserPresence,
  saveUsers,
  setCurrentUser,
} from 'src/database'

const router = useRouter()
const $q = useQuasar()

const roleOptions = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
  { label: 'Admin', value: 'admin' },
]

const registerRoleOptions = [
  { label: 'Buyer', value: 'buyer' },
  { label: 'Seller', value: 'seller' },
]

const users = ref(getUsers())
const currentUser = ref(getCurrentUser())
const authMode = ref('login')
const loading = ref(false)
const message = ref('')
const messageType = ref('info')
const isEditingProfile = ref(false)
const nameInput = ref(null)
const profilePictureInput = ref(null)
const profileCropDialog = ref(false)
const profileCropSource = ref('')
const paymentQrInput = ref(null)
const paymentQrCropDialog = ref(false)
const paymentQrCropSource = ref('')
const recoveryCodeDialog = ref(false)
const forgotPasswordDialog = ref(false)
const recoveryCodeToShow = ref('')
const recoveryNoticeType = ref('signup')
const forgotMessage = ref('')
const forgotMessageType = ref('info')

const loginForm = ref({
  role: 'buyer',
  email: 'buyer@upnm.test',
  password: '123456',
})

const registerForm = ref({
  role: 'buyer',
  name: '',
  phone: '',
  email: '',
  password: '',
})

const forgotForm = ref({
  role: 'buyer',
  email: '',
  recoveryCode: '',
  newPassword: '',
})

const profileForm = ref({
  name: currentUser.value?.name || '',
  phone: currentUser.value?.phone || '',
  email: currentUser.value?.email || '',
  avatar: currentUser.value?.avatar || '',
  paymentQr: currentUser.value?.paymentQr || '',
})


const firstName = computed(() => currentUser.value?.name?.split(' ')[0] || 'User')

const recoveryDialogTitle = computed(() =>
  recoveryNoticeType.value === 'recovered' ? 'Account Recovered' : 'Save Your Recovery Code',
)

const recoveryDialogDescription = computed(() =>
  recoveryNoticeType.value === 'recovered'
    ? 'Your account has been successfully recovered and your password has been changed. Save this new recovery code image.'
    : 'Save this recovery code image. You will need it if you forget your password.',
)

const recoveryPrimaryActionLabel = computed(() =>
  recoveryNoticeType.value === 'recovered' ? 'Continue to account' : 'I saved this code',
)

const recoveryCodeImage = computed(() => {
  const code = recoveryCodeToShow.value || 'UPNM-XXXX-XXXX'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
      <rect width="900" height="520" rx="34" fill="#eef4ff"/>
      <rect x="42" y="42" width="816" height="436" rx="28" fill="#ffffff" stroke="#d8e2f5" stroke-width="3"/>
      <circle cx="450" cy="128" r="42" fill="#27459a"/>
      <text x="450" y="143" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="#ffffff">K</text>
      <text x="450" y="206" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#17233d">UPNM Campus Marketplace Recovery Code</text>
      <rect x="150" y="250" width="600" height="88" rx="18" fill="#eef4ff" stroke="#27459a" stroke-width="3" stroke-dasharray="10 10"/>
      <text x="450" y="307" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" letter-spacing="3" fill="#27459a">${code}</text>
      <text x="450" y="384" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#5e6a84">Save this image. If you lose this code and your login details,</text>
      <text x="450" y="414" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#5e6a84">you must contact admin with proof of account ownership.</text>
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
})

const authTransitionName = computed(() =>
  authMode.value === 'register' ? 'auth-slide-left' : 'auth-slide-right',
)

const todayText = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date())

watch(users, (value) => saveUsers(value), { deep: true })
watch(currentUser, (value) => setCurrentUser(value), { deep: true })

watch(
  currentUser,
  (value) => {
    ensureUserRecoveryCode(value)
    profileForm.value = {
      name: value?.name || '',
      phone: value?.phone || '',
      email: value?.email || '',
      avatar: value?.avatar || '',
      paymentQr: value?.paymentQr || '',
    }
  },
  { deep: true },
)

const ensureUserRecoveryCode = (user) => {
  if (!user || user.recoveryCode) return

  const updatedUser = {
    ...user,
    recoveryCode: generateRecoveryCode(),
  }
  const index = users.value.findIndex((item) => item.id === user.id)
  if (index > -1) users.value[index] = updatedUser
  currentUser.value = updatedUser
}

const setMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
}

const findUserByEmailAndRole = (email, role) =>
  users.value.find(
    (item) => item.email.toLowerCase() === email.toLowerCase() && item.role === role,
  )

const fetchProfileForAuthUser = async (authUser, role) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', authUser.id)
    .eq('role', role)
    .maybeSingle()

  if (error) throw error
  return data
}

const mapSupabaseUser = (user) => ({
  id: user.local_id || user.id,
  authId: user.auth_id || '',
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  password: '',
  role: user.role,
  avatar: user.avatar || '',
  paymentQr: user.payment_qr || '',
  businessHours: user.business_hours || '',
  pickupAddress: user.pickup_address || '',
  recoveryCode: user.recovery_code || '',
  verifiedSeller: user.role === 'seller' ? user.verified_seller !== false : false,
  presenceStatus: user.presence_status || 'offline',
  lastSeenAt: user.last_seen_at || '',
  active: user.active !== false,
})

const upsertLocalUser = (user) => {
  const index = users.value.findIndex((item) => String(item.id) === String(user.id))
  if (index > -1) users.value[index] = user
  else users.value.push(user)
}

const handleLogin = async () => {
  message.value = ''
  loading.value = true

  const email = loginForm.value.email.trim().toLowerCase()
  const password = loginForm.value.password
  let user = null

  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const profile = await fetchProfileForAuthUser(data.user, loginForm.value.role)
      if (!profile) throw new Error('No profile found for that email and role.')
      user = mapSupabaseUser(profile)
      upsertLocalUser(user)
    } else {
      user = users.value.find(
        (item) =>
          item.email.toLowerCase() === email &&
          item.password === password &&
          item.role === loginForm.value.role,
      )
    }

    if (!user) throw new Error('Invalid email, password, or role.')
    if (!user.active) throw new Error('This account has been suspended by admin.')

    currentUser.value = user
    if (user.role === 'seller') markCurrentUserPresence('online', user)
    setMessage(`Logged in as ${user.name}.`, 'success')
    router.push(getRoleHome(user.role))
  } catch (error) {
    setMessage(error?.message || 'Invalid email, password, or role.', 'error')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  message.value = ''
  loading.value = true

  const name = registerForm.value.name.trim()
  const phone = registerForm.value.phone.trim()
  const email = registerForm.value.email.trim().toLowerCase()
  const password = registerForm.value.password

  if (!name || !phone || !email || !password) {
    setMessage('Please fill in name, phone number, email, and password.', 'error')
    loading.value = false
    return
  }

  try {
    const exists = findUserByEmailAndRole(email, registerForm.value.role)
    if (exists) throw new Error('Account already exists. Please log in.')

    const recoveryCode = generateRecoveryCode()
    const newUser = {
      id: Date.now(),
      authId: '',
      name,
      phone,
      email,
      password: isSupabaseConfigured ? '' : password,
      role: registerForm.value.role,
      avatar: '',
      paymentQr: '',
      recoveryCode,
      active: true,
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: registerForm.value.role } },
      })
      if (error) throw error
      newUser.authId = data.user?.id || ''
    }

    users.value.push(newUser)
    currentUser.value = newUser
    if (newUser.role === 'seller') markCurrentUserPresence('online', newUser)
    authMode.value = 'login'
    loginForm.value = {
      role: newUser.role,
      email: newUser.email,
      password,
    }
    registerForm.value = { role: 'buyer', name: '', phone: '', email: '', password: '' }
    setMessage(`${newUser.role.toUpperCase()} account registered and logged in.`, 'success')
    recoveryCodeToShow.value = recoveryCode
    recoveryNoticeType.value = 'signup'
    recoveryCodeDialog.value = true
  } catch (error) {
    setMessage(error?.message || 'Unable to register account.', 'error')
  } finally {
    loading.value = false
  }
}

const getSelectedFile = (eventOrFile) => eventOrFile?.target?.files?.[0] || eventOrFile

const openProfileCropper = () => {
  if (profileForm.value.avatar) {
    profileCropSource.value = profileForm.value.avatar
    profileCropDialog.value = true
    return
  }

  profilePictureInput.value?.click()
}

const selectAnotherProfilePicture = () => {
  profilePictureInput.value?.click()
}

const handleProfilePicture = (eventOrFile) => {
  const file = getSelectedFile(eventOrFile)
  if (!file) return

  const uploadError = getUploadSizeError(file, 'profile picture')
  if (uploadError) {
    if (profilePictureInput.value) profilePictureInput.value.value = ''
    $q.notify({
      type: 'negative',
      message: uploadError,
      position: 'top',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    profileCropSource.value = reader.result
    profileCropDialog.value = true
    if (profilePictureInput.value) profilePictureInput.value.value = ''
  }
  reader.readAsDataURL(file)
}

const applyProfileCrop = (croppedImage) => {
  profileForm.value.avatar = croppedImage
}

const deleteProfilePicture = () => {
  profileForm.value.avatar = ''
  profileCropSource.value = ''
}

const openPaymentQrCropper = () => {
  if (profileForm.value.paymentQr) {
    paymentQrCropSource.value = profileForm.value.paymentQr
    paymentQrCropDialog.value = true
    return
  }

  paymentQrInput.value?.click()
}

const selectAnotherPaymentQr = () => {
  paymentQrInput.value?.click()
}

const handlePaymentQr = (eventOrFile) => {
  const file = getSelectedFile(eventOrFile)
  if (!file) return

  const uploadError = getUploadSizeError(file, 'payment QR image')
  if (uploadError) {
    if (paymentQrInput.value) paymentQrInput.value.value = ''
    $q.notify({
      type: 'negative',
      message: uploadError,
      position: 'top',
    })
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    paymentQrCropSource.value = reader.result
    paymentQrCropDialog.value = true
    if (paymentQrInput.value) paymentQrInput.value.value = ''
  }
  reader.readAsDataURL(file)
}

const applyPaymentQrCrop = (croppedImage) => {
  profileForm.value.paymentQr = croppedImage
}

const startProfileEdit = async () => {
  isEditingProfile.value = true
  await nextTick()
  nameInput.value?.focus()
}

const handleSaveProfile = () => {
  const name = profileForm.value.name.trim()
  const phone = profileForm.value.phone.trim()
  const email = profileForm.value.email.trim().toLowerCase()

  if (!name || !phone || !email) {
    setMessage('Please fill in full name, phone number, and email.', 'error')
    return
  }

  const emailUsed = users.value.some(
    (user) => user.id !== currentUser.value.id && user.email.toLowerCase() === email,
  )

  if (emailUsed) {
    setMessage('That email is already used by another account.', 'error')
    return
  }

  const updatedUser = {
    ...currentUser.value,
    name,
    phone,
    email,
    avatar: profileForm.value.avatar.trim(),
    paymentQr: profileForm.value.paymentQr,
  }

  const index = users.value.findIndex((user) => user.id === currentUser.value.id)
  if (index > -1) users.value[index] = updatedUser

  currentUser.value = updatedUser
  isEditingProfile.value = false
  setMessage('Profile updated successfully.', 'success')
}

const handleForgotPassword = () => {
  forgotForm.value = {
    role: loginForm.value.role,
    email: loginForm.value.email,
    recoveryCode: '',
    newPassword: '',
  }
  forgotMessage.value = ''
  forgotPasswordDialog.value = true
}

const resetPasswordWithRecoveryCode = () => {
  const email = forgotForm.value.email.trim().toLowerCase()
  const code = forgotForm.value.recoveryCode.trim().toUpperCase()
  const newPassword = forgotForm.value.newPassword

  if (!email || !code || !newPassword) {
    forgotMessage.value = 'Please fill in email, recovery code, and new password.'
    forgotMessageType.value = 'error'
    return
  }

  if (isSupabaseConfigured) {
    forgotMessage.value =
      'Password reset is handled by Supabase Auth. Contact admin to reset this account password.'
    forgotMessageType.value = 'error'
    return
  }

  const user = users.value.find(
    (item) => item.email.toLowerCase() === email && item.role === forgotForm.value.role,
  )

  if (!user) {
    forgotMessage.value = 'No account found for that email and role.'
    forgotMessageType.value = 'error'
    return
  }

  if ((user.recoveryCode || '').toUpperCase() !== code) {
    forgotMessage.value =
      'Invalid recovery code. If you lost it, contact admin with proof that you own this account.'
    forgotMessageType.value = 'error'
    return
  }

  const newRecoveryCode = generateRecoveryCode()
  const updatedUser = {
    ...user,
    password: newPassword,
    recoveryCode: newRecoveryCode,
  }
  const index = users.value.findIndex((item) => item.id === user.id)
  if (index > -1) users.value[index] = updatedUser

  forgotPasswordDialog.value = false
  currentUser.value = updatedUser
  loginForm.value = {
    role: updatedUser.role,
    email: updatedUser.email,
    password: newPassword,
  }
  forgotForm.value = { role: 'buyer', email: '', recoveryCode: '', newPassword: '' }
  recoveryCodeToShow.value = newRecoveryCode
  recoveryNoticeType.value = 'recovered'
  recoveryCodeDialog.value = true
  setMessage(
    'Your account has been successfully recovered and you are now logged in.',
    'success',
  )
}

const downloadRecoveryCodeImage = () => {
  const image = new Image()

  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 900
    canvas.height = 520

    const context = canvas.getContext('2d')
    context.drawImage(image, 0, 0)

    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `upnm-recovery-code-${Date.now()}.png`
    link.click()
  }

  image.src = recoveryCodeImage.value
}

const finishRecoveryCodeNotice = () => {
  recoveryCodeDialog.value = false
  if (currentUser.value) {
    router.push(getRoleHome(currentUser.value.role))
  }
}

const handleLogout = () => {
  markCurrentUserPresence('offline')
  if (isSupabaseConfigured && supabase) supabase.auth.signOut()
  currentUser.value = null
  setMessage('Logged out successfully.', 'success')
  router.push('/main')
}
</script>
