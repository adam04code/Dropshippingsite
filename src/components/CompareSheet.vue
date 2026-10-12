<script setup>
import { computed } from 'vue'
import { useCatalog } from '@/stores/catalog'
import { useCart } from '@/stores/cart'
import { useUi } from '@/stores/ui'
import WatchSvg from './WatchSvg.vue'

const cat = useCatalog(), ui = useUi(), cart = useCart()
const items = computed(() => cat.compare.map((id) => cat.byId(id)).filter(Boolean))
const keys = computed(() => [...new Set(items.value.flatMap((p) => Object.keys(p.specs)))])
const fmt = (n) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
const best = computed(() => Math.min(...items.value.map((p) => p.price)))
</script>

<template>
  <v-bottom-sheet v-model="ui.compareOpen" max-width="1000" inset scrollable>
    <v-card border>
      <v-card-title class="d-flex align-center serif pa-4">Comparador <v-spacer /><v-btn icon="mdi-close" variant="text" aria-label="Cerrar" @click="ui.compareOpen = false" /></v-card-title>
      <v-card-text v-if="items.length < 2" class="text-center py-8 text-medium-emphasis">Añade al menos 2 relojes pulsando <v-icon>mdi-compare-horizontal</v-icon> en sus fichas.</v-card-text>
      <v-card-text v-else class="pa-0">
        <v-table class="cmp">
          <thead>
            <tr>
              <th />
              <th v-for="p in items" :key="p.id" class="text-center py-4">
                <div class="thumb wall mx-auto"><WatchSvg :colors="p.colors" :watch-style="p.style" /></div>
                <router-link :to="`/relojes/${p.slug}`" class="text-subtitle-2 d-block mt-2" @click="ui.compareOpen = false">{{ p.name }}</router-link>
                <v-btn size="x-small" variant="text" color="error" @click="cat.toggleCompare(p.id)">Quitar</v-btn>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="font-weight-bold">Precio</td><td v-for="p in items" :key="p.id" class="text-center"><span :class="{ 'text-success font-weight-bold': p.price === best }">{{ fmt(p.price) }}</span></td></tr>
            <tr><td class="font-weight-bold">Valoración</td><td v-for="p in items" :key="p.id" class="text-center"><v-rating :model-value="p.rating" size="16" density="compact" color="primary" readonly half-increments /></td></tr>
            <tr v-for="k in keys" :key="k"><td class="font-weight-bold">{{ k }}</td><td v-for="p in items" :key="p.id" class="text-center text-body-2">{{ p.specs[k] || '—' }}</td></tr>
            <tr><td /><td v-for="p in items" :key="p.id" class="text-center py-3"><v-btn color="primary" size="small" prepend-icon="mdi-cart-plus" @click="cart.add(p); ui.notify('Añadido al carrito')">Añadir</v-btn></td></tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<style scoped>
.thumb { width: 72px; height: 92px; border-radius: 12px; padding: 8px 12px; }
.cmp td:first-child, .cmp th:first-child { min-width: 140px; }
</style>
