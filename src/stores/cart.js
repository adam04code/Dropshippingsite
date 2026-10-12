import { defineStore } from 'pinia'
import { api } from '@/api'
import { useCatalog } from './catalog'
import { track } from '@/composables/useTracking'

const read = () => { try { return JSON.parse(localStorage.getItem('cart') || '{}') } catch { return {} } }

export const useCart = defineStore('cart', {
  state: () => ({ items: read().items || [], coupon: read().coupon || '', quote: null, quoteError: '' }),
  getters: {
    count: (s) => s.items.reduce((n, i) => n + i.qty, 0),
    lines() {
      const cat = useCatalog()
      return this.items.map((i) => ({ ...i, product: cat.byId(i.productId) })).filter((l) => l.product)
    },
    subtotal() { return this.lines.reduce((s, l) => s + l.product.price * l.qty, 0) },
    savings() { return this.lines.reduce((s, l) => s + ((l.product.compareAt || l.product.price) - l.product.price) * l.qty, 0) }
  },
  actions: {
    persist() { try { localStorage.setItem('cart', JSON.stringify({ items: this.items, coupon: this.coupon })) } catch {} },
    add(product, qty = 1) {
      const line = this.items.find((i) => i.productId === product.id)
      if (line) line.qty = Math.min(10, product.stock, line.qty + qty)
      else this.items.push({ productId: product.id, qty })
      track('add_to_cart', { currency: 'EUR', value: product.price * qty, items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }] })
      this.persist(); this.refresh()
    },
    setQty(id, qty) {
      const l = this.items.find((i) => i.productId === id)
      if (l) l.qty = Math.max(1, Math.min(10, qty))
      this.persist(); this.refresh()
    },
    remove(id) { this.items = this.items.filter((i) => i.productId !== id); this.persist(); this.refresh() },
    clear() { this.items = []; this.coupon = ''; this.quote = null; this.persist() },
    async applyCoupon(code) { this.coupon = code; this.persist(); await this.refresh(true) },
    async refresh(throwErr = false) {
      if (!this.items.length) { this.quote = null; return }
      try {
        this.quote = await api.post('/cart/price', { items: this.items, coupon: this.coupon || undefined })
        this.quoteError = ''
      } catch (e) {
        this.quoteError = e.message
        if (this.coupon) { this.coupon = ''; this.persist(); if (!throwErr) return this.refresh() }
        if (throwErr) throw e
      }
    }
  }
})
