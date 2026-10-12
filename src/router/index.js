import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/stores/auth'

const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/relojes', component: () => import('@/views/CatalogView.vue') },
  { path: '/categoria/:cat', component: () => import('@/views/CatalogView.vue') },
  { path: '/ofertas', component: () => import('@/views/CatalogView.vue'), props: { offers: true } },
  { path: '/relojes/:slug', component: () => import('@/views/ProductView.vue') },
  { path: '/carrito', component: () => import('@/views/CartView.vue') },
  { path: '/checkout', component: () => import('@/views/CheckoutView.vue'), meta: { auth: true } },
  { path: '/login', component: () => import('@/views/AuthView.vue'), props: { mode: 'login' } },
  { path: '/registro', component: () => import('@/views/AuthView.vue'), props: { mode: 'register' } },
  { path: '/envios', component: () => import('@/views/InfoView.vue'), props: { page: 'envios' } },
  { path: '/garantia', component: () => import('@/views/InfoView.vue'), props: { page: 'garantia' } },
  {
    path: '/cuenta', component: () => import('@/views/account/AccountLayout.vue'), meta: { auth: true },
    children: [
      { path: '', component: () => import('@/views/account/OverviewView.vue') },
      { path: 'pedidos', component: () => import('@/views/account/OrdersView.vue') },
      { path: 'pedidos/:id', component: () => import('@/views/account/OrderDetailView.vue') },
      { path: 'favoritos', component: () => import('@/views/account/WishlistView.vue') },
      { path: 'perfil', component: () => import('@/views/account/ProfileView.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved || (to.hash ? { el: to.hash, behavior: 'smooth' } : { top: 0 })
})

router.beforeEach(async (to) => {
  const auth = useAuth()
  if (!auth.ready) await auth.init()
  if (to.meta.auth && !auth.loggedIn) return { path: '/login', query: { next: to.fullPath } }
  if ((to.path === '/login' || to.path === '/registro') && auth.loggedIn) return '/cuenta'
})

export default router
