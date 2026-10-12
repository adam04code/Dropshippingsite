<script setup>
import { useCatalog } from '@/stores/catalog'
const f = defineModel({ type: Object, required: true })
const cat = useCatalog()
const styles = [{ v: 'diver', t: 'Buceo' }, { v: 'classic', t: 'Clásico' }, { v: 'chrono', t: 'Cronógrafo' }, { v: 'skeleton', t: 'Esqueleto' }, { v: 'minimal', t: 'Minimal' }]
const fmt = (n) => n + ' €'
</script>

<template>
  <div>
    <div class="text-overline mb-1">Colección</div>
    <v-checkbox v-for="c in cat.categories" :key="c.slug" v-model="f.categories" :value="c.slug" :label="c.name" density="compact" hide-details color="primary" />
    <v-divider class="my-4" />
    <div class="text-overline mb-1">Precio: {{ fmt(f.price[0]) }} – {{ fmt(f.price[1]) }}</div>
    <v-range-slider v-model="f.price" :min="50" :max="250" :step="5" color="primary" hide-details thumb-label aria-label="Rango de precio" />
    <v-divider class="my-4" />
    <div class="text-overline mb-2">Estilo</div>
    <v-chip-group v-model="f.styles" multiple column color="primary">
      <v-chip v-for="s in styles" :key="s.v" :value="s.v" filter variant="outlined">{{ s.t }}</v-chip>
    </v-chip-group>
    <v-divider class="my-4" />
    <v-switch v-model="f.onSale" label="Solo ofertas" color="accent" hide-details density="compact" inset />
    <v-switch v-model="f.inStock" label="Solo disponibles" color="primary" hide-details density="compact" inset />
    <v-btn block variant="tonal" class="mt-4" prepend-icon="mdi-filter-remove-outline" @click="$emit('reset')">Limpiar filtros</v-btn>
  </div>
</template>
