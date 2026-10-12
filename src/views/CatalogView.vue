<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalog } from '@/stores/catalog'
import { useSeo } from '@/composables/useSeo'
import ProductCard from '@/components/ProductCard.vue'
import CatalogFilters from '@/components/CatalogFilters.vue'

const props = defineProps({ offers: Boolean })
const route = useRoute(), router = useRouter(), cat = useCatalog()
const blank = () => ({ categories: route.params.cat ? [route.params.cat] : [], price: [50, 250], styles: [], onSale: props.offers, inStock: false })
const f = reactive(blank())
const sort = ref('popular')
const q = ref(route.query.q || '')
const showFilters = ref(false)
const visible = ref(9)

watch(() => [route.params.cat, props.offers], () => { Object.assign(f, blank()); visible.value = 9 })
watch(() => route.query.q, (v) => (q.value = v || ''))
watch([f, sort, q], () => (visible.value = 9), { deep: true })

const sorts = [
  { title: 'Más populares', value: 'popular' }, { title: 'Mejor valorados', value: 'rating' },
  { title: 'Precio: menor a mayor', value: 'price-asc' }, { title: 'Precio: mayor a menor', value: 'price-desc' }, { title: 'Mayor descuento', value: 'discount' }
]
const list = computed(() => {
  const t = q.value.trim().toLowerCase()
  let r = cat.products.filter((p) =>
    (!f.categories.length || f.categories.includes(p.category)) &&
    (!f.styles.length || f.styles.includes(p.style)) &&
    p.price >= f.price[0] && p.price <= f.price[1] &&
    (!f.onSale || p.compareAt) && (!f.inStock || p.stock > 0) &&
    (!t || (p.name + p.short + p.category).toLowerCase().includes(t)))
  const by = { popular: (a, b) => b.reviews - a.reviews, rating: (a, b) => b.rating - a.rating, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, discount: (a, b) => (b.compareAt || b.price) / b.price - (a.compareAt || a.price) / a.price }
  return [...r].sort(by[sort.value])
})
const category = computed(() => (route.params.cat ? cat.category(route.params.cat) : null))
const heading = computed(() => (props.offers ? 'Ofertas en relojes' : category.value ? `Relojes ${category.value.name}` : 'Todos los relojes'))
const activeCount = computed(() => f.categories.length + f.styles.length + (f.onSale && !props.offers ? 1 : 0) + (f.inStock ? 1 : 0) + (f.price[0] > 50 || f.price[1] < 250 ? 1 : 0))
function reset() { Object.assign(f, blank()); q.value = ''; if (route.query.q) router.replace({ query: {} }) }

useSeo(() => ({
  title: props.offers ? 'Ofertas en relojes hasta -30%' : category.value ? `Relojes ${category.value.name}` : 'Todos los relojes',
  description: category.value ? `${category.value.blurb} Envío gratis desde 100 € y 30 días de devolución.` : props.offers ? 'Los mejores descuentos en relojes automáticos y de cuarzo. Stock limitado.' : 'Colección completa de relojes: automáticos, buceo, cronógrafos, clásicos y esqueleto.',
  path: route.path
}))

// Cuenta atrás de la oferta (hasta medianoche)
const left = ref('')
let t
function tick() { const e = new Date(); e.setHours(23, 59, 59, 999); const s = Math.max(0, Math.floor((e - Date.now()) / 1000)); left.value = [s / 3600, (s % 3600) / 60, s % 60].map((n) => String(Math.floor(n)).padStart(2, '0')).join(':') }
onMounted(() => { tick(); t = setInterval(tick, 1000) })
onBeforeUnmount(() => clearInterval(t))
</script>

<template>
  <v-container class="py-8">
    <v-breadcrumbs :items="[{ title: 'Inicio', to: '/' }, { title: 'Relojes', to: '/relojes' }, ...(category ? [{ title: category.name, disabled: true }] : [])]" class="px-0" />
    <h1 class="serif section-title mb-1">{{ heading }}</h1>
    <p class="text-medium-emphasis mb-4">{{ category?.blurb || (offers ? 'Descuentos reales en stock limitado.' : 'Automáticos, buceo, cronógrafos, clásicos y esqueleto. Envío gratis desde 100 €.') }}</p>

    <v-alert v-if="offers" color="accent" variant="tonal" icon="mdi-timer-sand" class="mb-6" rounded="xl">
      <div class="d-flex flex-wrap align-center ga-3"><strong>Las ofertas de hoy terminan en</strong><v-chip color="accent" label class="font-weight-bold" style="font-variant-numeric: tabular-nums">{{ left }}</v-chip><span class="text-body-2">+ código <strong>TIEMPO10</strong> para un 10% extra</span></div>
    </v-alert>

    <v-row>
      <v-col md="3" lg="3" class="d-none d-md-block">
        <v-card border class="pa-4 sticky"><CatalogFilters v-model="f" @reset="reset" /></v-card>
      </v-col>
      <v-col cols="12" md="9" lg="9">
        <div class="d-flex flex-wrap align-center ga-3 mb-4">
          <v-btn class="d-md-none" variant="outlined" prepend-icon="mdi-tune-variant" @click="showFilters = true">Filtros <v-badge v-if="activeCount" :content="activeCount" inline color="primary" /></v-btn>
          <v-text-field v-model="q" placeholder="Filtrar por nombre…" prepend-inner-icon="mdi-magnify" hide-details clearable density="compact" style="max-width: 280px" aria-label="Filtrar" />
          <v-spacer />
          <span class="text-body-2 text-medium-emphasis">{{ list.length }} resultados</span>
          <v-select v-model="sort" :items="sorts" hide-details density="compact" style="max-width: 230px" aria-label="Ordenar" />
        </div>

        <v-row v-if="!cat.loaded"><v-col v-for="i in 6" :key="i" cols="12" sm="6" lg="4"><v-skeleton-loader type="image, article, actions" /></v-col></v-row>
        <v-row v-else-if="list.length">
          <v-col v-for="p in list.slice(0, visible)" :key="p.id" cols="12" sm="6" lg="4"><ProductCard :product="p" /></v-col>
        </v-row>
        <v-sheet v-else class="text-center pa-12" border rounded="xl">
          <v-icon size="56" class="mb-3 text-medium-emphasis">mdi-watch-off</v-icon>
          <p class="text-h6">Ningún reloj coincide con tu búsqueda</p>
          <v-btn class="mt-4" color="primary" @click="reset">Limpiar filtros</v-btn>
        </v-sheet>
        <div v-if="list.length > visible" class="text-center mt-8"><v-btn variant="outlined" size="large" @click="visible += 9">Mostrar más ({{ list.length - visible }})</v-btn></div>
      </v-col>
    </v-row>

    <v-bottom-sheet v-model="showFilters">
      <v-card class="pa-5" style="max-height: 80vh; overflow: auto"><div class="d-flex align-center mb-3"><h2 class="text-h6 serif">Filtros</h2><v-spacer /><v-btn variant="flat" color="primary" @click="showFilters = false">Ver {{ list.length }}</v-btn></div><CatalogFilters v-model="f" @reset="reset" /></v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<style scoped>
.sticky { position: sticky; top: 88px; }
</style>
