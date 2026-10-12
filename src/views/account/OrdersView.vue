<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrders, statusMeta, fmtMoney, fmtDate } from '@/composables/useOrders'
import WatchSvg from '@/components/WatchSvg.vue'

const router = useRouter()
const { orders, loading, error } = useOrders()
const search = ref('')
const filter = ref('all')
const expanded = ref([])
const headers = [
  { title: 'Pedido', key: 'id' }, { title: 'Fecha', key: 'createdAt' }, { title: 'Artículos', key: 'items', sortable: false },
  { title: 'Estado', key: 'status' }, { title: 'Total', key: 'totals.total', align: 'end' }, { title: '', key: 'data-table-expand', sortable: false }
]
const filters = [{ v: 'all', t: 'Todos' }, { v: 'active', t: 'En curso' }, { v: 'delivered', t: 'Entregados' }, { v: 'cancelled', t: 'Cancelados' }]
const rows = computed(() => orders.value.filter((o) => filter.value === 'all' || (filter.value === 'active' ? !['delivered', 'cancelled'].includes(o.status) : o.status === filter.value)))
const open = (_e, { item }) => router.push(`/cuenta/pedidos/${item.id}`)
</script>

<template>
  <div>
    <h1 class="serif text-h4 mb-4">Mis pedidos</h1>
    <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
    <v-card border>
      <div class="d-flex flex-wrap align-center ga-3 pa-4">
        <v-chip-group v-model="filter" mandatory color="primary"><v-chip v-for="f in filters" :key="f.v" :value="f.v" filter variant="outlined">{{ f.t }}</v-chip></v-chip-group>
        <v-spacer />
        <v-text-field v-model="search" placeholder="Buscar pedido o reloj…" prepend-inner-icon="mdi-magnify" density="compact" hide-details clearable style="max-width: 280px" aria-label="Buscar pedidos" />
      </div>
      <v-data-table v-model:expanded="expanded" :headers="headers" :items="rows" :loading="loading" :search="search" item-value="id" show-expand hover :sort-by="[{ key: 'createdAt', order: 'desc' }]" items-per-page="8" items-per-page-text="Por página" no-data-text="Aún no hay pedidos" :custom-filter="(v, q, item) => item.raw.id.toLowerCase().includes(q.toLowerCase()) || item.raw.items.some((i) => i.name.toLowerCase().includes(q.toLowerCase()))" @click:row="open">
        <template #item.id="{ item }"><strong>{{ item.id }}</strong></template>
        <template #item.createdAt="{ item }">{{ fmtDate(item.createdAt) }}</template>
        <template #item.items="{ item }"><div class="d-flex ga-1"><div v-for="i in item.items.slice(0, 3)" :key="i.productId" class="th wall"><WatchSvg :colors="i.colors" :watch-style="i.style" /></div><span v-if="item.items.length > 3" class="text-caption align-self-center">+{{ item.items.length - 3 }}</span></div></template>
        <template #item.status="{ item }"><v-chip :color="statusMeta[item.status].color" size="small" label :prepend-icon="statusMeta[item.status].icon">{{ statusMeta[item.status].label }}</v-chip></template>
        <template #item.totals.total="{ item }"><span class="price-now">{{ fmtMoney(item.totals.total) }}</span></template>
        <template #expanded-row="{ columns, item }">
          <tr><td :colspan="columns.length" class="py-3">
            <div v-for="i in item.items" :key="i.productId" class="d-flex justify-space-between text-body-2 mb-1"><span>{{ i.qty }} × {{ i.name }}</span><span>{{ fmtMoney(i.price * i.qty) }}</span></div>
            <v-btn size="small" variant="tonal" color="primary" class="mt-2" :to="`/cuenta/pedidos/${item.id}`" append-icon="mdi-arrow-right">Ver seguimiento</v-btn>
          </td></tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<style scoped>.th { width: 28px; height: 36px; border-radius: 6px; padding: 3px 4px; } :deep(tbody tr) { cursor: pointer; }</style>
