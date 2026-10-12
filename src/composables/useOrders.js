import { ref, onMounted, onBeforeUnmount } from 'vue'
import { api } from '@/api'

export const statusMeta = {
  paid: { label: 'Pago confirmado', color: 'info', icon: 'mdi-credit-card-check' },
  supplier: { label: 'En preparación', color: 'info', icon: 'mdi-factory' },
  packed: { label: 'Preparado', color: 'warning', icon: 'mdi-package-variant-closed-check' },
  shipped: { label: 'Enviado', color: 'secondary', icon: 'mdi-truck-fast' },
  transit: { label: 'En tránsito', color: 'secondary', icon: 'mdi-airplane' },
  delivered: { label: 'Entregado', color: 'success', icon: 'mdi-home-heart' },
  cancelled: { label: 'Cancelado', color: 'error', icon: 'mdi-close-circle-outline' }
}
export const fmtMoney = (n) => (n ?? 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
export const fmtDate = (iso, long = false) => new Date(iso).toLocaleString('es-ES', long ? { dateStyle: 'long', timeStyle: 'short' } : { day: '2-digit', month: 'short', year: 'numeric' })

// Carga pedidos y los refresca cada 15 s para ver el avance del seguimiento "en vivo"
export function useOrders(poll = 15000) {
  const orders = ref([]), loading = ref(true), error = ref('')
  let t
  async function load() {
    try { orders.value = (await api.get('/orders')).orders; error.value = '' } catch (e) { error.value = e.message }
    loading.value = false
  }
  onMounted(() => { load(); if (poll) t = setInterval(() => !document.hidden && load(), poll) })
  onBeforeUnmount(() => clearInterval(t))
  return { orders, loading, error, reload: load }
}
