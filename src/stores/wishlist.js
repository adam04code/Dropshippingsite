import { defineStore } from 'pinia'
import { api } from '@/api'
import { useAuth } from './auth'

export const useWishlist = defineStore('wishlist', {
  state: () => ({ ids: JSON.parse(localStorage.getItem('wishlist') || '[]') }),
  actions: {
    has(id) { return this.ids.includes(id) },
    async toggle(id) {
      this.ids = this.has(id) ? this.ids.filter((x) => x !== id) : [...this.ids, id]
      try { localStorage.setItem('wishlist', JSON.stringify(this.ids)) } catch {}
      const auth = useAuth()
      if (auth.loggedIn) { try { await api.put('/wishlist', { ids: this.ids }) } catch {} }
      return this.has(id)
    },
    // Al iniciar sesión: fusiona favoritos locales con los del servidor
    async sync() {
      const auth = useAuth()
      if (!auth.loggedIn) return
      this.ids = [...new Set([...(auth.user.wishlist || []), ...this.ids])]
      try { localStorage.setItem('wishlist', JSON.stringify(this.ids)); await api.put('/wishlist', { ids: this.ids }) } catch {}
    }
  }
})
