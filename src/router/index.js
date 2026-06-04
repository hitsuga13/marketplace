// Purpose: Creates Vue Router and protects buyer/seller/admin routes based on the current logged-in role.
import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { getCurrentUser, getRoleHome } from 'src/database'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  Router.beforeEach((to) => {
    const requiredRole = to.meta.role
    const requiredRoles = to.meta.roles
    if (!requiredRole && !requiredRoles) return true

    const user = getCurrentUser()
    if (!user) return '/page4'
    if (requiredRoles && !requiredRoles.includes(user.role)) return getRoleHome(user.role)
    if (requiredRoles) return true
    if (user.role !== requiredRole) return getRoleHome(user.role)

    return true
  })

  return Router
})
