// SEO / SEM en servidor: metadatos, JSON-LD, HTML semántico para rastreadores,
// sitemap, robots y feed de Google Merchant Center (Shopping Ads).
import { products, categories } from './data/products.js'
import { faq } from '../shared/faq.js'

export const BRAND = 'CHRONOS'
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const money = (n) => n.toFixed(2)

export function productImagePath(p) {
  return `/img/${p.slug}.svg`
}

function jsonLdProduct(p, base) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    sku: p.supplier.sku,
    description: p.description,
    image: [base + productImagePath(p)],
    brand: { '@type': 'Brand', name: BRAND },
    category: 'Relojes de pulsera',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: {
      '@type': 'Offer',
      url: `${base}/relojes/${p.slug}`,
      priceCurrency: 'EUR',
      price: money(p.price),
      priceValidUntil: new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10),
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: p.price >= 100 ? '0' : '4.95', currency: 'EUR' },
        deliveryTime: { '@type': 'ShippingDeliveryTime', transitTime: { '@type': 'QuantitativeValue', minValue: 5, maxValue: 9, unitCode: 'DAY' } }
      },
      hasMerchantReturnPolicy: { '@type': 'MerchantReturnPolicy', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 30 }
    }
  }
}

const org = (base) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: BRAND,
  url: base,
  logo: base + '/favicon.svg',
  sameAs: []
})
const website = (base) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: BRAND,
  url: base,
  potentialAction: { '@type': 'SearchAction', target: `${base}/relojes?q={search_term_string}`, 'query-input': 'required name=search_term_string' }
})
const breadcrumb = (base, trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: base + path }))
})

// Devuelve { title, description, canonical, image, noindex, jsonld[], html } para una ruta.
export function metaFor(pathname, base) {
  const m = {
    title: `${BRAND} · Relojes automáticos, de buceo y cronógrafos con envío gratis`,
    description: 'Relojes de diseño con cristal de zafiro y movimiento automático desde 89 €. Envío gratis desde 100 €, 30 días de devolución y garantía de 2 años.',
    canonical: base + (pathname === '/' ? '' : pathname),
    image: base + '/img/og-cover.svg',
    noindex: false,
    jsonld: [],
    html: ''
  }
  const listHtml = (list) => `<ul>${list.map((p) => `<li><a href="/relojes/${p.slug}">${esc(p.name)}</a> — ${esc(p.short)} <strong>${money(p.price)} €</strong></li>`).join('')}</ul>`

  if (pathname === '/') {
    m.jsonld.push(org(base), website(base), { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) })
    m.html = `<h1>Relojes que cuentan historias</h1><p>${esc(m.description)}</p>${listHtml(products.slice(0, 8))}`
  } else if (pathname === '/relojes') {
    m.title = `Todos los relojes · ${BRAND}`
    m.description = 'Explora nuestra colección completa: automáticos, buceo, cronógrafos, clásicos y esqueleto. Filtra por precio, estilo y más.'
    m.jsonld.push(breadcrumb(base, [['Inicio', '/'], ['Relojes', '/relojes']]))
    m.html = `<h1>Todos los relojes</h1>${listHtml(products)}`
  } else if (pathname === '/ofertas') {
    m.title = `Ofertas en relojes hasta -30% · ${BRAND}`
    m.description = 'Los mejores descuentos en relojes automáticos y de cuarzo. Stock limitado, envío gratis desde 100 €.'
    m.jsonld.push(breadcrumb(base, [['Inicio', '/'], ['Ofertas', '/ofertas']]))
    m.html = `<h1>Ofertas en relojes</h1>${listHtml(products.filter((p) => p.compareAt))}`
  } else if (pathname.startsWith('/relojes/')) {
    const p = products.find((x) => x.slug === pathname.slice(9))
    if (p) {
      const cat = categories.find((c) => c.slug === p.category)
      m.title = `${p.name} · ${cat.name} desde ${money(p.price)} € | ${BRAND}`
      m.description = `${p.short} ${p.specs['Resistencia al agua'] ? 'Resistencia al agua ' + p.specs['Resistencia al agua'] + '. ' : ''}Envío gratis y 30 días de devolución.`.slice(0, 300)
      m.image = base + productImagePath(p)
      m.og = 'product'
      m.jsonld.push(jsonLdProduct(p, base), breadcrumb(base, [['Inicio', '/'], ['Relojes', '/relojes'], [cat.name, `/categoria/${cat.slug}`], [p.name, `/relojes/${p.slug}`]]))
      m.html = `<h1>${esc(p.name)}</h1><p>${esc(p.description)}</p><p>Precio: ${money(p.price)} €</p><table>${Object.entries(p.specs).map(([k, v]) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`).join('')}</table>`
    } else m.status = 404
  } else if (pathname.startsWith('/categoria/')) {
    const c = categories.find((x) => x.slug === pathname.slice(11))
    if (c) {
      const list = products.filter((p) => p.category === c.slug)
      m.title = `Relojes ${c.name} · ${BRAND}`
      m.description = `${c.blurb} Descubre ${list.length} modelos de relojes ${c.name.toLowerCase()} con envío gratis.`
      m.jsonld.push(breadcrumb(base, [['Inicio', '/'], ['Relojes', '/relojes'], [c.name, `/categoria/${c.slug}`]]))
      m.html = `<h1>Relojes ${esc(c.name)}</h1><p>${esc(c.blurb)}</p>${listHtml(list)}`
    } else m.status = 404
  } else if (/^\/(cuenta|checkout|carrito|login|registro)/.test(pathname)) {
    m.title = `${BRAND} · Tu cuenta`
    m.noindex = true
  } else if (pathname === '/envios' || pathname === '/garantia') {
    m.title = pathname === '/envios' ? `Envíos y devoluciones · ${BRAND}` : `Garantía de 2 años · ${BRAND}`
    m.description = 'Envío gratis desde 100 € en 5-9 días laborables, 30 días de devolución sin preguntas y 2 años de garantía.'
  } else {
    m.status = 404
    m.noindex = true
    m.title = `Página no encontrada · ${BRAND}`
  }
  return m
}

export function headHtml(m) {
  const tags = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<link rel="canonical" href="${esc(m.canonical)}">`,
    `<meta name="robots" content="${m.noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large'}">`,
    `<meta property="og:type" content="${m.og === 'product' ? 'product' : 'website'}">`,
    `<meta property="og:site_name" content="${BRAND}">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    `<meta property="og:url" content="${esc(m.canonical)}">`,
    `<meta property="og:image" content="${esc(m.image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.description)}">`,
    `<meta name="twitter:image" content="${esc(m.image)}">`,
    ...m.jsonld.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`)
  ]
  return tags.join('\n    ')
}

export function sitemap(base) {
  const urls = [
    ['/', 1.0], ['/relojes', 0.9], ['/ofertas', 0.8], ['/envios', 0.3], ['/garantia', 0.3],
    ...categories.map((c) => [`/categoria/${c.slug}`, 0.8]),
    ...products.map((p) => [`/relojes/${p.slug}`, 0.7])
  ]
  const today = new Date().toISOString().slice(0, 10)
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls
    .map(([u, pr]) => {
      const p = u.startsWith('/relojes/') && products.find((x) => x.slug === u.slice(9))
      return `  <url><loc>${base}${u === '/' ? '' : u}</loc><lastmod>${today}</lastmod><priority>${pr}</priority>${p ? `<image:image><image:loc>${base}${productImagePath(p)}</image:loc><image:title>${esc(p.name)}</image:title></image:image>` : ''}</url>`
    })
    .join('\n')}\n</urlset>`
}

export function robots(base) {
  return `User-agent: *\nAllow: /\nDisallow: /cuenta\nDisallow: /checkout\nDisallow: /carrito\nDisallow: /api/\n\nSitemap: ${base}/sitemap.xml\n`
}

// Feed RSS 2.0 con namespace g: para Google Merchant Center (campañas Shopping / Performance Max).
export function merchantFeed(base) {
  const items = products
    .map((p) => {
      const cat = categories.find((c) => c.slug === p.category)
      return `    <item>
      <g:id>${esc(p.supplier.sku)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(p.description)}</g:description>
      <g:link>${base}/relojes/${p.slug}</g:link>
      <g:image_link>${base}/img/${p.slug}.svg</g:image_link>
      <g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${money(p.compareAt || p.price)} EUR</g:price>
      ${p.compareAt ? `<g:sale_price>${money(p.price)} EUR</g:sale_price>` : ''}
      <g:brand>${BRAND}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>201</g:google_product_category>
      <g:product_type>Relojes &gt; ${esc(cat.name)}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping><g:country>ES</g:country><g:service>Estándar</g:service><g:price>${p.price >= 100 ? '0.00' : '4.95'} EUR</g:price></g:shipping>
    </item>`
    })
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>${BRAND}</title>\n    <link>${base}</link>\n    <description>Catálogo de relojes ${BRAND}</description>\n${items}\n  </channel>\n</rss>`
}
