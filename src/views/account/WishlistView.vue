<script setup>
import { computed } from 'vue'
import { useWishlist } from '@/stores/wishlist'
import { useCatalog } from '@/stores/catalog'
import ProductCard from '@/components/ProductCard.vue'
const wl = useWishlist(), cat = useCatalog()
const items = computed(() => wl.ids.map((id) => cat.byId(id)).filter(Boolean))
</script>
<template>
  <div>
    <h1 class="serif text-h4 mb-4">Favoritos</h1>
    <v-row v-if="items.length"><v-col v-for="p in items" :key="p.id" cols="12" sm="6" lg="4"><ProductCard :product="p" /></v-col></v-row>
    <v-sheet v-else border rounded="xl" class="pa-10 text-center"><v-icon size="56" class="text-medium-emphasis mb-2">mdi-heart-outline</v-icon><p class="mb-3">Aún no tienes favoritos. Pulsa el corazón en cualquier reloj.</p><v-btn color="primary" to="/relojes">Explorar</v-btn></v-sheet>
  </div>
</template>
