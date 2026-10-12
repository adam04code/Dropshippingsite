<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/stores/cart'
import { useCatalog } from '@/stores/catalog'
import { useUi } from '@/stores/ui'
import WatchSvg from './WatchSvg.vue'

const cart = useCart(), cat = useCatalog(), ui = useUi(), router = useRouter()
const fmt = (n) => (n ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
const code = ref('')
const err = ref('')
const free = computed(() => cat.meta?.freeShippingFrom ?? 100)
const progress = computed(() => Math.min(100, ((cart.quote?.total ?? cart.subtotal) / free.value) * 100))
const missing = computed(() => Math.max(0, free.value - (cart.quote ? cart.quote.subtotal - cart.quote.discount : cart.subtotal)))
async function apply() { err.value = ''; try { await cart.applyCoupon(code.value); ui.notify('Cupón aplicado'); code.value = '' } catch (e) { err.value = e.message } }
function go(path) { ui.cartOpen = false; router.push(path) }
</script>

<template>
  <v-navigation-drawer v-model="ui.cartOpen" location="right" temporary width="420" aria-label="Carrito">
    <div class="d-flex flex-column h-100">
      <div class="d-flex align-center pa-4 border-b">
        <h2 class="text-h6 serif">Tu carrito <span class="text-medium-emphasis text-body-2">({{ cart.count }})</span></h2>
        <v-spacer /><v-btn icon="mdi-close" variant="text" aria-label="Cerrar" @click="ui.cartOpen = false" />
      </div>

      <div v-if="!cart.lines.length" class="flex-grow-1 d-flex flex-column align-center justify-center text-center pa-8">
        <v-icon size="64" class="mb-3 text-medium-emphasis">mdi-watch-variant</v-icon>
        <p class="text-h6 mb-1">Aún no hay relojes</p>
        <p class="text-body-2 text-medium-emphasis mb-4">El tiempo corre, ¡encuentra el tuyo!</p>
        <v-btn color="primary" @click="go('/relojes')">Explorar colección</v-btn>
      </div>

      <template v-else>
        <div class="px-4 pt-3">
          <p class="text-body-2 mb-1">
            <template v-if="missing > 0">Te faltan <strong>{{ fmt(missing) }}</strong> para el <strong class="text-primary">envío gratis</strong></template>
            <template v-else><v-icon color="success" size="16">mdi-check-circle</v-icon> ¡Tienes <strong>envío gratis</strong>!</template>
          </p>
          <v-progress-linear :model-value="progress" height="8" rounded :color="missing > 0 ? 'primary' : 'success'" />
        </div>

        <v-list class="flex-grow-1 overflow-y-auto px-2" lines="three" bg-color="transparent">
          <v-list-item v-for="l in cart.lines" :key="l.productId" class="py-3">
            <template #prepend><div class="mini wall mr-3"><WatchSvg :colors="l.product.colors" :watch-style="l.product.style" /></div></template>
            <v-list-item-title class="font-weight-bold text-wrap">{{ l.product.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ fmt(l.product.price) }}</v-list-item-subtitle>
            <div class="d-flex align-center mt-2">
              <v-btn icon="mdi-minus" size="x-small" variant="tonal" :disabled="l.qty <= 1" aria-label="Menos" @click="cart.setQty(l.productId, l.qty - 1)" />
              <span class="mx-3 text-body-2" style="min-width: 16px; text-align: center">{{ l.qty }}</span>
              <v-btn icon="mdi-plus" size="x-small" variant="tonal" :disabled="l.qty >= Math.min(10, l.product.stock)" aria-label="Más" @click="cart.setQty(l.productId, l.qty + 1)" />
              <v-spacer />
              <v-btn icon="mdi-delete-outline" size="small" variant="text" color="error" aria-label="Quitar" @click="cart.remove(l.productId)" />
            </div>
          </v-list-item>
        </v-list>

        <div class="pa-4 border-t">
          <v-text-field v-model="code" label="Código de descuento" density="compact" :error-messages="err" hide-details="auto" append-inner-icon="mdi-ticket-percent-outline" @keyup.enter="apply" @click:append-inner="apply" />
          <v-chip v-if="cart.quote?.coupon" class="mt-2" closable color="success" size="small" @click:close="cart.applyCoupon('')">{{ cart.quote.coupon.code }} · {{ cart.quote.coupon.label }}</v-chip>
          <div class="mt-3 text-body-2">
            <div class="d-flex justify-space-between"><span>Subtotal</span><span>{{ fmt(cart.quote?.subtotal ?? cart.subtotal) }}</span></div>
            <div v-if="cart.quote?.discount" class="d-flex justify-space-between text-success"><span>Descuento</span><span>-{{ fmt(cart.quote.discount) }}</span></div>
            <div class="d-flex justify-space-between"><span>Envío</span><span>{{ cart.quote ? (cart.quote.shipping ? fmt(cart.quote.shipping) : 'Gratis') : '—' }}</span></div>
            <div class="d-flex justify-space-between text-h6 mt-2"><span>Total</span><span class="price-now">{{ fmt(cart.quote?.total ?? cart.subtotal) }}</span></div>
          </div>
          <v-btn block color="primary" size="large" class="mt-3" append-icon="mdi-arrow-right" @click="go('/checkout')">Finalizar compra</v-btn>
          <v-btn block variant="text" class="mt-1" @click="go('/carrito')">Ver carrito completo</v-btn>
        </div>
      </template>
    </div>
  </v-navigation-drawer>
</template>

<style scoped>
.mini { width: 72px; height: 88px; border-radius: 12px; padding: 8px 12px; display: grid; place-items: center; }
</style>
