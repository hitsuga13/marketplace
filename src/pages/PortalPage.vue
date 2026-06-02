<template>
  <q-page class="portal-page">
    <section class="portal-hero">
      <div class="page-shell">
        <q-badge color="secondary" text-color="dark" label="Role based marketplace" />
        <h1>UPNM Marketplace Portal</h1>
        <p>
          Use the system as Buyer, Seller, or Admin. Every role has its own actions, forms, and
          working prototype flow.
        </p>
      </div>
    </section>

    <section class="portal-band">
      <div class="page-shell">
        <q-card class="portal-shell" flat bordered>
          <q-tabs
            v-model="activeRole"
            dense
            active-color="primary"
            indicator-color="primary"
            align="justify"
            class="role-tabs"
          >
            <q-tab name="buyer" icon="shopping_cart" label="Buyer" />
            <q-tab name="seller" icon="store" label="Seller" />
            <q-tab name="admin" icon="admin_panel_settings" label="Admin" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeRole" animated>
            <q-tab-panel name="buyer">
              <div class="portal-grid">
                <aside class="portal-sidebar">
                  <div class="text-h6">Buyer account</div>
                  <p class="text-grey-7 q-mt-sm">Register, log in, recover password, then shop.</p>

                  <q-input v-model="buyerForm.name" outlined dense label="Name" class="q-mt-md" />
                  <q-input v-model="buyerForm.email" outlined dense label="Email" type="email" />
                  <q-input
                    v-model="buyerForm.password"
                    outlined
                    dense
                    label="Password"
                    type="password"
                  />

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <q-btn
                        class="full-width"
                        color="primary"
                        unelevated
                        label="Register"
                        @click="registerUser('buyer')"
                      />
                    </div>
                    <div class="col-6">
                      <q-btn
                        class="full-width"
                        color="secondary"
                        text-color="dark"
                        unelevated
                        label="Log in"
                        @click="loginUser('buyer')"
                      />
                    </div>
                  </div>

                  <q-btn
                    flat
                    color="primary"
                    icon="lock_reset"
                    label="Forgot password"
                    class="q-mt-sm"
                    @click="forgotPassword('buyer')"
                  />

                  <q-banner v-if="buyerStatus" class="status-banner q-mt-md">
                    {{ buyerStatus }}
                  </q-banner>

                  <q-separator class="q-my-md" />

                  <div class="row items-center">
                    <q-icon name="shopping_bag" color="primary" size="26px" />
                    <div class="q-ml-sm">
                      <div class="text-weight-bold">Cart</div>
                      <div class="text-caption text-grey-7">{{ cart.length }} item selected</div>
                    </div>
                  </div>

                  <q-list v-if="cart.length" dense bordered class="q-mt-sm rounded-borders">
                    <q-item v-for="item in cart" :key="item.cartId">
                      <q-item-section>{{ item.name }}</q-item-section>
                      <q-item-section side>{{ item.price }}</q-item-section>
                    </q-item>
                  </q-list>
                </aside>

                <main>
                  <div class="row q-col-gutter-md items-end">
                    <div class="col-12 col-md-8">
                      <q-input
                        v-model="productSearch"
                        outlined
                        dense
                        label="Search product"
                        clearable
                      >
                        <template #prepend>
                          <q-icon name="search" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="categoryFilter"
                        outlined
                        dense
                        label="Browse product"
                        :options="categoryOptions"
                      />
                    </div>
                  </div>

                  <div class="row q-col-gutter-md q-mt-sm">
                    <div
                      v-for="product in filteredProducts"
                      :key="product.id"
                      class="col-12 col-sm-6 col-xl-4"
                    >
                      <q-card class="portal-product-card" flat bordered>
                        <q-img :src="product.image" :alt="product.name" ratio="4/3" />
                        <q-card-section>
                          <div class="text-subtitle1 text-weight-bold">{{ product.name }}</div>
                          <div class="text-caption text-grey-7">
                            {{ product.category }} by {{ product.seller }}
                          </div>
                          <div class="price q-mt-sm">{{ product.price }}</div>
                        </q-card-section>
                        <q-card-actions class="q-px-md q-pb-md">
                          <q-btn
                            color="primary"
                            unelevated
                            label="Detail"
                            @click="viewProduct(product)"
                          />
                          <q-btn flat color="primary" label="Add to cart" @click="addToCart(product)" />
                          <q-btn flat color="primary" icon="chat" @click="openChat(product)" />
                        </q-card-actions>
                      </q-card>
                    </div>
                  </div>
                </main>
              </div>
            </q-tab-panel>

            <q-tab-panel name="seller">
              <div class="portal-grid">
                <aside class="portal-sidebar">
                  <div class="text-h6">Seller account</div>
                  <p class="text-grey-7 q-mt-sm">Register or log in to post and manage products.</p>

                  <q-input v-model="sellerForm.name" outlined dense label="Store name" class="q-mt-md" />
                  <q-input v-model="sellerForm.email" outlined dense label="Email" type="email" />
                  <q-input
                    v-model="sellerForm.password"
                    outlined
                    dense
                    label="Password"
                    type="password"
                  />

                  <div class="row q-col-gutter-sm q-mt-sm">
                    <div class="col-6">
                      <q-btn
                        class="full-width"
                        color="primary"
                        unelevated
                        label="Register"
                        @click="registerUser('seller')"
                      />
                    </div>
                    <div class="col-6">
                      <q-btn
                        class="full-width"
                        color="secondary"
                        text-color="dark"
                        unelevated
                        label="Log in"
                        @click="loginUser('seller')"
                      />
                    </div>
                  </div>

                  <q-banner v-if="sellerStatus" class="status-banner q-mt-md">
                    {{ sellerStatus }}
                  </q-banner>
                </aside>

                <main>
                  <q-card class="q-mb-md" flat bordered>
                    <q-card-section>
                      <div class="text-h6">Post product</div>
                      <div class="row q-col-gutter-md q-mt-xs">
                        <div class="col-12 col-md-6">
                          <q-input v-model="newProduct.name" outlined dense label="Product name" />
                        </div>
                        <div class="col-12 col-md-3">
                          <q-input v-model="newProduct.price" outlined dense label="Price" />
                        </div>
                        <div class="col-12 col-md-3">
                          <q-select
                            v-model="newProduct.category"
                            outlined
                            dense
                            label="Category"
                            :options="sellerCategories"
                          />
                        </div>
                        <div class="col-12">
                          <q-input
                            v-model="newProduct.description"
                            outlined
                            dense
                            label="Description"
                            type="textarea"
                          />
                        </div>
                      </div>
                    </q-card-section>
                    <q-card-actions class="q-px-md q-pb-md">
                      <q-btn color="primary" unelevated icon="add" label="Post product" @click="postProduct" />
                    </q-card-actions>
                  </q-card>

                  <q-card flat bordered>
                    <q-card-section>
                      <div class="text-h6">Manage product</div>
                      <q-list separator class="q-mt-sm">
                        <q-item v-for="product in sellerProducts" :key="product.id">
                          <q-item-section avatar>
                            <q-avatar rounded size="56px">
                              <img :src="product.image" :alt="product.name" />
                            </q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ product.name }}</q-item-label>
                            <q-item-label caption>{{ product.price }} - {{ product.category }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <div class="row q-gutter-sm">
                              <q-btn
                                dense
                                flat
                                color="primary"
                                :label="product.active ? 'Active' : 'Hidden'"
                                @click="toggleProduct(product.id)"
                              />
                              <q-btn dense flat color="negative" icon="delete" @click="deleteProduct(product.id)" />
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>
                </main>
              </div>
            </q-tab-panel>

            <q-tab-panel name="admin">
              <div class="portal-grid">
                <aside class="portal-sidebar">
                  <div class="text-h6">Admin tools</div>
                  <p class="text-grey-7 q-mt-sm">Manage users and generate marketplace reports.</p>

                  <q-input v-model="adminUser.name" outlined dense label="New user name" class="q-mt-md" />
                  <q-input v-model="adminUser.email" outlined dense label="New user email" type="email" />
                  <q-select
                    v-model="adminUser.role"
                    outlined
                    dense
                    label="Role"
                    :options="['buyer', 'seller', 'admin']"
                  />
                  <q-btn
                    class="full-width q-mt-sm"
                    color="primary"
                    unelevated
                    icon="person_add"
                    label="Add user"
                    @click="addAdminUser"
                  />
                  <q-btn
                    class="full-width q-mt-sm"
                    color="secondary"
                    text-color="dark"
                    unelevated
                    icon="summarize"
                    label="Generate report"
                    @click="generateReport"
                  />
                </aside>

                <main>
                  <q-card flat bordered>
                    <q-card-section>
                      <div class="text-h6">Manage user</div>
                      <q-list separator class="q-mt-sm">
                        <q-item v-for="user in users" :key="user.id">
                          <q-item-section avatar>
                            <q-avatar color="primary" text-color="white">
                              {{ user.name.slice(0, 1).toUpperCase() }}
                            </q-avatar>
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>{{ user.name }}</q-item-label>
                            <q-item-label caption>{{ user.email }} - {{ user.role }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <div class="row q-gutter-sm">
                              <q-btn
                                dense
                                flat
                                color="primary"
                                :label="user.active ? 'Active' : 'Suspended'"
                                @click="toggleUser(user.id)"
                              />
                              <q-btn dense flat color="negative" icon="delete" @click="deleteUser(user.id)" />
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-card-section>
                  </q-card>

                  <q-card v-if="report" class="q-mt-md report-card" flat bordered>
                    <q-card-section>
                      <div class="text-h6">Generated report</div>
                      <div class="report-grid q-mt-md">
                        <div v-for="metric in report" :key="metric.label" class="report-metric">
                          <div class="text-caption text-grey-7">{{ metric.label }}</div>
                          <div class="text-h4 text-weight-bold">{{ metric.value }}</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </main>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </section>

    <q-dialog v-model="productDialog">
      <q-card v-if="selectedProduct" class="detail-card">
        <q-img :src="selectedProduct.image" :alt="selectedProduct.name" ratio="16/9" />
        <q-card-section>
          <div class="text-h5 text-weight-bold">{{ selectedProduct.name }}</div>
          <div class="text-grey-7">{{ selectedProduct.category }} by {{ selectedProduct.seller }}</div>
          <div class="price q-mt-sm">{{ selectedProduct.price }}</div>
          <p class="q-mt-md">{{ selectedProduct.description }}</p>
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat color="primary" label="Chat seller" @click="openChat(selectedProduct)" />
          <q-btn color="primary" unelevated label="Add to cart" @click="addToCart(selectedProduct)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="chatDialog">
      <q-card class="chat-card">
        <q-card-section>
          <div class="text-h6">Chat with seller</div>
          <div class="text-caption text-grey-7">{{ selectedProduct?.seller }}</div>
        </q-card-section>
        <q-card-section class="chat-thread">
          <div v-for="message in chatMessages" :key="message.id" class="chat-bubble">
            {{ message.text }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="chatText" outlined dense label="Message seller" @keyup.enter="sendMessage" />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Close" color="primary" v-close-popup />
          <q-btn color="primary" unelevated label="Send" @click="sendMessage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const starterProducts = [
  {
    id: 1,
    name: 'Nasi Goreng Ayam Kunyit',
    category: 'Food',
    price: 'RM7',
    seller: 'Campus Kitchen',
    image: '/icons/f&b_1.jpg',
    description: 'Fresh meal with room-to-room delivery around campus.',
    active: true,
  },
  {
    id: 2,
    name: 'Takoyaki',
    category: 'Food',
    price: 'From RM5',
    seller: 'Snack Booth',
    image: '/icons/f&b_2.jpg',
    description: '6 pieces for RM5 or 13 pieces for RM10 with student promotion.',
    active: true,
  },
  {
    id: 3,
    name: 'Printing & Laminate',
    category: 'Service',
    price: 'Price list',
    seller: 'Print Hub',
    image: '/icons/services_2.jpg',
    description: 'Printing and laminating service for assignments, notes, and posters.',
    active: true,
  },
  {
    id: 4,
    name: 'Brazil National Team Jersey',
    category: 'Thrift',
    price: 'Student deal',
    seller: 'Thrift Locker',
    image: '/icons/item_2.jpg',
    description: 'Pre-loved jersey in good condition.',
    active: true,
  },
]

const starterUsers = [
  { id: 1, name: 'Aiman Buyer', email: 'buyer@upnm.test', role: 'buyer', password: '123456', active: true },
  { id: 2, name: 'Campus Kitchen', email: 'seller@upnm.test', role: 'seller', password: '123456', active: true },
  { id: 3, name: 'Admin UPNM', email: 'admin@upnm.test', role: 'admin', password: '123456', active: true },
]

const loadState = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

const activeRole = ref('buyer')
const users = ref(loadState('upnm-users', starterUsers))
const products = ref(loadState('upnm-products', starterProducts))
const cart = ref(loadState('upnm-cart', []))
const chatMessages = ref(loadState('upnm-chat', []))

const buyerForm = ref({ name: '', email: 'buyer@upnm.test', password: '123456' })
const sellerForm = ref({ name: '', email: 'seller@upnm.test', password: '123456' })
const adminUser = ref({ name: '', email: '', role: 'buyer' })
const newProduct = ref({
  name: '',
  price: '',
  category: 'Food',
  description: '',
})

const buyerStatus = ref('')
const sellerStatus = ref('')
const productSearch = ref('')
const categoryFilter = ref('All')
const selectedProduct = ref(null)
const productDialog = ref(false)
const chatDialog = ref(false)
const chatText = ref('')
const report = ref(null)

const categoryOptions = ['All', 'Food', 'Service', 'Thrift']
const sellerCategories = ['Food', 'Service', 'Thrift']

const filteredProducts = computed(() => {
  const query = productSearch.value.toLowerCase().trim()

  return products.value.filter((product) => {
    const matchesCategory = categoryFilter.value === 'All' || product.category === categoryFilter.value
    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.seller.toLowerCase().includes(query)

    return product.active && matchesCategory && matchesSearch
  })
})

const sellerProducts = computed(() => products.value)

watch(users, (value) => localStorage.setItem('upnm-users', JSON.stringify(value)), { deep: true })
watch(products, (value) => localStorage.setItem('upnm-products', JSON.stringify(value)), { deep: true })
watch(cart, (value) => localStorage.setItem('upnm-cart', JSON.stringify(value)), { deep: true })
watch(chatMessages, (value) => localStorage.setItem('upnm-chat', JSON.stringify(value)), { deep: true })

const getRoleForm = (role) => (role === 'buyer' ? buyerForm.value : sellerForm.value)
const setRoleStatus = (role, message) => {
  if (role === 'buyer') buyerStatus.value = message
  if (role === 'seller') sellerStatus.value = message
}

const registerUser = (role) => {
  const form = getRoleForm(role)

  if (!form.name || !form.email || !form.password) {
    setRoleStatus(role, 'Please fill in name, email, and password.')
    return
  }

  const exists = users.value.some((user) => user.email.toLowerCase() === form.email.toLowerCase())
  if (exists) {
    setRoleStatus(role, 'Account already exists. You can log in.')
    return
  }

  users.value.push({
    id: Date.now(),
    name: form.name,
    email: form.email,
    password: form.password,
    role,
    active: true,
  })
  setRoleStatus(role, `${roleLabel(role)} registered successfully.`)
}

const loginUser = (role) => {
  const form = getRoleForm(role)
  const user = users.value.find(
    (item) =>
      item.email.toLowerCase() === form.email.toLowerCase() &&
      item.password === form.password &&
      item.role === role,
  )

  if (!user) {
    setRoleStatus(role, `Invalid ${roleLabel(role)} login.`)
    return
  }

  if (!user.active) {
    setRoleStatus(role, 'This account is suspended by admin.')
    return
  }

  setRoleStatus(role, `Logged in as ${user.name}.`)
}

const forgotPassword = (role) => {
  const form = getRoleForm(role)
  const user = users.value.find(
    (item) => item.email.toLowerCase() === form.email.toLowerCase() && item.role === role,
  )
  setRoleStatus(
    role,
    user ? `Password reset link prepared for ${user.email}.` : 'No account found for that email.',
  )
}

const roleLabel = (role) => role.slice(0, 1).toUpperCase() + role.slice(1)

const viewProduct = (product) => {
  selectedProduct.value = product
  productDialog.value = true
}

const addToCart = (product) => {
  cart.value.push({ ...product, cartId: `${product.id}-${Date.now()}` })
  buyerStatus.value = `${product.name} added to cart.`
}

const openChat = (product) => {
  selectedProduct.value = product
  chatDialog.value = true
  productDialog.value = false
}

const sendMessage = () => {
  const text = chatText.value.trim()
  if (!text || !selectedProduct.value) return

  chatMessages.value.push({
    id: Date.now(),
    productId: selectedProduct.value.id,
    text,
  })
  chatText.value = ''
}

const postProduct = () => {
  if (!newProduct.value.name || !newProduct.value.price || !newProduct.value.description) {
    sellerStatus.value = 'Please complete product name, price, and description.'
    return
  }

  products.value.unshift({
    id: Date.now(),
    ...newProduct.value,
    seller: sellerForm.value.name || 'New Seller',
    image:
      newProduct.value.category === 'Food'
        ? '/icons/f&b_3.jpg'
        : newProduct.value.category === 'Service'
          ? '/icons/services.jpg'
          : '/icons/thrift.jpg',
    active: true,
  })

  sellerStatus.value = `${newProduct.value.name} posted successfully.`
  newProduct.value = { name: '', price: '', category: 'Food', description: '' }
}

const toggleProduct = (id) => {
  const product = products.value.find((item) => item.id === id)
  if (product) product.active = !product.active
}

const deleteProduct = (id) => {
  products.value = products.value.filter((product) => product.id !== id)
}

const addAdminUser = () => {
  if (!adminUser.value.name || !adminUser.value.email) return

  users.value.push({
    id: Date.now(),
    name: adminUser.value.name,
    email: adminUser.value.email,
    password: '123456',
    role: adminUser.value.role,
    active: true,
  })
  adminUser.value = { name: '', email: '', role: 'buyer' }
}

const toggleUser = (id) => {
  const user = users.value.find((item) => item.id === id)
  if (user) user.active = !user.active
}

const deleteUser = (id) => {
  users.value = users.value.filter((user) => user.id !== id)
}

const generateReport = () => {
  report.value = [
    { label: 'Total users', value: users.value.length },
    { label: 'Buyers', value: users.value.filter((user) => user.role === 'buyer').length },
    { label: 'Sellers', value: users.value.filter((user) => user.role === 'seller').length },
    { label: 'Products', value: products.value.length },
    { label: 'Active listings', value: products.value.filter((product) => product.active).length },
    { label: 'Cart items', value: cart.value.length },
  ]
}
</script>
