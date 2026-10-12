// Lógica de pedidos de dropshipping: precio, envío y línea de tiempo del proveedor.
import { products } from './data/products.js'

const bySlug = new Map(products.map((p) => [p.id, p]))
export const getProduct = (id) => bySlug.get(id)

export const COUPONS = {
  TIEMPO10: { type: 'percent', value: 10, label: '10% de descuento' },
  CHRONOS20: { type: 'percent', value: 20, min: 200, label: '20% en pedidos de más de 200 €' },
  BIENVENIDO: { type: 'fixed', value: 15, min: 80, label: '15 € de descuento en pedidos de más de 80 €' }
}
export const FREE_SHIPPING_FROM = 100
export const SHIPPING_COST = 4.95

export function priceCart(items, couponCode) {
  const lines = []
  for (const it of items || []) {
    const p = getProduct(it.productId)
    const qty = Math.max(1, Math.min(10, parseInt(it.qty, 10) || 1))
    if (!p) throw httpError(400, `Producto no encontrado: ${it.productId}`)
    if (qty > p.stock) throw httpError(409, `Stock insuficiente de ${p.name} (quedan ${p.stock})`)
    lines.push({ productId: p.id, slug: p.slug, name: p.name, price: p.price, qty, colors: p.colors, style: p.style, supplier: p.supplier })
  }
  if (!lines.length) throw httpError(400, 'El carrito está vacío')
  const subtotal = round(lines.reduce((s, l) => s + l.price * l.qty, 0))
  let discount = 0
  let coupon = null
  if (couponCode) {
    const c = COUPONS[String(couponCode).trim().toUpperCase()]
    if (!c) throw httpError(400, 'Cupón no válido')
    if (c.min && subtotal < c.min) throw httpError(400, `El cupón requiere un mínimo de ${c.min} €`)
    discount = c.type === 'percent' ? round((subtotal * c.value) / 100) : Math.min(c.value, subtotal)
    coupon = { code: String(couponCode).trim().toUpperCase(), label: c.label }
  }
  const shipping = subtotal - discount >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST
  const total = round(subtotal - discount + shipping)
  return { lines, subtotal, discount, shipping, total, coupon }
}

export const round = (n) => Math.round(n * 100) / 100

export function httpError(status, message) {
  const e = new Error(message)
  e.status = status
  return e
}

// Línea de tiempo: horas desde la creación. DEMO_TIME_SCALE=60 => 1 h real = 1 min.
const SCALE = Number(process.env.DEMO_TIME_SCALE || 60)
export const STEPS = [
  { key: 'paid', label: 'Pago confirmado', hours: 0, icon: 'mdi-credit-card-check' },
  { key: 'supplier', label: 'Enviado al proveedor', hours: 2, icon: 'mdi-factory' },
  { key: 'packed', label: 'Preparado y controlado', hours: 24, icon: 'mdi-package-variant-closed-check' },
  { key: 'shipped', label: 'Entregado al transportista', hours: 48, icon: 'mdi-truck-fast' },
  { key: 'transit', label: 'En tránsito', hours: 96, icon: 'mdi-airplane' },
  { key: 'delivered', label: 'Entregado', hours: 216, icon: 'mdi-home-heart' }
]

export function decorate(order) {
  if (order.cancelledAt) return { ...order, status: 'cancelled', timeline: [{ key: 'cancelled', label: 'Cancelado', at: order.cancelledAt, done: true }] }
  const created = new Date(order.createdAt).getTime()
  const now = Date.now()
  const timeline = STEPS.map((s) => {
    const at = created + (s.hours * 3600 * 1000) / SCALE
    return { key: s.key, label: s.label, icon: s.icon, at: new Date(at).toISOString(), done: now >= at }
  })
  const current = [...timeline].reverse().find((t) => t.done) || timeline[0]
  const trackingReady = timeline.find((t) => t.key === 'shipped').done
  return {
    ...order,
    status: current.key,
    statusLabel: current.label,
    timeline,
    tracking: trackingReady ? order.tracking : null,
    eta: new Date(created + (STEPS.at(-1).hours * 3600 * 1000) / SCALE).toISOString()
  }
}
