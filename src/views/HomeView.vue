<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCatalog } from '@/stores/catalog'
import { useSeo } from '@/composables/useSeo'
import WallShowcase from '@/components/WallShowcase.vue'
import ProductCard from '@/components/ProductCard.vue'
import WatchSvg from '@/components/WatchSvg.vue'
import { faq } from '@shared/faq.js'

useSeo({ title: null, path: '/', image: '/img/og-cover.svg' })
const cat = useCatalog()
const hero = ref(0)
const heroList = computed(() => cat.products.filter((p) => ['p1', 'p7', 'p5', 'p12', 'p3'].includes(p.id)))
const current = computed(() => heroList.value[hero.value] || cat.products[0])
const wall = ref(null)
const night = ref(false)
function spot(e) { const r = wall.value.getBoundingClientRect(); wall.value.style.setProperty('--mx', ((e.clientX - r.left) / r.width) * 100 + '%'); wall.value.style.setProperty('--my', ((e.clientY - r.top) / r.height) * 100 + '%') }
const bestsellers = computed(() => [...cat.products].sort((a, b) => b.reviews - a.reviews).slice(0, 4))
const offers = computed(() => cat.products.filter((p) => p.compareAt).sort((a, b) => b.compareAt / b.price - a.compareAt / a.price).slice(0, 4))
const steps = [
  { icon: 'mdi-cursor-default-click-outline', t: 'Eliges tu reloj', d: 'Catálogo curado con fichas técnicas reales.' },
  { icon: 'mdi-factory', t: 'Se prepara en taller', d: 'Revisión, ajuste y embalaje en 24-48 h.' },
  { icon: 'mdi-airplane', t: 'Viaja directo a ti', d: 'Seguimiento en tiempo real desde tu panel.' },
  { icon: 'mdi-shield-check-outline', t: 'Garantía total', d: '30 días de devolución y 2 años de garantía.' }
]
const reviews = [
  { n: 'Marta G.', t: 'El Abyss es una pasada por el precio. La corona de rosca y el bisel suenan a reloj de 1000 €.', w: 'Abyss 300 Azul' },
  { n: 'David R.', t: 'Llegó en 6 días, perfectamente embalado y con la hora clavada. El seguimiento desde la cuenta es muy cómodo.', w: 'Meridian Plata' },
  { n: 'Lucía P.', t: 'El esqueleto tiene un acabado increíble. Todo el mundo me pregunta por él.', w: 'Aether Oro' }
]
let timer
onMounted(() => { timer = setInterval(() => { if (!document.hidden) hero.value = (hero.value + 1) % Math.max(1, heroList.value.length) }, 9000) })
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div>
    <!-- HERO: pared + vitrina que emerge -->
    <section ref="wall" class="wall hero" @pointermove="spot">
      <v-container class="py-10 py-md-16">
        <v-row align="center">
          <v-col cols="12" md="6" lg="5" class="order-2 order-md-1">
            <v-chip color="primary" variant="tonal" size="small" class="mb-4" prepend-icon="mdi-star-four-points">Colección Otoño · Edición limitada</v-chip>
            <h1 class="serif hero-title mb-4">Relojes que <span class="gold-text">salen de la pared</span> y se quedan en tu muñeca</h1>
            <p class="text-body-1 text-medium-emphasis mb-6" style="max-width: 520px">
              Automáticos con cristal de zafiro, buceadores de 300 m y cronógrafos con carácter. Diseñados en taller, enviados directo a tu casa con seguimiento en tiempo real.
            </p>
            <div class="d-flex flex-wrap ga-3 mb-6">
              <v-btn size="x-large" color="primary" to="/relojes" append-icon="mdi-arrow-right">Ver colección</v-btn>
              <v-btn size="x-large" variant="outlined" to="/ofertas" prepend-icon="mdi-fire">Ofertas hasta -30%</v-btn>
            </div>
            <div class="d-flex flex-wrap ga-4 text-body-2 text-medium-emphasis">
              <span><v-icon size="18" color="primary">mdi-truck-fast-outline</v-icon> Envío gratis +100 €</span>
              <span><v-icon size="18" color="primary">mdi-backup-restore</v-icon> 30 días devolución</span>
              <span><v-icon size="18" color="primary">mdi-shield-check-outline</v-icon> 2 años garantía</span>
            </div>
            <div class="mt-8">
              <div class="text-overline mb-2">Cambia de modelo</div>
              <v-btn-toggle v-model="hero" mandatory divided density="comfortable" color="primary" variant="outlined" class="flex-wrap h-auto">
                <v-btn v-for="(p, i) in heroList" :key="p.id" :value="i" size="small" :aria-label="p.name">
                  <div class="chip-w"><WatchSvg :colors="p.colors" :watch-style="p.style" /></div>
                </v-btn>
              </v-btn-toggle>
            </div>
          </v-col>
          <v-col cols="12" md="6" lg="7" class="order-1 order-md-2">
            <WallShowcase v-if="current" :key="current.id" :product="current" auto-open />
            <div v-if="current" class="text-center mt-2" style="position: relative; z-index: 2">
              <router-link :to="`/relojes/${current.slug}`" class="text-h6 serif text-decoration-none">{{ current.name }}</router-link>
              <span class="ml-2 price-now text-primary">{{ current.price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) }}</span>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Categorías -->
    <section class="section">
      <v-container>
        <h2 class="section-title mb-2">Encuentra tu estilo</h2>
        <p class="text-medium-emphasis mb-6">Cinco colecciones, un mismo estándar de calidad.</p>
        <v-row>
          <v-col v-for="c in cat.categories" :key="c.slug" cols="6" md="4" lg="">
            <v-card :to="`/categoria/${c.slug}`" class="card-hover pa-5 h-100" color="surface">
              <v-avatar color="primary" variant="tonal" size="52" class="mb-3"><v-icon size="28">{{ c.icon }}</v-icon></v-avatar>
              <h3 class="text-h6 serif">{{ c.name }}</h3>
              <p class="text-body-2 text-medium-emphasis mt-1">{{ c.blurb }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Más vendidos -->
    <section class="section pt-0">
      <v-container>
        <div class="d-flex align-end mb-6"><div><h2 class="section-title">Los más vendidos</h2><p class="text-medium-emphasis">Elegidos por más de 2.000 clientes.</p></div><v-spacer /><v-btn variant="text" to="/relojes" append-icon="mdi-arrow-right">Ver todos</v-btn></div>
        <v-row>
          <template v-if="cat.loaded"><v-col v-for="p in bestsellers" :key="p.id" cols="12" sm="6" lg="3"><ProductCard :product="p" /></v-col></template>
          <template v-else><v-col v-for="i in 4" :key="i" cols="12" sm="6" lg="3"><v-skeleton-loader type="image, article, actions" /></v-col></template>
        </v-row>
      </v-container>
    </section>

    <!-- Modo noche -->
    <section class="wall section night" :class="{ on: night }">
      <v-container>
        <v-row align="center">
          <v-col cols="12" md="6" class="d-flex justify-center">
            <div style="width: min(300px, 70vw)" class="night-watch"><WatchSvg v-if="cat.products[0]" :colors="cat.products[0].colors" :watch-style="cat.products[0].style" live :lume="night" label="Reloj con luminiscencia" /></div>
          </v-col>
          <v-col cols="12" md="6">
            <h2 class="section-title mb-3">Luminiscencia que dura toda la noche</h2>
            <p class="text-medium-emphasis mb-5">Pigmento Super-LumiNova® en manecillas e índices. Apaga la luz y compruébalo.</p>
            <v-switch v-model="night" color="success" inset hide-details :label="night ? 'Modo noche activado' : 'Apagar las luces'" />
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Ofertas -->
    <section class="section">
      <v-container>
        <div class="d-flex align-end mb-6"><div><h2 class="section-title">Ofertas de temporada</h2><p class="text-medium-emphasis">Stock limitado, hasta -30%.</p></div><v-spacer /><v-btn variant="text" color="accent" to="/ofertas" append-icon="mdi-arrow-right">Todas las ofertas</v-btn></div>
        <v-row><v-col v-for="p in offers" :key="p.id" cols="12" sm="6" lg="3"><ProductCard :product="p" /></v-col></v-row>
      </v-container>
    </section>

    <!-- Cómo funciona -->
    <section class="section" style="background: rgba(var(--v-theme-surface-variant), 0.35)">
      <v-container>
        <h2 class="section-title text-center mb-8">Del taller a tu muñeca</h2>
        <v-row>
          <v-col v-for="(s, i) in steps" :key="s.t" cols="12" sm="6" md="3" class="text-center">
            <v-avatar size="72" color="primary" variant="tonal" class="mb-3"><v-icon size="34">{{ s.icon }}</v-icon></v-avatar>
            <div class="text-overline text-medium-emphasis">Paso {{ i + 1 }}</div>
            <h3 class="text-h6">{{ s.t }}</h3>
            <p class="text-body-2 text-medium-emphasis">{{ s.d }}</p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Opiniones -->
    <section class="section">
      <v-container>
        <h2 class="section-title text-center mb-6">Lo que dicen nuestros clientes</h2>
        <v-carousel height="230" hide-delimiter-background show-arrows="hover" cycle interval="6000" color="primary">
          <v-carousel-item v-for="r in reviews" :key="r.n">
            <div class="d-flex flex-column align-center justify-center h-100 text-center px-8 px-md-16">
              <v-rating :model-value="5" color="primary" readonly size="20" density="compact" />
              <p class="text-h6 serif font-weight-regular my-3" style="max-width: 760px">“{{ r.t }}”</p>
              <div class="text-body-2 text-medium-emphasis">{{ r.n }} · {{ r.w }}</div>
            </div>
          </v-carousel-item>
        </v-carousel>
      </v-container>
    </section>

    <!-- FAQ -->
    <section class="section pt-0">
      <v-container style="max-width: 820px">
        <h2 class="section-title text-center mb-6">Preguntas frecuentes</h2>
        <v-expansion-panels variant="accordion" rounded="xl">
          <v-expansion-panel v-for="f in faq" :key="f.q" :title="f.q" :text="f.a" />
        </v-expansion-panels>
      </v-container>
    </section>
  </div>
</template>

<style scoped>
.hero-title { font-size: clamp(2.2rem, 5vw, 3.9rem); line-height: 1.05; }
.chip-w { width: 22px; }
.night { transition: background 0.8s; }
.night.on { background: #030304 !important; }
.night.on::before { opacity: 0.15; }
.night-watch { transition: filter 0.6s; filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.6)); }
</style>
