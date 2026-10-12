<script setup>
// Paleta de comandos (Ctrl/⌘+K): búsqueda instantánea + navegación
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalog } from '@/stores/catalog'
import { useUi } from '@/stores/ui'
import { useAuth } from '@/stores/auth'
import WatchSvg from './WatchSvg.vue'

const cat = useCatalog(), ui = useUi(), auth = useAuth(), router = useRouter()
const q = ref('')
const idx = ref(0)
const input = ref(null)
const fmt = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

const actions = computed(() => [
  { title: 'Ver todos los relojes', icon: 'mdi-watch', to: '/relojes' },
  { title: 'Ofertas', icon: 'mdi-fire', to: '/ofertas' },
  ...cat.categories.map((c) => ({ title: `Colección ${c.name}`, icon: c.icon, to: `/categoria/${c.slug}` })),
  { title: auth.loggedIn ? 'Mis pedidos' : 'Iniciar sesión', icon: 'mdi-package-variant-closed', to: auth.loggedIn ? '/cuenta/pedidos' : '/login' },
  { title: 'Carrito', icon: 'mdi-cart-outline', to: '/carrito' }
])
const results = computed(() => {
  const t = q.value.trim().toLowerCase()
  const prods = (t ? cat.products.filter((p) => (p.name + ' ' + p.short + ' ' + p.category + ' ' + p.style).toLowerCase().includes(t)) : cat.products.slice(0, 4))
    .slice(0, 6).map((p) => ({ type: 'product', p, to: `/relojes/${p.slug}` }))
  const acts = actions.value.filter((a) => !t || a.title.toLowerCase().includes(t)).slice(0, t ? 4 : 5).map((a) => ({ type: 'action', ...a }))
  return [...prods, ...acts]
})
watch(() => ui.searchOpen, async (v) => { if (v) { q.value = ''; idx.value = 0; await nextTick(); input.value?.focus() } })
watch(q, () => (idx.value = 0))
function pick(r) { ui.searchOpen = false; router.push(r.to) }
function key(e) {
  if (e.key === 'ArrowDown') { e.preventDefault(); idx.value = (idx.value + 1) % results.value.length }
  else if (e.key === 'ArrowUp') { e.preventDefault(); idx.value = (idx.value - 1 + results.value.length) % results.value.length }
  else if (e.key === 'Enter') { if (results.value[idx.value]) pick(results.value[idx.value]); else { ui.searchOpen = false; router.push({ path: '/relojes', query: { q: q.value } }) } }
}
</script>

<template>
  <v-dialog v-model="ui.searchOpen" max-width="640" location="top" scrollable>
    <v-card border class="mt-12">
      <v-text-field ref="input" v-model="q" placeholder="Busca un reloj, colección o página…" prepend-inner-icon="mdi-magnify" variant="solo" flat hide-details autofocus class="px-2 pt-2" aria-label="Buscar" @keydown="key" />
      <v-divider />
      <v-list v-if="results.length" role="listbox" class="py-2" max-height="420">
        <v-list-item v-for="(r, i) in results" :key="r.to + i" :active="i === idx" role="option" rounded="lg" class="mx-2" @click="pick(r)" @mouseenter="idx = i">
          <template #prepend>
            <div v-if="r.type === 'product'" class="sr-thumb wall mr-3"><WatchSvg :colors="r.p.colors" :watch-style="r.p.style" /></div>
            <v-icon v-else class="mr-3">{{ r.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ r.type === 'product' ? r.p.name : r.title }}</v-list-item-title>
          <v-list-item-subtitle v-if="r.type === 'product'">{{ fmt(r.p.price) }} · {{ r.p.short }}</v-list-item-subtitle>
          <template #append><v-icon size="small">mdi-keyboard-return</v-icon></template>
        </v-list-item>
      </v-list>
      <div v-else class="pa-8 text-center text-medium-emphasis">Sin resultados para «{{ q }}». Pulsa Enter para buscar en el catálogo.</div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.sr-thumb { width: 36px; height: 46px; border-radius: 8px; padding: 4px 6px; }
</style>
