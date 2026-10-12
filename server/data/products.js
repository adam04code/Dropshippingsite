// Catálogo. En un dropshipping real esto vendría de la API/feed del proveedor.
// `colors` alimenta el renderizador SVG del reloj (src/components/WatchSvg.vue).
export const categories = [
  { slug: 'automaticos', name: 'Automáticos', icon: 'mdi-cog-sync', blurb: 'Movimiento mecánico de cuerda automática. Cero pilas, todo alma.' },
  { slug: 'buceo', name: 'Buceo', icon: 'mdi-diving-scuba', blurb: 'Resistentes al agua hasta 300 m con bisel unidireccional.' },
  { slug: 'cronografos', name: 'Cronógrafos', icon: 'mdi-timer-outline', blurb: 'Precisión al segundo con subesferas y tachymeter.' },
  { slug: 'clasicos', name: 'Clásicos', icon: 'mdi-crown-outline', blurb: 'Elegancia atemporal para cualquier ocasión.' },
  { slug: 'esqueleto', name: 'Esqueleto', icon: 'mdi-skull-outline', blurb: 'Ve latir el corazón mecánico a través de la esfera.' }
]

export const products = [
  {
    id: 'p1', slug: 'chronos-abyss-300-azul', name: 'Abyss 300 Azul Profundo', category: 'buceo', style: 'diver',
    price: 189.9, compareAt: 249.9, rating: 4.8, reviews: 312, stock: 24, badge: 'Más vendido',
    short: 'Reloj de buceo automático 300 m con bisel cerámico azul.',
    description: 'El Abyss 300 está pensado para quienes no le temen al agua. Caja de acero 316L de 42 mm, bisel unidireccional de 120 clics con inserto cerámico, cristal de zafiro y corona de rosca. Su esfera azul degradada cambia de tono según la luz y la luminiscencia dura toda la noche.',
    specs: { 'Movimiento': 'Automático NH35 (24 rubíes)', 'Caja': 'Acero inoxidable 316L · 42 mm', 'Cristal': 'Zafiro con antirreflejo', 'Resistencia al agua': '300 m / 30 ATM', 'Correa': 'Acero tipo Oyster, 20 mm', 'Reserva de marcha': '41 horas' },
    colors: { case: '#c9ced6', caseDark: '#7d848f', dial: '#0b3a78', dialDark: '#041d44', hands: '#e8edf5', accent: '#f5d142', bezel: '#0a2a5c', strap: '#aeb5c0', strapStyle: 'metal' },
    supplier: { name: 'Shenzhen TimeWorks', sku: 'STW-AB300B', leadDays: 3 }
  },
  {
    id: 'p2', slug: 'chronos-abyss-300-negro', name: 'Abyss 300 Negro Obsidiana', category: 'buceo', style: 'diver',
    price: 179.9, compareAt: 229.9, rating: 4.7, reviews: 198, stock: 31, badge: null,
    short: 'Buceador automático negro mate con acentos naranjas.',
    description: 'La versión más discreta y deportiva del Abyss. Esfera negra mate, manecillas naranjas de alto contraste y correa de caucho FKM que no se agrieta con el agua salada.',
    specs: { 'Movimiento': 'Automático NH35', 'Caja': 'Acero PVD negro · 42 mm', 'Cristal': 'Zafiro', 'Resistencia al agua': '300 m', 'Correa': 'Caucho FKM, 22 mm', 'Reserva de marcha': '41 horas' },
    colors: { case: '#3a3d44', caseDark: '#16181c', dial: '#101114', dialDark: '#050506', hands: '#f2f2f2', accent: '#ff7a1a', bezel: '#1b1c20', strap: '#1d1d20', strapStyle: 'rubber' },
    supplier: { name: 'Shenzhen TimeWorks', sku: 'STW-AB300N', leadDays: 3 }
  },
  {
    id: 'p3', slug: 'chronos-meridian-automatico-plata', name: 'Meridian Automático Plata', category: 'clasicos', style: 'classic',
    price: 149.9, compareAt: 199.9, rating: 4.6, reviews: 245, stock: 18, badge: 'Oferta',
    short: 'Clásico de tres agujas con esfera guilloché plateada.',
    description: 'Un reloj de vestir que se siente heredado. Esfera plateada con textura guilloché, índices aplicados, fecha a las 3 y correa de piel de becerro cosida a mano. Fondo de cristal para admirar el movimiento.',
    specs: { 'Movimiento': 'Automático Miyota 8215', 'Caja': 'Acero 316L · 40 mm', 'Cristal': 'Mineral reforzado', 'Resistencia al agua': '50 m', 'Correa': 'Piel de becerro, 20 mm', 'Reserva de marcha': '42 horas' },
    colors: { case: '#d8dce2', caseDark: '#8a909b', dial: '#e9e6df', dialDark: '#c9c5ba', hands: '#1a2230', accent: '#b8412f', bezel: '#d8dce2', strap: '#5a3a24', strapStyle: 'leather' },
    supplier: { name: 'Guangzhou Horology', sku: 'GZH-MER-S', leadDays: 4 }
  },
  {
    id: 'p4', slug: 'chronos-meridian-oro-rosa', name: 'Meridian Oro Rosa', category: 'clasicos', style: 'classic',
    price: 169.9, compareAt: 219.9, rating: 4.5, reviews: 121, stock: 12, badge: null,
    short: 'Elegancia cálida: caja oro rosa y esfera champán.',
    description: 'El Meridian en acabado oro rosa PVD. Esfera champán con sol brillante, manecillas tipo hoja y correa de cocodrilo-grain azul noche.',
    specs: { 'Movimiento': 'Automático Miyota 8215', 'Caja': 'Acero PVD oro rosa · 40 mm', 'Cristal': 'Mineral reforzado', 'Resistencia al agua': '50 m', 'Correa': 'Piel grain, 20 mm', 'Reserva de marcha': '42 horas' },
    colors: { case: '#e3b49a', caseDark: '#a8704f', dial: '#efe0cc', dialDark: '#d3bd9d', hands: '#6b4330', accent: '#a8704f', bezel: '#e3b49a', strap: '#1c2742', strapStyle: 'leather' },
    supplier: { name: 'Guangzhou Horology', sku: 'GZH-MER-R', leadDays: 4 }
  },
  {
    id: 'p5', slug: 'chronos-velocity-cronografo-rojo', name: 'Velocity Cronógrafo Rojo', category: 'cronografos', style: 'chrono',
    price: 129.9, compareAt: 169.9, rating: 4.4, reviews: 176, stock: 40, badge: 'Nuevo',
    short: 'Cronógrafo de cuarzo con tachymeter y subesferas.',
    description: 'Inspirado en los tableros de carreras de los 60. Tres subesferas, tachymeter grabado en bisel y pulsadores con rosca. Cuarzo Seiko VK63 con arranque mecánico instantáneo.',
    specs: { 'Movimiento': 'Cuarzo mecánico Seiko VK63', 'Caja': 'Acero 316L · 43 mm', 'Cristal': 'Zafiro', 'Resistencia al agua': '100 m', 'Correa': 'Piel perforada, 22 mm', 'Funciones': 'Cronógrafo, fecha, 24 h' },
    colors: { case: '#c9ced6', caseDark: '#6f7580', dial: '#17181c', dialDark: '#08080a', hands: '#f4f4f4', accent: '#e11d2e', bezel: '#202126', strap: '#2a1a14', strapStyle: 'leather' },
    supplier: { name: 'Dongguan Precision', sku: 'DGP-VEL-R', leadDays: 5 }
  },
  {
    id: 'p6', slug: 'chronos-velocity-cronografo-verde', name: 'Velocity Cronógrafo Verde Bosque', category: 'cronografos', style: 'chrono',
    price: 134.9, compareAt: 174.9, rating: 4.6, reviews: 88, stock: 22, badge: null,
    short: 'Esfera verde sunburst y acabado cepillado.',
    description: 'El verde bosque es el nuevo azul. Mismo corazón cronográfico que el Velocity original, con esfera verde sunburst y acentos dorados.',
    specs: { 'Movimiento': 'Cuarzo mecánico Seiko VK63', 'Caja': 'Acero 316L · 43 mm', 'Cristal': 'Zafiro', 'Resistencia al agua': '100 m', 'Correa': 'Acero, 22 mm', 'Funciones': 'Cronógrafo, fecha' },
    colors: { case: '#d0d4da', caseDark: '#7c828d', dial: '#14452f', dialDark: '#082a1b', hands: '#f3efe0', accent: '#d9b34a', bezel: '#14452f', strap: '#b4bac4', strapStyle: 'metal' },
    supplier: { name: 'Dongguan Precision', sku: 'DGP-VEL-V', leadDays: 5 }
  },
  {
    id: 'p7', slug: 'chronos-aether-esqueleto-oro', name: 'Aether Esqueleto Oro', category: 'esqueleto', style: 'skeleton',
    price: 219.9, compareAt: 299.9, rating: 4.9, reviews: 143, stock: 9, badge: 'Edición limitada',
    short: 'Movimiento visible, puentes dorados y volante a la vista.',
    description: 'Cada engranaje a la vista. El Aether deja al descubierto el movimiento con puentes calados y rubíes rojos. Una conversación en la muñeca.',
    specs: { 'Movimiento': 'Automático esqueleto Tianjin', 'Caja': 'Acero PVD oro · 41 mm', 'Cristal': 'Zafiro doble cara', 'Resistencia al agua': '30 m', 'Correa': 'Piel marrón, 20 mm', 'Reserva de marcha': '40 horas' },
    colors: { case: '#d9b35c', caseDark: '#8a6a22', dial: '#12131a', dialDark: '#000000', hands: '#f1d58a', accent: '#d9b35c', bezel: '#d9b35c', strap: '#3c2616', strapStyle: 'leather' },
    supplier: { name: 'Tianjin Mechanica', sku: 'TJM-AET-G', leadDays: 6 }
  },
  {
    id: 'p8', slug: 'chronos-aether-esqueleto-acero', name: 'Aether Esqueleto Acero', category: 'esqueleto', style: 'skeleton',
    price: 209.9, compareAt: 279.9, rating: 4.7, reviews: 97, stock: 14, badge: null,
    short: 'Esqueleto en acero pulido con rubíes azules.',
    description: 'Versión plata del Aether. Frío, técnico, hipnótico. Ideal para amantes de la relojería mecánica.',
    specs: { 'Movimiento': 'Automático esqueleto Tianjin', 'Caja': 'Acero 316L · 41 mm', 'Cristal': 'Zafiro doble cara', 'Resistencia al agua': '30 m', 'Correa': 'Piel negra, 20 mm', 'Reserva de marcha': '40 horas' },
    colors: { case: '#dfe3e8', caseDark: '#868c97', dial: '#0d1620', dialDark: '#02060a', hands: '#e6edf5', accent: '#4aa3ff', bezel: '#dfe3e8', strap: '#17171a', strapStyle: 'leather' },
    supplier: { name: 'Tianjin Mechanica', sku: 'TJM-AET-S', leadDays: 6 }
  },
  {
    id: 'p9', slug: 'chronos-nordic-minimal-blanco', name: 'Nordic Minimal Blanco', category: 'clasicos', style: 'minimal',
    price: 89.9, compareAt: 119.9, rating: 4.5, reviews: 402, stock: 60, badge: 'Top ventas',
    short: 'Diseño escandinavo ultrafino de 6 mm.',
    description: 'Menos es más. Esfera blanca sin números, caja ultrafina de 6 mm y malla milanesa que se ajusta sin herramientas. Cuarzo japonés.',
    specs: { 'Movimiento': 'Cuarzo Miyota 2035', 'Caja': 'Acero 316L · 38 mm', 'Cristal': 'Mineral', 'Resistencia al agua': '30 m', 'Correa': 'Malla milanesa, 18 mm', 'Grosor': '6 mm' },
    colors: { case: '#e3e6ea', caseDark: '#979da8', dial: '#f7f6f2', dialDark: '#e0ddd3', hands: '#111318', accent: '#111318', bezel: '#e3e6ea', strap: '#cfd3d9', strapStyle: 'metal' },
    supplier: { name: 'Guangzhou Horology', sku: 'GZH-NOR-W', leadDays: 3 }
  },
  {
    id: 'p10', slug: 'chronos-nordic-minimal-negro', name: 'Nordic Minimal Negro', category: 'clasicos', style: 'minimal',
    price: 89.9, compareAt: 119.9, rating: 4.6, reviews: 356, stock: 55, badge: null,
    short: 'Minimalismo total en negro mate.',
    description: 'El mismo Nordic en negro total. Esfera mate, manecillas finas y correa de malla negra PVD.',
    specs: { 'Movimiento': 'Cuarzo Miyota 2035', 'Caja': 'Acero PVD negro · 38 mm', 'Cristal': 'Mineral', 'Resistencia al agua': '30 m', 'Correa': 'Malla milanesa negra, 18 mm', 'Grosor': '6 mm' },
    colors: { case: '#2b2d33', caseDark: '#111216', dial: '#16171b', dialDark: '#08080a', hands: '#eceef2', accent: '#eceef2', bezel: '#2b2d33', strap: '#222428', strapStyle: 'metal' },
    supplier: { name: 'Guangzhou Horology', sku: 'GZH-NOR-B', leadDays: 3 }
  },
  {
    id: 'p11', slug: 'chronos-tempest-automatico-gmt', name: 'Tempest GMT Dos Husos', category: 'automaticos', style: 'chrono',
    price: 199.9, compareAt: 259.9, rating: 4.8, reviews: 76, stock: 16, badge: 'Nuevo',
    short: 'Automático GMT con bisel bicolor rojo/azul.',
    description: 'Para viajeros. Segundo huso horario con aguja 24 h y bisel bicolor. Movimiento automático fiable y correa Jubilee.',
    specs: { 'Movimiento': 'Automático GMT Seagull', 'Caja': 'Acero 316L · 40 mm', 'Cristal': 'Zafiro', 'Resistencia al agua': '100 m', 'Correa': 'Jubilee, 20 mm', 'Funciones': 'GMT, fecha' },
    colors: { case: '#cdd2d9', caseDark: '#767c87', dial: '#191a1f', dialDark: '#09090b', hands: '#f3f3f3', accent: '#e11d2e', bezel: '#1c3f8a', strap: '#b9bec7', strapStyle: 'metal' },
    supplier: { name: 'Dongguan Precision', sku: 'DGP-TMP-G', leadDays: 5 }
  },
  {
    id: 'p12', slug: 'chronos-lunar-automatico-fase-lunar', name: 'Lunar Fase Lunar Medianoche', category: 'automaticos', style: 'classic',
    price: 229.9, compareAt: 309.9, rating: 4.9, reviews: 64, stock: 7, badge: 'Edición limitada',
    short: 'Complicación de fase lunar sobre esfera azul medianoche.',
    description: 'Una luna sonriente recorre el cielo de la esfera. Fase lunar de alta precisión, aventurina simulada y caja en acero con acabado pulido espejo.',
    specs: { 'Movimiento': 'Automático fase lunar Sea-Gull', 'Caja': 'Acero 316L · 40 mm', 'Cristal': 'Zafiro', 'Resistencia al agua': '50 m', 'Correa': 'Piel azul, 20 mm', 'Funciones': 'Fase lunar, fecha' },
    colors: { case: '#dcdfe5', caseDark: '#868c97', dial: '#0f1c3f', dialDark: '#050b1f', hands: '#e9eefc', accent: '#e9d27a', bezel: '#dcdfe5', strap: '#14214a', strapStyle: 'leather' },
    supplier: { name: 'Tianjin Mechanica', sku: 'TJM-LUN-M', leadDays: 6 }
  }
]
