import { defineStore } from 'pinia'
import { api, setToken, getToken } from '@/api'

export const useAuth = defineStore('auth', {
  state: () => ({ user: null, ready: false }),
  getters: { loggedIn: (s) => !!s.user, initials: (s) => (s.user?.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() },
  actions: {
    async init() {
      if (getToken()) {
        try { this.user = (await api.get('/auth/me')).user } catch { setToken(null) }
      }
      this.ready = true
    },
    async login(email, password) { const r = await api.post('/auth/login', { email, password }); setToken(r.token); this.user = r.user },
    async register(name, email, password) { const r = await api.post('/auth/register', { name, email, password }); setToken(r.token); this.user = r.user },
    logout() { setToken(null); this.user = null },
    async updateProfile(patch) { this.user = (await api.put('/auth/me', patch)).user }
  }
})
