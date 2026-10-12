<script setup>
import { useSeo } from '@/composables/useSeo'
useSeo({ title: 'Página no encontrada', noindex: true })
</script>
<template>
  <v-container class="text-center py-16">
    <div class="serif" style="font-size: clamp(5rem, 18vw, 10rem); line-height: 1"><span class="gold-text">4:04</span></div>
    <h1 class="serif text-h4 mb-2">Esta página se ha parado</h1>
    <p class="text-medium-emphasis mb-6">No encontramos lo que buscas, pero el tiempo sigue corriendo.</p>
    <v-btn color="primary" size="large" to="/">Volver al inicio</v-btn>
  </v-container>
</template>
