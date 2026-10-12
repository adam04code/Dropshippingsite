import express from 'express'
import compression from 'compression'
import helmet from 'helmet'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { load, save, db, uid } from './db.js'
import { products, categories } from './data/products.js'
import { priceCart, decorate, httpError, COUPONS, FREE_SHIPPING_FROM, SHIPPING_COST, STEPS } from './orders.js'
import { metaFor, headHtml, sitemap, robots, merchantFeed } from './seo.js'
import { watchSvgString } from '../shared/watch.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const PORT = process.env.PORT || 3000
const isProd = process.env.NODE_ENV === 'production'

load()
seedDemo()

const app = express()
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", "'unsafe-inline'", 'https://www.googletagmanager.com'],
        'img-src': ["'self'", 'data:', 'https://www.google-analytics.com', 'https://www.googletagmanager.com'],
        'connect-src': ["'self'", 'https://www.google-analytics.com', 'https://region1.google-analytics.com'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'upgrade-insecure-requests': isProd ? [] : null
      }
    }
  })
)
app.use(compression())
app.use(express.json({ limit: '50kb' }))

const baseUrl = (req) => (process.env.SITE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '')

// ---------- util: auth + rate limit ----------
const SECRET = () => process.env.JWT_SECRET || db().secret
const sign = (u) => jwt.sign({ sub: u.id }, SECRET(), { expiresIn: '14d' })
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone || '', address: u.address || {}, wishlist: u.wishlist || [], createdAt: u.createdAt })
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

function auth(req, _res, next) {
  const h = req.get('authorization') || ''
  try {
    const { sub } = jwt.verify(h.replace(/^Bearer /, ''), SECRET())
    const user = db().users.find((u) => u.id === sub)
    if (!user) throw 0
    req.user = user
    next()
  } catch {
    next(httpError(401, 'Sesión no válida'))
  }
}

const hits = new Map()
const limiter = (max, windowMs) => (req, _res, next) => {
  const key = req.ip + req.path
  const now = Date.now()
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs)
  arr.push(now)
  hits.set(key, arr)
  if (arr.length > max) return next(httpError(429, 'Demasiados intentos, espera un momento'))
  next()
}

// ---------- API: auth ----------
const api = express.Router()
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

api.post('/auth/register', limiter(10, 60_000), wrap(async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name?.trim() || !emailRe.test(email || '') || (password || '').length < 8) throw httpError(400, 'Revisa nombre, email y contraseña (mín. 8 caracteres)')
  if (db().users.some((u) => u.email === email.toLowerCase())) throw httpError(409, 'Ya existe una cuenta con ese email')
  const user = { id: uid('u_'), name: name.trim().slice(0, 80), email: email.toLowerCase(), hash: await bcrypt.hash(password, 10), phone: '', address: {}, wishlist: [], createdAt: new Date().toISOString() }
  db().users.push(user)
  save()
  res.status(201).json({ token: sign(user), user: publicUser(user) })
}))

api.post('/auth/login', limiter(10, 60_000), wrap(async (req, res) => {
  const { email, password } = req.body || {}
  const user = db().users.find((u) => u.email === String(email || '').toLowerCase())
  if (!user || !(await bcrypt.compare(password || '', user.hash))) throw httpError(401, 'Email o contraseña incorrectos')
  res.json({ token: sign(user), user: publicUser(user) })
}))

api.get('/auth/me', auth, (req, res) => res.json({ user: publicUser(req.user) }))

api.put('/auth/me', auth, wrap(async (req, res) => {
  const { name, phone, address, password, currentPassword } = req.body || {}
  const u = req.user
  if (name !== undefined) { if (!name.trim()) throw httpError(400, 'Nombre obligatorio'); u.name = name.trim().slice(0, 80) }
  if (phone !== undefined) u.phone = String(phone).slice(0, 30)
  if (address !== undefined) {
    const a = address || {}
    u.address = { line1: str(a.line1), line2: str(a.line2), city: str(a.city), zip: str(a.zip), province: str(a.province), country: str(a.country) || 'España' }
  }
  if (password) {
    if (password.length < 8) throw httpError(400, 'La contraseña debe tener 8+ caracteres')
    if (!(await bcrypt.compare(currentPassword || '', u.hash))) throw httpError(400, 'Contraseña actual incorrecta')
    u.hash = await bcrypt.hash(password, 10)
  }
  save()
  res.json({ user: publicUser(u) })
}))
const str = (s) => String(s ?? '').trim().slice(0, 120)

api.put('/wishlist', auth, (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter((i) => products.some((p) => p.id === i)) : []
  req.user.wishlist = [...new Set(ids)]
  save()
  res.json({ wishlist: req.user.wishlist })
})

// ---------- API: catálogo ----------
api.get('/products', (req, res) => {
  const { q, category, min, max, sort, style, onSale } = req.query
  let list = products.map(stripSupplier)
  if (q) { const t = String(q).toLowerCase(); list = list.filter((p) => (p.name + p.short + p.category + p.style).toLowerCase().includes(t)) }
  if (category) list = list.filter((p) => String(category).split(',').includes(p.category))
  if (style) list = list.filter((p) => String(style).split(',').includes(p.style))
  if (min) list = list.filter((p) => p.price >= +min)
  if (max) list = list.filter((p) => p.price <= +max)
  if (onSale === '1') list = list.filter((p) => p.compareAt)
  const sorters = { 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, popular: (a, b) => b.reviews - a.reviews, discount: (a, b) => b.compareAt / b.price - a.compareAt / a.price }
  if (sorters[sort]) list.sort(sorters[sort])
  res.json({ products: list, total: list.length })
})
api.get('/products/:slug', (req, res) => {
  const p = products.find((x) => x.slug === req.params.slug)
  if (!p) throw httpError(404, 'Reloj no encontrado')
  const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.style === p.style)).slice(0, 4).map(stripSupplier)
  res.json({ product: stripSupplier(p), related })
})
api.get('/meta', (_req, res) => res.json({ categories, freeShippingFrom: FREE_SHIPPING_FROM, shippingCost: SHIPPING_COST, coupons: Object.entries(COUPONS).map(([code, c]) => ({ code, label: c.label })), steps: STEPS }))
const stripSupplier = ({ supplier, ...p }) => ({ ...p, leadDays: supplier.leadDays })

api.post('/cart/price', (req, res) => {
  const r = priceCart(req.body?.items, req.body?.coupon)
  res.json({ subtotal: r.subtotal, discount: r.discount, shipping: r.shipping, total: r.total, coupon: r.coupon })
})

// ---------- API: pedidos (dropshipping) ----------
api.post('/orders', auth, limiter(20, 60_000), (req, res) => {
  const { items, coupon, shipping, payment, attribution } = req.body || {}
  const s = shipping || {}
  for (const f of ['name', 'line1', 'city', 'zip', 'country']) if (!str(s[f])) throw httpError(400, 'Completa la dirección de envío')
  const method = payment?.method === 'transfer' ? 'transfer' : 'card'
  if (method === 'card') {
    const digits = String(payment?.number || '').replace(/\s/g, '')
    if (!/^\d{13,19}$/.test(digits) || !luhn(digits)) throw httpError(400, 'Número de tarjeta no válido')
  }
  const priced = priceCart(items, coupon)
  const order = {
    id: 'CH-' + crypto.randomInt(100000, 999999),
    userId: req.user.id,
    createdAt: new Date().toISOString(),
    items: priced.lines.map(({ supplier, colors, ...l }) => ({ ...l, colors })),
    // Datos internos de dropshipping: a qué proveedor se reenvía cada línea.
    fulfillment: priced.lines.map((l) => ({ productId: l.productId, supplier: l.supplier.name, supplierSku: l.supplier.sku })),
    shipping: { name: str(s.name), line1: str(s.line1), line2: str(s.line2), city: str(s.city), zip: str(s.zip), province: str(s.province), country: str(s.country), phone: str(s.phone) },
    payment: { method, last4: method === 'card' ? String(payment.number).replace(/\s/g, '').slice(-4) : null },
    totals: { subtotal: priced.subtotal, discount: priced.discount, shipping: priced.shipping, total: priced.total },
    coupon: priced.coupon,
    tracking: { carrier: 'DHL eCommerce', code: 'JD' + crypto.randomInt(1e9, 9e9) + 'CN' },
    attribution: attribution && typeof attribution === 'object' ? Object.fromEntries(Object.entries(attribution).slice(0, 8).map(([k, v]) => [k.slice(0, 30), String(v).slice(0, 100)])) : null
  }
  for (const l of priced.lines) products.find((p) => p.id === l.productId).stock -= l.qty
  db().orders.push(order)
  save()
  res.status(201).json({ order: publicOrder(order) })
})
const luhn = (n) => { let s = 0; n.split('').reverse().forEach((d, i) => { let x = +d; if (i % 2) { x *= 2; if (x > 9) x -= 9 } s += x }); return s % 10 === 0 }

const publicOrder = (o) => { const { fulfillment, userId, attribution, ...rest } = decorate(o); return rest }
api.get('/orders', auth, (req, res) => res.json({ orders: db().orders.filter((o) => o.userId === req.user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(publicOrder) }))
api.get('/orders/:id', auth, (req, res) => {
  const o = db().orders.find((x) => x.id === req.params.id && x.userId === req.user.id)
  if (!o) throw httpError(404, 'Pedido no encontrado')
  res.json({ order: publicOrder(o) })
})
api.post('/orders/:id/cancel', auth, (req, res) => {
  const o = db().orders.find((x) => x.id === req.params.id && x.userId === req.user.id)
  if (!o) throw httpError(404, 'Pedido no encontrado')
  const d = decorate(o)
  if (d.status === 'cancelled') throw httpError(409, 'El pedido ya está cancelado')
  if (['shipped', 'transit', 'delivered'].includes(d.status)) throw httpError(409, 'El pedido ya ha salido del almacén. Solicita una devolución al recibirlo.')
  o.cancelledAt = new Date().toISOString()
  for (const l of o.items) { const p = products.find((x) => x.id === l.productId); if (p) p.stock += l.qty }
  save()
  res.json({ order: publicOrder(o) })
})

api.use((_req, _res, next) => next(httpError(404, 'Ruta de API no encontrada')))
app.use('/api', api)

// ---------- SEO ----------
app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemap(baseUrl(req))))
app.get('/robots.txt', (req, res) => res.type('text/plain').send(robots(baseUrl(req))))
app.get('/feed/google-merchant.xml', (req, res) => res.type('application/xml').send(merchantFeed(baseUrl(req))))
app.get('/img/:slug.svg', (req, res) => {
  const slug = req.params.slug
  const p = products.find((x) => x.slug === slug)
  const cache = 'public, max-age=86400'
  if (slug === 'og-cover') {
    const p0 = products[0]
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0e0f13"/><g transform="translate(900 315) scale(.45)">${watchSvgString(p0.colors, p0.style, { id: 'og' }).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g><text x="80" y="300" font-family="Georgia,serif" font-size="96" fill="#e9d27a" letter-spacing="14">CHRONOS</text><text x="84" y="370" font-family="Arial" font-size="34" fill="#cfd3dc">Relojes que cuentan historias</text></svg>`
    return res.set('Cache-Control', cache).type('image/svg+xml').send(svg)
  }
  if (!p) return res.status(404).end()
  const svg = watchSvgString(p.colors, p.style, { id: 'img', size: 600 }).replace('<svg ', '<svg style="background:#15161b" ')
  res.set('Cache-Control', cache).type('image/svg+xml').send(svg)
})

// ---------- Frontend ----------
if (isProd || fs.existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1y', setHeaders: (res, f) => { if (f.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache') } }))
}

app.get('*', (req, res, next) => {
  if (path.extname(req.path)) return next()
  const file = path.join(DIST, 'index.html')
  if (!fs.existsSync(file)) return res.status(503).type('text').send('Ejecuta "npm run build" primero (o usa "npm run dev").')
  const base = baseUrl(req)
  const m = metaFor(req.path.replace(/\/+$/, '') || '/', base)
  const html = fs
    .readFileSync(file, 'utf8')
    .replace(/<title>[\s\S]*?<\/title>/, '')
    .replace('<!--app-head-->', headHtml(m))
    .replace('<!--app-html-->', m.html)
  res.status(m.status || 200).type('html').send(html)
})

app.use((err, _req, res, _next) => {
  const status = err.status || 500
  if (status === 500) console.error(err)
  res.status(status).json({ error: status === 500 ? 'Error interno' : err.message })
})

app.listen(PORT, () => console.log(`CHRONOS escuchando en http://localhost:${PORT}`))

// ---------- seed ----------
function seedDemo() {
  if (db().users.some((u) => u.email === 'demo@chronos.com')) return
  const user = { id: 'u_demo', name: 'Alex Demo', email: 'demo@chronos.com', hash: bcrypt.hashSync('demo1234', 10), phone: '600 123 456', address: { line1: 'Calle Mayor 12, 3ºB', line2: '', city: 'Madrid', zip: '28013', province: 'Madrid', country: 'España' }, wishlist: ['p7'], createdAt: new Date().toISOString() }
  db().users.push(user)
  const mk = (id, ids, hoursAgo) => {
    const lines = priceCart(ids.map((i) => ({ productId: i, qty: 1 })), null)
    db().orders.push({
      id, userId: user.id, createdAt: new Date(Date.now() - hoursAgo * 3600e3 / Number(process.env.DEMO_TIME_SCALE || 60)).toISOString(),
      items: lines.lines.map(({ supplier, ...l }) => l), fulfillment: lines.lines.map((l) => ({ productId: l.productId, supplier: l.supplier.name, supplierSku: l.supplier.sku })),
      shipping: { name: user.name, ...user.address, phone: user.phone }, payment: { method: 'card', last4: '4242' },
      totals: { subtotal: lines.subtotal, discount: 0, shipping: lines.shipping, total: lines.total }, coupon: null,
      tracking: { carrier: 'DHL eCommerce', code: 'JD' + crypto.randomInt(1e9, 9e9) + 'CN' }, attribution: null
    })
  }
  mk('CH-482910', ['p1', 'p9'], 300)
  mk('CH-519034', ['p7'], 60)
  mk('CH-603377', ['p5'], 1)
  save()
}
