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
    ],
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
