import { defineStore } from 'pinia'
import { api } from '@/api'

export const useCatalog = defineStore('catalog', {
  state: () => ({ products: [], categories: [], meta: null, loaded: false, recent: JSON.parse(localStorage.getItem('recent') || '[]'), compare: [] }),
  getters: {
    bySlug: (s) => (slug) => s.products.find((p) => p.slug === slug),
    byId: (s) => (id) => s.products.find((p) => p.id === id),
    category: (s) => (slug) => s.categories.find((c) => c.slug === slug)
  },
  actions: {
    async load() {
      if (this.loaded) return
      const [p, m] = await Promise.all([api.get('/products'), api.get('/meta')])
      this.products = p.products
      this.categories = m.categories
      this.meta = m
      this.loaded = true
    },
    pushRecent(id) {
      this.recent = [id, ...this.recent.filter((x) => x !== id)].slice(0, 6)
      try { localStorage.setItem('recent', JSON.stringify(this.recent)) } catch {}
    },
    toggleCompare(id) {
      if (this.compare.includes(id)) this.compare = this.compare.filter((x) => x !== id)
      else if (this.compare.length < 3) this.compare.push(id)
      else return false
      return true
    }
  }
})
