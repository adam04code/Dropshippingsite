import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import { es } from 'vuetify/locale'

const dark = {
  dark: true,
  colors: { background: '#0e0f13', surface: '#16171c', 'surface-variant': '#1f2128', primary: '#e9d27a', secondary: '#7aa7ff', accent: '#ff7a1a', error: '#ff5c6c', success: '#4cd68b', warning: '#ffb84d', info: '#6cc4ff', 'on-primary': '#1b1606' }
}
const light = {
  dark: false,
  colors: { background: '#f5f1ea', surface: '#ffffff', 'surface-variant': '#ece6db', primary: '#7a5c14', secondary: '#1d4ed8', accent: '#c2410c', error: '#b3261e', success: '#1b7a45', warning: '#a15c00', info: '#0b69a3', 'on-primary': '#ffffff' }
}

export default createVuetify({
  locale: { locale: 'es', messages: { es } },
  theme: { defaultTheme: localStorage.getItem('theme') || 'dark', themes: { dark, light } },
  defaults: {
    VBtn: { rounded: 'lg', style: 'text-transform:none;letter-spacing:.01em;font-weight:600' },
    VCard: { rounded: 'xl', elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VSelect: { variant: 'outlined', density: 'comfortable', color: 'primary' },
    VTextarea: { variant: 'outlined', color: 'primary' },
    VChip: { rounded: 'lg' }
  }
})
