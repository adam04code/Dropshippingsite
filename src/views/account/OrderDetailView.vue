<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { useUi } from '@/stores/ui'
import { statusMeta, fmtMoney, fmtDate } from '@/composables/useOrders'
import WatchSvg from '@/components/WatchSvg.vue'

const route = useRoute(), ui = useUi()
const order = ref(null), error = ref(''), confirmCancel = ref(false), busy = ref(false)
let t
async function load() { try { order.value = (await api.get('/orders/' + route.params.id)).order } catch (e) { error.value = e.message } }
onMounted(() => { load(); t = setInterval(() => !document.hidden && load(), 10000) })
onBeforeUnmount(() => clearInterval(t))
const canCancel = computed(() => order.value && ['paid', 'supplier', 'packed'].includes(order.value.status))
const isNew = computed(() => !!route.query.nuevo)
async function cancel() {
  busy.value = true
  try { order.value = (await api.post(`/orders/${order.value.id}/cancel`)).order; ui.notify('Pedido cancelado', 'info') } catch (e) { ui.notify(e.message, 'error') }
  busy.value = false; confirmCancel.value = false
}
function copy(text) { navigator.clipboard?.writeText(text); ui.notify('Copiado', 'info') }
</script>

<template>
  <div>
    <v-btn variant="text" to="/cuenta/pedidos" prepend-icon="mdi-arrow-left" class="mb-2 ml-n3">Mis pedidos</v-btn>
    <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
    <v-skeleton-loader v-else-if="!order" type="article, list-item-three-line" />
    <template v-else>
      <v-alert v-if="isNew" type="success" variant="tonal" icon="mdi-party-popper" class="mb-4" rounded="xl" title="¡Gracias por tu compra!">Hemos recibido tu pedido. Te mostramos aquí su estado en tiempo real.</v-alert>
      <div class="d-flex flex-wrap align-center ga-3 mb-4">
        <h1 class="serif text-h4">Pedido {{ order.id }}</h1>
        <v-chip :color="statusMeta[order.status].color" label :prepend-icon="statusMeta[order.status].icon">{{ statusMeta[order.status].label }}</v-chip>
        <v-spacer />
        <v-btn v-if="canCancel" color="error" variant="outlined" prepend-icon="mdi-close" @click="confirmCancel = true">Cancelar pedido</v-btn>
      </div>
      <p class="text-medium-emphasis mb-6">Realizado el {{ fmtDate(order.createdAt, true) }}</p>

      <v-row>
        <v-col cols="12" lg="7">
          <v-card border class="pa-5 mb-4">
            <div class="d-flex align-center mb-3"><h2 class="text-h6 serif">Seguimiento</h2><v-spacer /><span v-if="order.status !== 'cancelled' && order.status !== 'delivered'" class="text-caption text-medium-emphasis"><span class="pulse-dot mr-1" /> En vivo</span></div>
            <v-timeline side="end" align="start" density="compact" truncate-line="both">
              <v-timeline-item v-for="s in order.timeline" :key="s.key" :dot-color="s.done ? (s.key === 'cancelled' ? 'error' : 'primary') : 'surface-variant'" :icon="s.done ? (s.icon || 'mdi-close') : undefined" size="small">
                <div :class="s.done ? '' : 'text-disabled'"><div class="font-weight-bold">{{ s.label }}</div><div class="text-caption">{{ s.done ? fmtDate(s.at, true) : 'Previsto ' + fmtDate(s.at) }}</div></div>
              </v-timeline-item>
            </v-timeline>
            <v-divider class="my-4" />
            <div v-if="order.tracking" class="d-flex flex-wrap align-center ga-2">
              <v-icon color="primary">mdi-truck-delivery-outline</v-icon><span class="text-body-2">{{ order.tracking.carrier }}:</span><code class="px-2 py-1 rounded bg-surface-variant" style="color: inherit">{{ order.tracking.code }}</code>
              <v-btn icon="mdi-content-copy" size="x-small" variant="text" aria-label="Copiar código" @click="copy(order.tracking.code)" />
            </div>
            <p v-else-if="order.status !== 'cancelled'" class="text-body-2 text-medium-emphasis"><v-icon size="16">mdi-information-outline</v-icon> El código de seguimiento estará disponible cuando el transportista recoja tu pedido.</p>
            <p v-if="order.status !== 'cancelled' && order.status !== 'delivered'" class="text-body-2 mt-2">Entrega estimada: <strong>{{ fmtDate(order.eta) }}</strong></p>
          </v-card>
        </v-col>
        <v-col cols="12" lg="5">
          <v-card border class="pa-5 mb-4">
            <h2 class="text-h6 serif mb-3">Artículos</h2>
            <div v-for="i in order.items" :key="i.productId" class="d-flex align-center ga-3 mb-3">
              <router-link :to="`/relojes/${i.slug}`" class="th wall"><WatchSvg :colors="i.colors" :watch-style="i.style" /></router-link>
              <div class="flex-grow-1 text-body-2"><div class="font-weight-bold">{{ i.name }}</div><div class="text-medium-emphasis">{{ i.qty }} × {{ fmtMoney(i.price) }}</div></div>
              <strong>{{ fmtMoney(i.price * i.qty) }}</strong>
            </div>
            <v-divider class="my-3" />
            <div class="text-body-2">
              <div class="d-flex justify-space-between"><span>Subtotal</span><span>{{ fmtMoney(order.totals.subtotal) }}</span></div>
              <div v-if="order.totals.discount" class="d-flex justify-space-between text-success"><span>Descuento {{ order.coupon?.code }}</span><span>-{{ fmtMoney(order.totals.discount) }}</span></div>
              <div class="d-flex justify-space-between"><span>Envío</span><span>{{ order.totals.shipping ? fmtMoney(order.totals.shipping) : 'Gratis' }}</span></div>
              <div class="d-flex justify-space-between text-h6 mt-2"><span>Total</span><span class="price-now">{{ fmtMoney(order.totals.total) }}</span></div>
            </div>
          </v-card>
          <v-card border class="pa-5">
            <h2 class="text-h6 serif mb-2">Entrega y pago</h2>
            <div class="text-body-2">{{ order.shipping.name }}<br>{{ order.shipping.line1 }} {{ order.shipping.line2 }}<br>{{ order.shipping.zip }} {{ order.shipping.city }}, {{ order.shipping.country }}</div>
            <v-divider class="my-3" />
            <div class="text-body-2"><v-icon size="16">mdi-credit-card-outline</v-icon> {{ order.payment.method === 'card' ? `Tarjeta •••• ${order.payment.last4}` : 'Transferencia bancaria' }}</div>
          </v-card>
        </v-col>
      </v-row>

      <v-dialog v-model="confirmCancel" max-width="420">
        <v-card class="pa-5"><h2 class="text-h6 serif mb-2">¿Cancelar el pedido {{ order.id }}?</h2><p class="text-body-2 mb-4">Te reembolsaremos {{ fmtMoney(order.totals.total) }} en 3-5 días hábiles.</p><div class="d-flex justify-end ga-2"><v-btn variant="text" @click="confirmCancel = false">Mantener</v-btn><v-btn color="error" :loading="busy" @click="cancel">Sí, cancelar</v-btn></div></v-card>
      </v-dialog>
    </template>
  </div>
</template>

<style scoped>.th { width: 48px; height: 60px; border-radius: 10px; padding: 5px 8px; flex-shrink: 0; }</style>
