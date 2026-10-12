<script setup>
import { computed } from 'vue'
import { useAuth } from '@/stores/auth'
import { useOrders, statusMeta, fmtMoney, fmtDate } from '@/composables/useOrders'

const auth = useAuth()
const { orders, loading } = useOrders()
const active = computed(() => orders.value.filter((o) => !['delivered', 'cancelled'].includes(o.status)))
const spent = computed(() => orders.value.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0))
const stats = computed(() => [
  { t: 'Pedidos', v: orders.value.length, icon: 'mdi-package-variant-closed', c: 'primary' },
  { t: 'En camino', v: active.value.length, icon: 'mdi-truck-fast-outline', c: 'secondary' },
  { t: 'Total gastado', v: fmtMoney(spent.value), icon: 'mdi-cash-multiple', c: 'success' }
])
const progress = (o) => Math.round((o.timeline.filter((t) => t.done).length / o.timeline.length) * 100)
</script>

<template>
  <div>
    <h1 class="serif text-h4 mb-1">Hola, {{ auth.user.name.split(' ')[0] }} 👋</h1>
    <p class="text-medium-emphasis mb-6">Este es el estado de tus relojes.</p>
    <v-row class="mb-2">
      <v-col v-for="s in stats" :key="s.t" cols="12" sm="4"><v-card border class="pa-4 d-flex align-center ga-4"><v-avatar :color="s.c" variant="tonal" size="48"><v-icon>{{ s.icon }}</v-icon></v-avatar><div><div class="text-caption text-medium-emphasis">{{ s.t }}</div><div class="text-h5 font-weight-bold">{{ loading ? '…' : s.v }}</div></div></v-card></v-col>
    </v-row>

    <h2 class="text-h6 serif mt-6 mb-3">Pedidos en curso</h2>
    <v-skeleton-loader v-if="loading" type="list-item-two-line" />
    <v-card v-for="o in active" :key="o.id" border class="pa-4 mb-3" :to="`/cuenta/pedidos/${o.id}`">
      <div class="d-flex flex-wrap align-center ga-2 mb-2"><strong>{{ o.id }}</strong><v-chip :color="statusMeta[o.status].color" size="small" label :prepend-icon="statusMeta[o.status].icon">{{ statusMeta[o.status].label }}</v-chip><v-spacer /><span class="text-body-2 text-medium-emphasis">Llega aprox. {{ fmtDate(o.eta) }}</span></div>
      <v-progress-linear :model-value="progress(o)" rounded height="8" color="primary" />
      <div class="text-body-2 text-medium-emphasis mt-2">{{ o.items.map((i) => i.name).join(', ') }}</div>
    </v-card>
    <v-sheet v-if="!loading && !active.length" border rounded="xl" class="pa-6 text-center text-medium-emphasis">No tienes pedidos en curso. <router-link to="/relojes">Descubre la colección</router-link></v-sheet>

    <div class="d-flex align-center mt-8 mb-3"><h2 class="text-h6 serif">Últimos pedidos</h2><v-spacer /><v-btn variant="text" to="/cuenta/pedidos" append-icon="mdi-arrow-right">Ver todos</v-btn></div>
    <v-card border>
      <v-list lines="two" bg-color="transparent">
        <v-list-item v-for="o in orders.slice(0, 4)" :key="o.id" :to="`/cuenta/pedidos/${o.id}`" :title="o.id" :subtitle="`${fmtDate(o.createdAt)} · ${o.items.length} artículo(s)`">
          <template #append><div class="text-right"><div class="font-weight-bold">{{ fmtMoney(o.totals.total) }}</div><v-chip :color="statusMeta[o.status].color" size="x-small" label>{{ statusMeta[o.status].label }}</v-chip></div></template>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>
