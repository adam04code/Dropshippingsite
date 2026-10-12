<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { useCatalog } from '@/stores/catalog'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { useUi } from '@/stores/ui'
import { useSeo } from '@/composables/useSeo'
import { track } from '@/composables/useTracking'
import WallShowcase from '@/components/WallShowcase.vue'
import ProductCard from '@/components/ProductCard.vue'

const route = useRoute()
const cat = useCatalog(), cart = useCart(), wl = useWishlist(), ui = useUi()
const product = ref(null)
const related = ref([])
const notFound = ref(false)
const qty = ref(1)
const lume = ref(false)
const tab = ref('specs')
const fmt = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

async function load() {
  notFound.value = false; product.value = null; qty.value = 1; lume.value = false
  try {
    const r = await api.get('/products/' + route.params.slug)
    product.value = r.product; related.value = r.related
    cat.pushRecent(r.product.id)
    track('view_item', { currency: 'EUR', value: r.product.price, items: [{ item_id: r.product.id, item_name: r.product.name, price: r.product.price }] })
  } catch { notFound.value = true }
}
watch(() => route.params.slug, load)
onMounted(load)

const category = computed(() => product.value && cat.category(product.value.category))
const discount = computed(() => (product.value?.compareAt ? Math.round((1 - product.value.price / product.value.compareAt) * 100) : 0))
const eta = computed(() => { const d = new Date(Date.now() + (product.value?.leadDays + 4) * 864e5); return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) })
const recent = computed(() => cat.recent.filter((id) => id !== product.value?.id).map((id) => cat.byId(id)).filter(Boolean).slice(0, 4))

useSeo(() => product.value ? ({
  title: `${product.value.name} · ${fmt(product.value.price)}`,
  description: `${product.value.short} Envío gratis y 30 días de devolución.`,
  path: `/relojes/${product.value.slug}`, image: `/img/${product.value.slug}.svg`
}) : { title: 'Reloj', noindex: notFound.value })

function add(go) { cart.add(product.value, qty.value); ui.notify('Añadido al carrito'); if (go) ui.cartOpen = true }
async function fav() { const on = await wl.toggle(product.value.id); ui.notify(on ? 'Guardado en favoritos' : 'Quitado de favoritos', 'info') }
async function share() { try { await navigator.share({ title: product.value.name, url: location.href }) } catch { await navigator.clipboard?.writeText(location.href); ui.notify('Enlace copiado', 'info') } }
</script>

<template>
  <v-container class="py-6">
    <v-sheet v-if="notFound" class="text-center pa-12" border rounded="xl">
      <h1 class="serif text-h4 mb-2">Reloj no encontrado</h1><p class="mb-4 text-medium-emphasis">Puede que se haya agotado o retirado.</p><v-btn color="primary" to="/relojes">Ver colección</v-btn>
    </v-sheet>
    <template v-else-if="product">
      <v-breadcrumbs :items="[{ title: 'Inicio', to: '/' }, { title: 'Relojes', to: '/relojes' }, { title: category?.name, to: `/categoria/${product.category}` }, { title: product.name, disabled: true }]" class="px-0" />
      <v-row>
        <v-col cols="12" md="7">
          <div class="wall rounded-xl pa-4 pa-md-8 stage-card">
            <WallShowcase :key="product.id" :product="product" :lume="lume" />
            <div class="d-flex justify-center mt-4"><v-switch v-model="lume" color="success" inset hide-details density="compact" :label="lume ? 'Modo noche (luminiscencia)' : 'Probar luminiscencia'" /></div>
          </div>
        </v-col>
        <v-col cols="12" md="5">
          <div class="d-flex flex-wrap ga-2 mb-2"><v-chip v-if="product.badge" color="primary" size="small" label>{{ product.badge }}</v-chip><v-chip size="small" label variant="outlined">{{ category?.name }}</v-chip></div>
          <h1 class="serif text-h4 text-md-h3 mb-2">{{ product.name }}</h1>
          <div class="d-flex align-center ga-2 mb-3"><v-rating :model-value="product.rating" half-increments readonly density="compact" size="20" color="primary" /><span class="text-body-2 text-medium-emphasis">{{ product.rating }} · {{ product.reviews }} opiniones</span></div>
          <p class="text-body-1 mb-4">{{ product.short }}</p>
          <div class="d-flex align-baseline ga-3 mb-1"><span class="price-now text-h4">{{ fmt(product.price) }}</span><span v-if="product.compareAt" class="price-old text-h6">{{ fmt(product.compareAt) }}</span><v-chip v-if="discount" color="error" size="small" label>-{{ discount }}%</v-chip></div>
          <p class="text-caption text-medium-emphasis mb-4">IVA incluido · Envío gratis desde 100 €</p>

          <div class="d-flex align-center ga-2 mb-4" :class="product.stock < 10 ? 'text-warning' : 'text-success'">
            <span class="pulse-dot" :style="product.stock < 10 ? 'background:#ffb84d' : ''" />
            <span class="text-body-2">{{ product.stock < 1 ? 'Agotado' : product.stock < 10 ? `¡Solo quedan ${product.stock} unidades!` : 'En stock · Se envía en 24-48 h' }}</span>
          </div>

          <div class="d-flex ga-3 mb-3">
            <v-select v-model="qty" :items="Array.from({ length: Math.min(10, product.stock) }, (_, i) => i + 1)" label="Cant." hide-details style="max-width: 100px" />
            <v-btn color="primary" size="x-large" class="flex-grow-1" prepend-icon="mdi-cart-plus" :disabled="product.stock < 1" @click="add(true)">Añadir al carrito</v-btn>
          </div>
          <div class="d-flex ga-2 mb-5">
            <v-btn variant="tonal" :prepend-icon="wl.has(product.id) ? 'mdi-heart' : 'mdi-heart-outline'" :color="wl.has(product.id) ? 'error' : undefined" @click="fav">{{ wl.has(product.id) ? 'En favoritos' : 'Favorito' }}</v-btn>
            <v-btn variant="tonal" prepend-icon="mdi-compare-horizontal" @click="cat.toggleCompare(product.id) ? (cat.compare.length > 1 && (ui.compareOpen = true)) : ui.notify('Máximo 3 relojes', 'warning')">Comparar</v-btn>
            <v-btn variant="tonal" icon="mdi-share-variant-outline" aria-label="Compartir" @click="share" />
          </div>

          <v-card border class="pa-4 mb-4">
            <div class="d-flex ga-3 mb-3"><v-icon color="primary">mdi-truck-delivery-outline</v-icon><div><div class="text-body-2 font-weight-bold">Llega aprox. el {{ eta }}</div><div class="text-caption text-medium-emphasis">Seguimiento en tiempo real desde tu panel</div></div></div>
            <div class="d-flex ga-3 mb-3"><v-icon color="primary">mdi-backup-restore</v-icon><div class="text-body-2">30 días de devolución gratuita</div></div>
            <div class="d-flex ga-3"><v-icon color="primary">mdi-shield-check-outline</v-icon><div class="text-body-2">2 años de garantía oficial</div></div>
          </v-card>
        </v-col>
      </v-row>

      <v-card border class="mt-8">
        <v-tabs v-model="tab" color="primary" grow><v-tab value="specs">Especificaciones</v-tab><v-tab value="desc">Descripción</v-tab><v-tab value="ship">Envío y devolución</v-tab></v-tabs>
        <v-divider />
        <v-tabs-window v-model="tab" class="pa-4 pa-md-6">
          <v-tabs-window-item value="specs"><v-table density="comfortable"><tbody><tr v-for="(v, k) in product.specs" :key="k"><th class="text-left" style="width: 40%">{{ k }}</th><td>{{ v }}</td></tr></tbody></v-table></v-tabs-window-item>
          <v-tabs-window-item value="desc"><p class="text-body-1" style="max-width: 720px">{{ product.description }}</p></v-tabs-window-item>
          <v-tabs-window-item value="ship"><p class="text-body-1" style="max-width: 720px">Preparamos tu pedido en 24-48 h y llega entre 5 y 9 días laborables. Si no te convence, tienes 30 días para devolverlo. <router-link to="/envios">Más información</router-link>.</p></v-tabs-window-item>
        </v-tabs-window>
      </v-card>

      <section v-if="related.length" class="mt-12"><h2 class="section-title mb-4">También te puede gustar</h2><v-row><v-col v-for="p in related" :key="p.id" cols="12" sm="6" lg="3"><ProductCard :product="p" /></v-col></v-row></section>
      <section v-if="recent.length" class="mt-12"><h2 class="section-title mb-4">Vistos recientemente</h2><v-row><v-col v-for="p in recent" :key="p.id" cols="12" sm="6" lg="3"><ProductCard :product="p" /></v-col></v-row></section>
    </template>
    <v-skeleton-loader v-else type="image, article" height="500" />
  </v-container>
</template>
