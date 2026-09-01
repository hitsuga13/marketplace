// Purpose: Local user store for test users, registration/login sessions, roles, recovery codes, and profile data.
import { loadState, saveState } from './storage.js'
import { syncUsersToSupabase, updateUserProfileInSupabase } from './supabaseSync.js'

const ONLINE_WINDOW_MS = 2 * 60 * 1000
const IDLE_WINDOW_MS = 10 * 60 * 1000

export const starterUsers = [
  {
    id: 1,
    name: 'Demo Buyer',
    email: 'buyer@upnm.test',
    role: 'buyer',
    password: '',
    recoveryCode: 'BUYER-2026',
    active: true,
  },
  {
    id: 2,
    name: 'Demo Seller',
    email: 'seller@upnm.test',
    role: 'seller',
    password: '',
    recoveryCode: 'SELLER-2026',
    active: true,
  },
  {
    id: 3,
    name: 'Demo Admin',
    email: 'admin@upnm.test',
    role: 'admin',
    password: '',
    recoveryCode: 'ADMIN-2026',
    active: true,
  },
]

export const generateRecoveryCode = () =>
  `UPNM-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`

export const getUsers = () => {
  const storedUsers = loadState('upnm-users', [])
  const mergedUsers = [...storedUsers]

  starterUsers.forEach((starterUser) => {
    const exists = mergedUsers.some(
      (user) =>
        user.id === starterUser.id ||
        user.email?.toLowerCase() === starterUser.email.toLowerCase(),
    )
    if (!exists) mergedUsers.push(starterUser)
  })

  return mergedUsers.map((user) => ({
    ...user,
    verifiedSeller: user.role === 'seller' ? user.verifiedSeller !== false : false,
    recoveryCode: user.recoveryCode || generateRecoveryCode(),
  }))
}

export const isVerifiedSeller = (user) => user?.role === 'seller' && user.verifiedSeller !== false

export const saveUsers = (users, options = {}) => {
  saveState('upnm-users', users)
  if (options.localOnly) return Promise.resolve()
  return syncUsersToSupabase(users, options)
}

export const saveUserProfile = async (users, user) => {
  saveState('upnm-users', users)
  await updateUserProfileInSupabase(user)
}

export const getCurrentUser = () => loadState('upnm-current-user', null)

export const setCurrentUser = (user) => {
  saveState('upnm-current-user', user)
  window.dispatchEvent(new Event('upnm-current-user-updated'))
}

export const getUserPresenceStatus = (user) => {
  if (!user || user.role !== 'seller') return 'offline'

  const lastSeenTime = user.lastSeenAt ? new Date(user.lastSeenAt).getTime() : 0
  if (!lastSeenTime) return user.presenceStatus || 'offline'

  const age = Date.now() - lastSeenTime
  if (age <= ONLINE_WINDOW_MS) return 'online'
  if (age <= IDLE_WINDOW_MS) return 'idle'
  return 'offline'
}

export const markCurrentUserPresence = (status = 'online', userOverride = null) => {
  const currentUser = userOverride || getCurrentUser()
  if (currentUser?.role !== 'seller') return null

  const nextUser = {
    ...currentUser,
    presenceStatus: status,
    lastSeenAt: new Date().toISOString(),
  }

  const users = getUsers().map((user) =>
    String(user.id) === String(nextUser.id) ? { ...user, ...nextUser } : user,
  )

  saveUsers(users)
  setCurrentUser(nextUser)
  window.dispatchEvent(new Event('upnm-presence-updated'))
  return nextUser
}

export const getRoleHome = (role) => {
  if (role === 'seller') return '/seller'
  if (role === 'admin') return '/admin'
  return '/buyer-dashboard'
}
