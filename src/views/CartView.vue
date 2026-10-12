<script setup>
import { ref } from 'vue'
import { useCart } from '@/stores/cart'
import { useUi } from '@/stores/ui'
import { useSeo } from '@/composables/useSeo'
import WatchSvg from '@/components/WatchSvg.vue'

useSeo({ title: 'Carrito', noindex: true, path: '/carrito' })
const cart = useCart(), ui = useUi()
const code = ref(''), err = ref('')
const fmt = (n) => (n ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
async function apply() { err.value = ''; try { await cart.applyCoupon(code.value); ui.notify('Cupón aplicado'); code.value = '' } catch (e) { err.value = e.message } }
</script>

<template>
  <v-container class="py-8">
    <h1 class="serif section-title mb-6">Tu carrito</h1>
    <v-sheet v-if="!cart.lines.length" border rounded="xl" class="text-center pa-12">
      <v-icon size="64" class="text-medium-emphasis mb-3">mdi-cart-off</v-icon><p class="text-h6 mb-4">Tu carrito está vacío</p><v-btn color="primary" to="/relojes">Descubrir relojes</v-btn>
    </v-sheet>
    <v-row v-else>
      <v-col cols="12" md="8">
        <v-card v-for="l in cart.lines" :key="l.productId" border class="pa-3 mb-3 d-flex align-center ga-4">
          <router-link :to="`/relojes/${l.product.slug}`" class="thumb wall"><WatchSvg :colors="l.product.colors" :watch-style="l.product.style" /></router-link>
          <div class="flex-grow-1">
            <router-link :to="`/relojes/${l.product.slug}`" class="text-subtitle-1 font-weight-bold text-decoration-none">{{ l.product.name }}</router-link>
            <div class="text-body-2 text-medium-emphasis">{{ l.product.short }}</div>
            <div class="d-flex align-center mt-2 ga-2">
              <v-btn icon="mdi-minus" size="x-small" variant="tonal" :disabled="l.qty <= 1" aria-label="Menos" @click="cart.setQty(l.productId, l.qty - 1)" />
              <span style="min-width: 24px; text-align: center">{{ l.qty }}</span>
              <v-btn icon="mdi-plus" size="x-small" variant="tonal" :disabled="l.qty >= Math.min(10, l.product.stock)" aria-label="Más" @click="cart.setQty(l.productId, l.qty + 1)" />
              <v-btn size="small" variant="text" color="error" prepend-icon="mdi-delete-outline" @click="cart.remove(l.productId)">Quitar</v-btn>
            </div>
          </div>
          <div class="price-now text-h6">{{ fmt(l.product.price * l.qty) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card border class="pa-5 sticky">
          <h2 class="text-h6 serif mb-3">Resumen</h2>
          <v-text-field v-model="code" label="Código de descuento" density="compact" :error-messages="err" hide-details="auto" append-inner-icon="mdi-check" @keyup.enter="apply" @click:append-inner="apply" />
          <v-chip v-if="cart.quote?.coupon" class="mt-2" closable color="success" size="small" @click:close="cart.applyCoupon('')">{{ cart.quote.coupon.code }}</v-chip>
          <div class="text-body-2 mt-4">
            <div class="d-flex justify-space-between mb-1"><span>Subtotal</span><span>{{ fmt(cart.quote?.subtotal ?? cart.subtotal) }}</span></div>
            <div v-if="cart.savings" class="d-flex justify-space-between mb-1 text-success"><span>Ahorras vs. PVP</span><span>{{ fmt(cart.savings) }}</span></div>
            <div v-if="cart.quote?.discount" class="d-flex justify-space-between mb-1 text-success"><span>Cupón</span><span>-{{ fmt(cart.quote.discount) }}</span></div>
            <div class="d-flex justify-space-between mb-1"><span>Envío</span><span>{{ cart.quote?.shipping ? fmt(cart.quote.shipping) : 'Gratis' }}</span></div>
            <v-divider class="my-3" />
            <div class="d-flex justify-space-between text-h6"><span>Total</span><span class="price-now">{{ fmt(cart.quote?.total ?? cart.subtotal) }}</span></div>
          </div>
          <v-btn block color="primary" size="large" class="mt-4" to="/checkout" append-icon="mdi-arrow-right">Finalizar compra</v-btn>
          <p class="text-caption text-medium-emphasis text-center mt-3"><v-icon size="14">mdi-lock-outline</v-icon> Pago seguro · 30 días de devolución</p>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.thumb { width: 84px; height: 104px; padding: 8px 14px; border-radius: 14px; flex-shrink: 0; display: grid; place-items: center; }
.sticky { position: sticky; top: 88px; }
</style>
