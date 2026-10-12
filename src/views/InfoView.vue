<script setup>
import { computed } from 'vue'
import { useSeo } from '@/composables/useSeo'
const props = defineProps({ page: String })
const pages = {
  envios: { title: 'Envíos y devoluciones', blocks: [
    ['Plazos', 'Preparamos cada pedido en 24-48 h. El envío tarda entre 5 y 9 días laborables desde que sale del taller. Recibirás un código de seguimiento y podrás verlo en tu panel en tiempo real.'],
    ['Costes', 'Envío gratis en pedidos desde 100 €. Por debajo, 4,95 €.'],
    ['Devoluciones', 'Tienes 30 días desde la entrega para devolver tu reloj. Debe estar sin uso y con su embalaje. Reembolsamos el 100 % del importe.'],
    ['Pedidos cancelables', 'Puedes cancelar tu pedido desde tu panel mientras no haya sido entregado al transportista.']] },
  garantia: { title: 'Garantía de 2 años', blocks: [
    ['Qué cubre', 'Defectos de fabricación y fallos del movimiento durante 24 meses desde la entrega.'],
    ['Qué no cubre', 'Golpes, humedad en relojes con resistencia inferior a la indicada, desgaste de correas y manipulación por terceros.'],
    ['Cómo reclamar', 'Escríbenos con tu número de pedido y fotos o vídeo del problema. Te damos solución en menos de 72 h.']] }
}
const p = computed(() => pages[props.page])
useSeo(() => ({ title: p.value.title, description: 'Envío gratis desde 100 € en 5-9 días laborables, 30 días de devolución y 2 años de garantía.' }))
</script>
<template>
  <v-container class="py-10" style="max-width: 820px">
    <h1 class="serif section-title mb-6">{{ p.title }}</h1>
    <section v-for="b in p.blocks" :key="b[0]" class="mb-6"><h2 class="text-h6 serif mb-1">{{ b[0] }}</h2><p class="text-body-1 text-medium-emphasis">{{ b[1] }}</p></section>
  </v-container>
</template>
