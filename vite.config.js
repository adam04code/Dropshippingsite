import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)), '@shared': fileURLToPath(new URL('./shared', import.meta.url)) } },
  server: { port: 5173, proxy: { '/api': 'http://localhost:3000', '/img': 'http://localhost:3000', '/sitemap.xml': 'http://localhost:3000', '/robots.txt': 'http://localhost:3000', '/feed': 'http://localhost:3000' } },
  build: { chunkSizeWarningLimit: 900, rollupOptions: { output: { manualChunks: { vuetify: ['vuetify'], vue: ['vue', 'vue-router', 'pinia'] } } } }
})
