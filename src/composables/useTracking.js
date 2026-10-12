// SEM: dataLayer (GTM/GA4/Google Ads) + captura de UTM/gclid para atribución de pedidos.
const KEY = 'chronos_attr'
window.dataLayer = window.dataLayer || []

export function track(event, data = {}) {
  window.dataLayer.push({ event, ...data })
  if (import.meta.env.DEV) console.debug('[track]', event, data)
}

export const attribution = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null') } catch { return null } }

export function initTracking(router) {
  const q = new URLSearchParams(location.search)
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'msclkid']
  const found = Object.fromEntries(keys.filter((k) => q.get(k)).map((k) => [k, q.get(k)]))
  if (Object.keys(found).length) { try { sessionStorage.setItem(KEY, JSON.stringify(found)) } catch {} }

  const gtm = import.meta.env.VITE_GTM_ID
  if (gtm) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' })
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}`
    document.head.appendChild(s)
  }
  router.afterEach((to) => track('page_view', { page_path: to.fullPath, page_title: document.title }))
}
