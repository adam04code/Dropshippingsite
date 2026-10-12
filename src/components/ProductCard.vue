<script setup>
import { computed, ref } from 'vue'
import WatchSvg from './WatchSvg.vue'
import { useCart } from '@/stores/cart'
import { useWishlist } from '@/stores/wishlist'
import { useCatalog } from '@/stores/catalog'
import { useUi } from '@/stores/ui'

const props = defineProps({ product: { type: Object, required: true } })
const cart = useCart(), wl = useWishlist(), cat = useCatalog(), ui = useUi()
const fmt = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
const discount = computed(() => (props.product.compareAt ? Math.round((1 - props.product.price / props.product.compareAt) * 100) : 0))
const tilt = ref({ x: 0, y: 0 })
function onMove(e) {
  const r = e.currentTarget.getBoundingClientRect()
  tilt.value = { x: ((e.clientX - r.left) / r.width - 0.5) * 14, y: ((e.clientY - r.top) / r.height - 0.5) * -14 }
}
function add() { cart.add(props.product); ui.notify(`${props.product.name} añadido al carrito`); ui.cartOpen = true }
async function fav() { const on = await wl.toggle(props.product.id); ui.notify(on ? 'Guardado en favoritos' : 'Quitado de favoritos', 'info') }
function cmp() { if (!cat.toggleCompare(props.product.id)) ui.notify('Puedes comparar hasta 3 relojes', 'warning'); else if (cat.compare.length > 1) ui.compareOpen = false }
</script>

<template>
  <v-card class="card-hover pc" :aria-label="product.name" height="100%" color="surface">
    <div class="pc-media wall" @pointermove="onMove" @pointerleave="tilt = { x: 0, y: 0 }">
      <router-link :to="`/relojes/${product.slug}`" :aria-label="`Ver ${product.name}`" class="pc-link">
        <div class="pc-watch" :style="{ transform: `perspective(600px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }">
          <WatchSvg :colors="product.colors" :watch-style="product.style" :label="product.name" />
        </div>
      </router-link>
      <div class="pc-tags">
        <v-chip v-if="product.badge" size="small" color="primary" label>{{ product.badge }}</v-chip>
        <v-chip v-if="discount" size="small" color="error" label>-{{ discount }}%</v-chip>
      </div>
      <div class="pc-actions">
        <v-btn :icon="wl.has(product.id) ? 'mdi-heart' : 'mdi-heart-outline'" :color="wl.has(product.id) ? 'error' : undefined" size="small" variant="flat" :aria-label="wl.has(product.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'" @click="fav" />
        <v-btn :icon="cat.compare.includes(product.id) ? 'mdi-check' : 'mdi-compare-horizontal'" :color="cat.compare.includes(product.id) ? 'primary' : undefined" size="small" variant="flat" aria-label="Comparar" @click="cmp" />
      </div>
    </div>
    <v-card-text class="pb-0">
      <div class="d-flex align-center ga-1 text-caption mb-1">
        <v-rating :model-value="product.rating" density="compact" size="14" color="primary" half-increments readonly />
        <span class="text-medium-emphasis">({{ product.reviews }})</span>
      </div>
      <h3 class="text-subtitle-1 font-weight-bold lh-tight"><router-link :to="`/relojes/${product.slug}`" class="text-decoration-none">{{ product.name }}</router-link></h3>
      <p class="text-body-2 text-medium-emphasis mt-1 pc-short">{{ product.short }}</p>
    </v-card-text>
    <v-card-actions class="px-4 pb-4 pt-2 d-flex align-end">
      <div>
        <div class="price-now text-h6">{{ fmt(product.price) }}</div>
        <div v-if="product.compareAt" class="price-old text-caption">{{ fmt(product.compareAt) }}</div>
      </div>
      <v-spacer />
      <v-btn color="primary" variant="flat" prepend-icon="mdi-cart-plus" :disabled="product.stock < 1" @click="add">Añadir</v-btn>
    </v-card-actions>
    <div v-if="product.stock < 10" class="px-4 pb-3 text-caption text-warning"><v-icon size="14">mdi-fire</v-icon> ¡Solo quedan {{ product.stock }}!</div>
  </v-card>
</template>

<style scoped>
.pc-media { position: relative; padding: 28px 20px 16px; border-radius: 0; }
.pc-link { display: block; }
.pc-watch { width: 62%; margin: 0 auto; transition: transform 0.2s ease-out; filter: drop-shadow(0 16px 14px rgba(0, 0, 0, 0.55)); }
.pc-tags { position: absolute; top: 12px; left: 12px; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.pc-actions { position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 6px; opacity: 0.0; transition: opacity 0.2s; }
.pc:hover .pc-actions, .pc:focus-within .pc-actions { opacity: 1; }
@media (hover: none) { .pc-actions { opacity: 1; } }
.lh-tight { line-height: 1.25; }
.pc-short { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }
</style>
