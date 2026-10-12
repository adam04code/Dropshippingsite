import { defineStore } from 'pinia'
import { useTheme } from 'vuetify'

export const useUi = defineStore('ui', {
  state: () => ({ cartOpen: false, searchOpen: false, compareOpen: false, toast: { show: false, text: '', color: 'success' } }),
  actions: {
    notify(text, color = 'success') { this.toast = { show: true, text, color } },
    toggleTheme(theme) {
      const next = theme.global.name.value === 'dark' ? 'light' : 'dark'
      theme.global.name.value = next
      try { localStorage.setItem('theme', next) } catch {}
    }
  }
})
export { useTheme }
