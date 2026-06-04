// Purpose: Defines every active route and connects each URL path to the correct page component.
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'main', component: () => import('pages/IndexPage.vue') },
      // Redirecting old sub-page paths directly onto the new home filter setup
      { path: 'page1', component: () => import('pages/IndexPage.vue') }, // Services
      { path: 'page2', component: () => import('pages/IndexPage.vue') }, // Food
      { path: 'page3', component: () => import('pages/IndexPage.vue') }, // Thrift
      { path: 'page4', component: () => import('pages/LoginPage.vue') },
      {
        path: 'buyer-dashboard',
        component: () => import('pages/BuyerPage.vue'),
        meta: { role: 'buyer' },
      },
      { path: 'seller', component: () => import('pages/SellerPage.vue'), meta: { role: 'seller' } },
      { path: 'chat', component: () => import('pages/ChatPage.vue'), meta: { roles: ['buyer', 'seller'] } },
      { path: 'admin', component: () => import('pages/AdminPage.vue'), meta: { role: 'admin' } },
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
