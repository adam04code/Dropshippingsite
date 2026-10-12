<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/api'
import { useAuth } from '@/stores/auth'
import { useCart } from '@/stores/cart'
import { useUi } from '@/stores/ui'
import { useSeo } from '@/composables/useSeo'
import { track, attribution } from '@/composables/useTracking'

useSeo({ title: 'Finalizar compra', noindex: true, path: '/checkout' })
const auth = useAuth(), cart = useCart(), ui = useUi(), router = useRouter()
const fmt = (n) => (n ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
const step = ref(1)
const a = auth.user.address || {}
const ship = reactive({ name: auth.user.name, line1: a.line1 || '', line2: a.line2 || '', city: a.city || '', zip: a.zip || '', province: a.province || '', country: a.country || 'España', phone: auth.user.phone || '' })
const pay = reactive({ method: 'card', number: '', name: '', exp: '', cvc: '' })
const saveAddr = ref(true)
const busy = ref(false), error = ref('')
const form1 = ref(null), form2 = ref(null)

const req = (m) => (v) => !!String(v || '').trim() || m
const rules = { name: [req('Nombre obligatorio')], line1: [req('Dirección obligatoria')], city: [req('Ciudad obligatoria')], zip: [req('Código postal obligatorio'), (v) => /^\d{4,6}$/.test(v) || 'Código postal no válido'], country: [req('País obligatorio')] }
const luhn = (n) => { let s = 0; n.split('').reverse().forEach((d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9 } s += x }); return s % 10 === 0 }
const cardRules = {
  number: [(v) => { const d = (v || '').replace(/\s/g, ''); return (/^\d{13,19}$/.test(d) && luhn(d)) || 'Número de tarjeta no válido (prueba 4242 4242 4242 4242)' }],
  name: [req('Titular obligatorio')],
  exp: [(v) => { const m = /^(\d{2})\/(\d{2})$/.exec(v || ''); if (!m || +m[1] < 1 || +m[1] > 12) return 'MM/AA'; const d = new Date(2000 + +m[2], +m[1], 1); return d > new Date() || 'Tarjeta caducada' }],
  cvc: [(v) => /^\d{3,4}$/.test(v || '') || 'CVC no válido']
}
const fmtCard = () => (pay.number = pay.number.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim())
const fmtExp = () => { const d = pay.exp.replace(/\D/g, '').slice(0, 4); pay.exp = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d }

async function next1() { const { valid } = await form1.value.validate(); if (valid) { step.value = 2; track('add_shipping_info', {}) } }
async function next2() { if (pay.method === 'card') { const { valid } = await form2.value.validate(); if (!valid) return } step.value = 3; track('add_payment_info', { payment_type: pay.method }) }

async function confirm() {
  busy.value = true; error.value = ''
  try {
    const { order } = await api.post('/orders', {
      items: cart.items, coupon: cart.coupon || undefined, shipping: { ...ship },
      payment: pay.method === 'card' ? { method: 'card', number: pay.number } : { method: 'transfer' },
      attribution: attribution()
    })
    if (saveAddr.value) await auth.updateProfile({ phone: ship.phone, address: { ...ship } }).catch(() => {})
    track('purchase', { transaction_id: order.id, currency: 'EUR', value: order.totals.total, shipping: order.totals.shipping, coupon: order.coupon?.code, items: order.items.map((i) => ({ item_id: i.productId, item_name: i.name, price: i.price, quantity: i.qty })) })
    cart.clear()
    router.replace({ path: `/cuenta/pedidos/${order.id}`, query: { nuevo: 1 } })
  } catch (e) { error.value = e.message }
  busy.value = false
}
const q = computed(() => cart.quote)
if (!cart.items.length) router.replace('/carrito')
else { cart.refresh(); track('begin_checkout', { currency: 'EUR', value: cart.subtotal }) }
</script>

<template>
  <v-container class="py-8" style="max-width: 1100px">
    <h1 class="serif section-title mb-6">Finalizar compra</h1>
    <v-row>
      <v-col cols="12" md="7">
        <v-stepper v-model="step" flat border rounded="xl" hide-actions alt-labels>
          <v-stepper-header>
            <v-stepper-item :value="1" title="Envío" :complete="step > 1" color="primary" icon="mdi-map-marker-outline" />
            <v-divider /><v-stepper-item :value="2" title="Pago" :complete="step > 2" color="primary" icon="mdi-credit-card-outline" />
            <v-divider /><v-stepper-item :value="3" title="Confirmar" color="primary" icon="mdi-check" />
          </v-stepper-header>
          <v-stepper-window class="pa-2">
            <v-stepper-window-item :value="1">
              <v-form ref="form1" class="pa-3" @submit.prevent="next1">
                <v-row dense>
                  <v-col cols="12"><v-text-field v-model="ship.name" label="Nombre y apellidos" :rules="rules.name" autocomplete="name" /></v-col>
                  <v-col cols="12"><v-text-field v-model="ship.line1" label="Dirección" :rules="rules.line1" autocomplete="address-line1" /></v-col>
                  <v-col cols="12"><v-text-field v-model="ship.line2" label="Piso, puerta… (opcional)" autocomplete="address-line2" /></v-col>
                  <v-col cols="6" sm="4"><v-text-field v-model="ship.zip" label="C. postal" :rules="rules.zip" autocomplete="postal-code" inputmode="numeric" /></v-col>
                  <v-col cols="6" sm="8"><v-text-field v-model="ship.city" label="Ciudad" :rules="rules.city" autocomplete="address-level2" /></v-col>
                  <v-col cols="12" sm="6"><v-text-field v-model="ship.province" label="Provincia" autocomplete="address-level1" /></v-col>
                  <v-col cols="12" sm="6"><v-select v-model="ship.country" :items="['España', 'Portugal', 'Francia', 'Italia', 'Alemania']" label="País" /></v-col>
                  <v-col cols="12"><v-text-field v-model="ship.phone" label="Teléfono (para el transportista)" autocomplete="tel" /></v-col>
                </v-row>
                <v-btn type="submit" color="primary" size="large" block>Continuar al pago</v-btn>
              </v-form>
            </v-stepper-window-item>
            <v-stepper-window-item :value="2">
              <v-form ref="form2" class="pa-3" @submit.prevent="next2">
                <v-radio-group v-model="pay.method" inline hide-details class="mb-3"><v-radio label="Tarjeta" value="card" /><v-radio label="Transferencia" value="transfer" /></v-radio-group>
                <template v-if="pay.method === 'card'">
                  <v-alert type="info" variant="tonal" density="compact" class="mb-3">Demo: los pagos son simulados. Usa <strong>4242 4242 4242 4242</strong>, cualquier fecha futura y CVC.</v-alert>
                  <v-text-field v-model="pay.number" label="Número de tarjeta" :rules="cardRules.number" autocomplete="cc-number" inputmode="numeric" prepend-inner-icon="mdi-credit-card-outline" @update:model-value="fmtCard" />
                  <v-text-field v-model="pay.name" label="Titular" :rules="cardRules.name" autocomplete="cc-name" />
                  <v-row dense><v-col cols="6"><v-text-field v-model="pay.exp" label="Caducidad (MM/AA)" :rules="cardRules.exp" autocomplete="cc-exp" @update:model-value="fmtExp" /></v-col><v-col cols="6"><v-text-field v-model="pay.cvc" label="CVC" :rules="cardRules.cvc" type="password" autocomplete="cc-csc" inputmode="numeric" maxlength="4" /></v-col></v-row>
                </template>
                <v-alert v-else type="info" variant="tonal" class="mb-3">Te mostraremos los datos bancarios al confirmar. El pedido se prepara cuando recibamos el pago.</v-alert>
                <div class="d-flex ga-3"><v-btn variant="outlined" size="large" @click="step = 1">Atrás</v-btn><v-btn type="submit" color="primary" size="large" class="flex-grow-1">Revisar pedido</v-btn></div>
              </v-form>
            </v-stepper-window-item>
            <v-stepper-window-item :value="3">
              <div class="pa-3">
                <div class="text-overline">Enviar a</div>
                <p class="mb-3">{{ ship.name }} · {{ ship.line1 }} {{ ship.line2 }}, {{ ship.zip }} {{ ship.city }} ({{ ship.country }})</p>
                <div class="text-overline">Pago</div>
                <p class="mb-3">{{ pay.method === 'card' ? 'Tarjeta terminada en ' + pay.number.slice(-4) : 'Transferencia bancaria' }}</p>
                <v-checkbox v-model="saveAddr" label="Guardar esta dirección en mi cuenta" density="compact" hide-details color="primary" />
                <v-alert v-if="error" type="error" variant="tonal" class="my-3">{{ error }}</v-alert>
                <div class="d-flex ga-3 mt-4"><v-btn variant="outlined" size="large" :disabled="busy" @click="step = 2">Atrás</v-btn><v-btn color="primary" size="large" class="flex-grow-1" :loading="busy" prepend-icon="mdi-lock-outline" @click="confirm">Pagar {{ fmt(q?.total) }}</v-btn></div>
              </div>
            </v-stepper-window-item>
          </v-stepper-window>
        </v-stepper>
      </v-col>
      <v-col cols="12" md="5">
        <v-card border class="pa-5 sticky">
          <h2 class="text-h6 serif mb-3">Tu pedido</h2>
          <div v-for="l in cart.lines" :key="l.productId" class="d-flex justify-space-between text-body-2 mb-2"><span>{{ l.qty }} × {{ l.product.name }}</span><span>{{ fmt(l.product.price * l.qty) }}</span></div>
          <v-divider class="my-3" />
          <div class="text-body-2">
            <div class="d-flex justify-space-between"><span>Subtotal</span><span>{{ fmt(q?.subtotal) }}</span></div>
            <div v-if="q?.discount" class="d-flex justify-space-between text-success"><span>Descuento ({{ q.coupon?.code }})</span><span>-{{ fmt(q.discount) }}</span></div>
            <div class="d-flex justify-space-between"><span>Envío</span><span>{{ q?.shipping ? fmt(q.shipping) : 'Gratis' }}</span></div>
            <div class="d-flex justify-space-between text-h6 mt-2"><span>Total</span><span class="price-now">{{ fmt(q?.total) }}</span></div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>.sticky { position: sticky; top: 88px; }</style>
