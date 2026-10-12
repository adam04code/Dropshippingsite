<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useCatalog } from '@/stores/catalog'
import { useWishlist } from '@/stores/wishlist'
import { useUi } from '@/stores/ui'
import CartDrawer from '@/components/CartDrawer.vue'
import SearchDialog from '@/components/SearchDialog.vue'
import CompareSheet from '@/components/CompareSheet.vue'

const auth = useAuth(), cart = useCart(), cat = useCatalog(), wl = useWishlist(), ui = useUi()
const theme = useTheme()
const router = useRouter()
const mobileNav = ref(false)
const isDark = computed(() => theme.global.name.value === 'dark')

onMounted(async () => {
  await Promise.all([cat.load(), auth.init()])
  await wl.sync()
  cart.refresh()
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
function onKey(e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ui.searchOpen = true } }
watch(() => auth.user?.id, (v, o) => { if (v && !o) wl.sync() })
function logout() { auth.logout(); router.push('/'); ui.notify('Sesión cerrada', 'info') }

const promos = ['🚚 Envío gratis desde 100 €', '🎁 Código TIEMPO10: -10% en tu primer pedido', '🛡️ 2 años de garantía y 30 días de devolución', '⌚ Cristal de zafiro en todos los automáticos']
const nav = [{ t: 'Todos los relojes', to: '/relojes' }, { t: 'Ofertas', to: '/ofertas', icon: 'mdi-fire' }, { t: 'Envíos', to: '/envios' }, { t: 'Garantía', to: '/garantia' }]
</script>

<template>
  <v-app>
    <a class="skip-link" href="#main">Saltar al contenido</a>
    <v-system-bar color="primary" height="30" class="promo-bar text-caption px-0" aria-label="Promociones">
      <div class="marquee"><span v-for="(p, i) in [...promos, ...promos, ...promos, ...promos]" :key="i">{{ p }}</span></div>
    </v-system-bar>

    <v-app-bar flat border="b" height="68" class="px-md-4" scroll-behavior="elevate">
      <v-app-bar-nav-icon class="d-md-none" aria-label="Menú" @click="mobileNav = true" />
      <router-link to="/" class="logo d-flex align-center text-decoration-none ml-2" aria-label="CHRONOS inicio">
        <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="5" class="text-primary" /><path d="M32 16v17l10 7" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" class="text-primary" /></svg>
        <span class="serif text-h6 ml-2 gold-text font-weight-bold" style="letter-spacing: 0.18em">CHRONOS</span>
      </router-link>

      <nav class="d-none d-md-flex ml-8 ga-1" aria-label="Principal">
        <v-menu open-on-hover :close-delay="150">
          <template #activator="{ props }"><v-btn v-bind="props" variant="text" append-icon="mdi-chevron-down" to="/relojes">Colecciones</v-btn></template>
          <v-card min-width="320" class="pa-2" border>
            <v-list bg-color="transparent">
              <v-list-item v-for="c in cat.categories" :key="c.slug" :to="`/categoria/${c.slug}`" :prepend-icon="c.icon" :title="c.name" :subtitle="c.blurb" lines="two" rounded="lg" />
            </v-list>
          </v-card>
        </v-menu>
        <v-btn v-for="n in nav" :key="n.to" :to="n.to" variant="text" :prepend-icon="n.icon" :color="n.icon ? 'accent' : undefined">{{ n.t }}</v-btn>
      </nav>
      <v-spacer />

      <v-btn variant="tonal" class="d-none d-sm-flex mr-1" prepend-icon="mdi-magnify" @click="ui.searchOpen = true" aria-label="Buscar">
        Buscar <v-chip size="x-small" class="ml-2" label>Ctrl K</v-chip>
      </v-btn>
      <v-btn icon="mdi-magnify" class="d-sm-none" aria-label="Buscar" @click="ui.searchOpen = true" />
      <v-btn :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" :aria-label="isDark ? 'Tema claro' : 'Tema oscuro'" @click="ui.toggleTheme(theme)" />
      <v-badge class="d-none d-sm-inline-block" :model-value="cat.compare.length > 0" :content="cat.compare.length" color="secondary" offset-x="4" offset-y="4">
        <v-btn icon="mdi-compare-horizontal" aria-label="Comparar" @click="ui.compareOpen = true" />
      </v-badge>
      <v-btn class="d-none d-sm-flex" :to="auth.loggedIn ? '/cuenta/favoritos' : '/login'" aria-label="Favoritos">
        <v-badge :model-value="wl.ids.length > 0" :content="wl.ids.length" color="error"><v-icon>mdi-heart-outline</v-icon></v-badge>
      </v-btn>

      <v-menu v-if="auth.loggedIn" location="bottom end">
        <template #activator="{ props }"><v-btn v-bind="props" icon aria-label="Mi cuenta"><v-avatar color="primary" size="34"><span class="text-caption font-weight-bold">{{ auth.initials }}</span></v-avatar></v-btn></template>
        <v-card min-width="240" border>
          <v-list>
            <v-list-item :title="auth.user.name" :subtitle="auth.user.email" />
            <v-divider />
            <v-list-item to="/cuenta" prepend-icon="mdi-view-dashboard-outline" title="Panel" />
            <v-list-item to="/cuenta/pedidos" prepend-icon="mdi-package-variant-closed" title="Mis pedidos" />
            <v-list-item to="/cuenta/perfil" prepend-icon="mdi-account-cog-outline" title="Perfil y direcciones" />
            <v-divider />
            <v-list-item prepend-icon="mdi-logout" title="Cerrar sesión" @click="logout" />
          </v-list>
        </v-card>
      </v-menu>
      <template v-else>
        <v-btn to="/login" variant="outlined" class="ml-1 d-none d-sm-flex" prepend-icon="mdi-account-outline">Entrar</v-btn>
        <v-btn to="/login" icon="mdi-account-outline" class="d-sm-none" aria-label="Entrar" />
      </template>

      <v-btn icon class="ml-1" aria-label="Carrito" @click="ui.cartOpen = true">
        <v-badge :model-value="cart.count > 0" :content="cart.count" color="primary"><v-icon>mdi-cart-outline</v-icon></v-badge>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="mobileNav" temporary location="left" width="300">
      <v-list nav>
        <v-list-item to="/" prepend-icon="mdi-home-outline" title="Inicio" @click="mobileNav = false" />
        <v-list-subheader>Colecciones</v-list-subheader>
        <v-list-item v-for="c in cat.categories" :key="c.slug" :to="`/categoria/${c.slug}`" :prepend-icon="c.icon" :title="c.name" @click="mobileNav = false" />
        <v-divider class="my-2" />
        <v-list-item v-for="n in nav" :key="n.to" :to="n.to" :title="n.t" :prepend-icon="n.icon || 'mdi-chevron-right'" @click="mobileNav = false" />
      </v-list>
    </v-navigation-drawer>

    <CartDrawer />
    <SearchDialog />
    <CompareSheet />

    <v-main id="main">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in"><component :is="Component" :key="route.path.startsWith('/cuenta') ? '/cuenta' : route.path" /></transition>
      </router-view>

      <!-- Barra flotante de comparación -->
      <v-slide-y-reverse-transition>
        <v-sheet v-if="cat.compare.length && !ui.compareOpen" class="compare-fab pa-2 d-flex align-center ga-2" rounded="pill" elevation="8" border>
          <v-icon class="ml-2">mdi-compare-horizontal</v-icon>
          <span class="text-body-2">{{ cat.compare.length }}/3 para comparar</span>
          <v-btn color="primary" size="small" :disabled="cat.compare.length < 2" @click="ui.compareOpen = true">Comparar</v-btn>
          <v-btn icon="mdi-close" size="x-small" variant="text" aria-label="Vaciar comparación" @click="cat.compare = []" />
        </v-sheet>
      </v-slide-y-reverse-transition>

      <footer class="footer pt-12 pb-6 mt-12 border-t">
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <div class="serif text-h5 gold-text mb-2" style="letter-spacing: 0.18em">CHRONOS</div>
              <p class="text-body-2 text-medium-emphasis">Relojes de diseño con cristal de zafiro y movimientos fiables. Directos del taller a tu muñeca, sin intermediarios.</p>
              <div class="d-flex ga-2 mt-3 text-medium-emphasis">
                <v-icon>mdi-credit-card-outline</v-icon><v-icon>mdi-bank-outline</v-icon><v-icon>mdi-shield-check-outline</v-icon><v-icon>mdi-truck-fast-outline</v-icon>
              </div>
            </v-col>
            <v-col cols="6" md="2">
              <div class="text-overline">Colecciones</div>
              <v-list density="compact" bg-color="transparent" class="pa-0"><v-list-item v-for="c in cat.categories" :key="c.slug" :to="`/categoria/${c.slug}`" :title="c.name" class="px-0" min-height="30" /></v-list>
            </v-col>
            <v-col cols="6" md="3">
              <div class="text-overline">Ayuda</div>
              <v-list density="compact" bg-color="transparent" class="pa-0">
                <v-list-item to="/envios" title="Envíos y devoluciones" class="px-0" min-height="30" />
                <v-list-item to="/garantia" title="Garantía de 2 años" class="px-0" min-height="30" />
                <v-list-item to="/cuenta/pedidos" title="Seguir mi pedido" class="px-0" min-height="30" />
                <v-list-item href="/sitemap.xml" title="Mapa del sitio" class="px-0" min-height="30" />
              </v-list>
            </v-col>
            <v-col cols="12" md="3">
              <div class="text-overline">Newsletter</div>
              <p class="text-body-2 text-medium-emphasis mb-2">Lanzamientos y -10% en tu primera compra.</p>
              <v-text-field placeholder="tu@email.com" density="compact" hide-details append-inner-icon="mdi-send" aria-label="Email newsletter" @click:append-inner="ui.notify('¡Gracias! Usa el código TIEMPO10')" />
            </v-col>
          </v-row>
          <v-divider class="my-6" />
          <div class="text-caption text-medium-emphasis d-flex flex-wrap justify-space-between ga-2">
            <span>© {{ new Date().getFullYear() }} CHRONOS. Todos los derechos reservados.</span>
            <span>Proyecto demo: los pagos son simulados.</span>
          </div>
        </v-container>
      </footer>
    </v-main>

    <v-snackbar v-model="ui.toast.show" :color="ui.toast.color" location="bottom" :timeout="2800" rounded="pill">{{ ui.toast.text }}</v-snackbar>
  </v-app>
</template>

<style scoped>
.promo-bar { overflow: hidden; font-weight: 600; }
.logo { color: inherit; }
.compare-fab { position: fixed; left: 50%; transform: translateX(-50%); bottom: 20px; z-index: 1000; }
</style>
