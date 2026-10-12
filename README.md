# CHRONOS · Tienda de relojes (dropshipping)

Tienda completa con **Vue 3 + Vuetify 3 + Pinia + Vue Router** y servidor **Node/Express**.

## Arranque

```bash
npm install
npm run serve        # build + servidor en http://localhost:3000
# desarrollo con HMR:
npm run dev          # Vite en :5173 (proxy a la API en :3000)
```

Cuenta demo: `demo@chronos.com` / `demo1234` (ya trae 3 pedidos en distintos estados).
Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC. **Los pagos son simulados.**
Cupones: `TIEMPO10` (-10 %), `CHRONOS20` (-20 % > 200 €), `BIENVENIDO` (-15 € > 80 €).

Variables de entorno: `PORT`, `SITE_URL` (URL pública para canonical/sitemap/feed), `JWT_SECRET`,
`DB_FILE`, `DEMO_TIME_SCALE` (por defecto `60`: 1 h de seguimiento = 1 min; usa `1` para tiempo real),
`VITE_GTM_ID` (en build, activa Google Tag Manager).

## Lo destacado

- **Vitrina 3D** (`WallShowcase.vue`): caja de madera con cristal que emerge de la pared (CSS 3D real), sigue al ratón, la tapa se abre al hacer clic y el reloj flota dentro. Relojes SVG procedurales con hora real y segundero continuo, modo noche con luminiscencia.
- **Vuetify a fondo**: tema oscuro/claro, paleta de comandos `Ctrl+K`, comparador (bottom-sheet), filtros (range-slider, chip-groups), carrito en drawer con barra de envío gratis, stepper de checkout con validación (Luhn), `v-data-table` con filas expandibles, `v-timeline` de seguimiento, carrusel, expansion panels…
- **Panel de usuario**: resumen, pedidos (búsqueda/filtros), seguimiento en vivo, cancelación, favoritos, perfil, direcciones y contraseña.
- **Dropshipping**: cada línea de pedido guarda proveedor y SKU (`fulfillment`, no expuesto al cliente) y la línea de tiempo simula pago → proveedor → preparado → transportista → tránsito → entregado.

## SEO

El servidor inyecta por ruta `<title>`, description, canonical, Open Graph/Twitter, **JSON-LD** (Organization, WebSite+SearchAction, Product+Offer+Reviews, BreadcrumbList, FAQPage) y HTML semántico en `#app` para rastreadores; devuelve **404 reales**; `noindex` en cuenta/checkout. Además `/sitemap.xml` (con imágenes), `/robots.txt`, compresión, caché larga de assets, skip-link y landmarks accesibles.

## SEM

- `/feed/google-merchant.xml`: feed para Google Merchant Center (Shopping / Performance Max).
- `dataLayer` con eventos GA4 de ecommerce (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`…) y carga opcional de GTM.
- Captura de `utm_*`, `gclid`, `msclkid` y se guarda en cada pedido para atribución.
- Landing `/ofertas` con cuenta atrás, y páginas de categoría indexables para campañas por grupo de anuncios.

## Pendiente para producción

Persistencia en JSON → PostgreSQL/Mongo; pasarela real (Stripe) y webhooks; integración con la API del proveedor para reenviar pedidos y traer stock/tracking real; imágenes JPG/WebP reales (Merchant Center no admite SVG); emails transaccionales; SSR/prerender completo si se quiere indexar contenido dinámico más allá de lo inyectado.
