// Actualiza <head> en navegación cliente (el servidor ya inyecta lo mismo para rastreadores).
import { watchEffect, onBeforeUnmount, toValue } from 'vue'

function setMeta(sel, attr, key, value) {
  let el = document.head.querySelector(sel)
  if (!el) { el = document.createElement(sel.startsWith('link') ? 'link' : 'meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute(sel.startsWith('link') ? 'href' : 'content', value)
}

export function useSeo(getter) {
  const apply = () => {
    const m = toValue(getter) || {}
    const title = m.title ? `${m.title} · CHRONOS` : 'CHRONOS · Relojes automáticos, de buceo y cronógrafos'
    document.title = title
    const desc = m.description || 'Relojes de diseño con cristal de zafiro desde 89 €. Envío gratis desde 100 €.'
    setMeta('meta[name="description"]', 'name', 'description', desc)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc)
    setMeta('meta[name="robots"]', 'name', 'robots', m.noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large')
    setMeta('link[rel="canonical"]', 'rel', 'canonical', location.origin + (m.path ?? location.pathname))
    if (m.image) setMeta('meta[property="og:image"]', 'property', 'og:image', location.origin + m.image)
    document.head.querySelectorAll('script[data-seo]').forEach((n) => n.remove())
    // Sustituye el JSON-LD del servidor cuando la vista aporta el suyo
    if (m.jsonld?.length) {
      document.head.querySelectorAll('script[type="application/ld+json"]:not([data-seo])').forEach((n) => n.remove())
      for (const j of m.jsonld) {
        const s = document.createElement('script')
        s.type = 'application/ld+json'
        s.dataset.seo = '1'
        s.textContent = JSON.stringify(j)
        document.head.appendChild(s)
      }
    }
  }
  watchEffect(apply)
  onBeforeUnmount(() => document.head.querySelectorAll('script[data-seo]').forEach((n) => n.remove()))
}
