import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import router from './router'
import App from './App.vue'
import './assets/main.css'
import { initTracking } from './composables/useTracking'

const app = createApp(App)
app.use(createPinia()).use(router).use(vuetify)
initTracking(router)
app.mount('#app')
