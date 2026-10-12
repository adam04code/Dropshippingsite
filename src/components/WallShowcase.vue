<script setup>
// Vitrina 3D: una caja de reloj de madera con tapa de cristal que EMERGE de la pared.
// CSS 3D real (preserve-3d): 5 caras de madera, marco de latón, cojín de terciopelo,
// cristal con reflejos, sombra proyectada sobre la pared y tapa que se abre al hacer clic.
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import WatchSvg from './WatchSvg.vue'

const props = defineProps({
  product: { type: Object, required: true },
  lume: Boolean,
  interactive: { type: Boolean, default: true },
  autoOpen: Boolean
})

const W = 420, H = 560, D = 150
const stage = ref(null)
const scale = ref(1)
const rx = ref(0), ry = ref(0)
const mx = ref(0.5), my = ref(0.5)
const out = ref(0)       // cuánto sobresale de la pared (px)
const open = ref(false)  // tapa abierta
let ro, raf, targetRx = 0, targetRy = 0

function onMove(e) {
  if (!props.interactive) return
  const r = stage.value.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  mx.value = x; my.value = y
  targetRy = (x - 0.5) * 30
  targetRx = (0.5 - y) * 22
}
function onLeave() { targetRx = 0; targetRy = 0; mx.value = 0.5; my.value = 0.5 }

function loop() {
  rx.value += (targetRx - rx.value) * 0.08
  ry.value += (targetRy - ry.value) * 0.08
  raf = requestAnimationFrame(loop)
}

onMounted(() => {
  ro = new ResizeObserver(([e]) => { scale.value = Math.min(1.1, e.contentRect.width / W) })
  ro.observe(stage.value.parentElement)
  raf = requestAnimationFrame(loop)
  // Entrada: la caja se desliza fuera de la pared
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) out.value = 90
  else setTimeout(() => (out.value = 90), 250)
  if (props.autoOpen) setTimeout(() => (open.value = true), 1400)
})
onBeforeUnmount(() => { ro?.disconnect(); cancelAnimationFrame(raf) })

const boxStyle = computed(() => ({
  width: W + 'px', height: H + 'px',
  transform: `translateZ(${out.value}px) rotateX(${rx.value.toFixed(2)}deg) rotateY(${ry.value.toFixed(2)}deg)`
}))
const shadowStyle = computed(() => ({
  transform: `translate(${(-ry.value * 2.2 + 26).toFixed(1)}px, ${(rx.value * 2 + 40 + out.value * 0.35).toFixed(1)}px) scale(${1 + out.value / 400})`,
  opacity: 0.25 + out.value / 260
}))
const glareStyle = computed(() => ({ backgroundPosition: `${(1 - mx.value) * 100}% ${(1 - my.value) * 100}%` }))
const watchStyle = computed(() => ({
  transform: `translateZ(${open.value ? 70 : -70}px) rotateX(${(-rx.value * 0.4).toFixed(2)}deg) rotateY(${(-ry.value * 0.4).toFixed(2)}deg) scale(${open.value ? 1.04 : 1})`
}))
</script>

<template>
  <div class="wall-wrap">
    <div ref="stage" class="stage-fit" :style="{ height: H * scale + 'px' }">
      <div class="stage" :style="{ width: W + 'px', height: H + 'px', transform: `translateX(-50%) scale(${scale})` }" @pointermove="onMove" @pointerleave="onLeave">
        <!-- Nicho tallado en la pared -->
        <div class="niche" :style="{ width: W + 24 + 'px', height: H + 24 + 'px' }" />
        <div class="cast-shadow" :style="{ width: W + 'px', height: H + 'px', ...shadowStyle }" />

        <div class="scene">
          <div class="box" :style="boxStyle">
            <!-- Fondo con terciopelo -->
            <div class="face back" :style="{ width: W + 'px', height: H + 'px', transform: `translateZ(${-D}px)` }">
              <div class="velvet" />
            </div>
            <!-- Laterales de madera -->
            <div class="face wood" :style="{ width: D + 'px', height: H + 'px', transformOrigin: 'left center', transform: 'rotateY(90deg)' }" />
            <div class="face wood" :style="{ width: D + 'px', height: H + 'px', left: W + 'px', transformOrigin: 'left center', transform: 'rotateY(90deg)' }" />
            <div class="face wood side-t" :style="{ width: W + 'px', height: D + 'px', transformOrigin: 'center top', transform: 'rotateX(-90deg)' }" />
            <div class="face wood side-b" :style="{ width: W + 'px', height: D + 'px', top: H + 'px', transformOrigin: 'center top', transform: 'rotateX(-90deg)' }" />

            <!-- Cojín + reloj flotando -->
            <div class="cushion" :style="{ transform: `translateZ(${-D + 4}px)` }" />
            <div class="watch" :style="watchStyle">
              <div class="watch-shadow" />
              <WatchSvg :colors="product.colors" :watch-style="product.style" :lume="lume" live :label="product.name" />
            </div>

            <!-- Marco de latón frontal -->
            <div class="frame" :style="{ transform: 'translateZ(0px)' }" />
            <!-- Cristal: bisagra superior, se abre al clic -->
            <div class="lid" :class="{ open }" :style="{ width: W - 28 + 'px', height: H - 28 + 'px' }" @click="open = !open" role="button" tabindex="0" :aria-label="open ? 'Cerrar vitrina' : 'Abrir vitrina'" @keydown.enter="open = !open">
              <div class="glass" />
              <div class="glare" :style="glareStyle" />
              <div class="plaque">CHRONOS · {{ product.name }}</div>
            </div>
            <!-- Focos -->
            <div class="rim-light" />
          </div>
        </div>
      </div>
    </div>
    <p class="hint text-caption">
      <v-icon size="14">mdi-gesture-tap</v-icon>
      {{ open ? 'Toca el cristal para cerrar la vitrina' : 'Toca el cristal para abrir la vitrina' }}
    </p>
  </div>
</template>

<style scoped>
.wall-wrap { width: 100%; max-width: 520px; margin: 0 auto; }
.stage-fit { position: relative; width: 100%; }
.stage { position: absolute; left: 50%; top: 0; transform-origin: top center; touch-action: pan-y; }

.niche {
  position: absolute; left: -12px; top: -12px; border-radius: 6px;
  background: linear-gradient(135deg, #050506, #15161a);
  box-shadow: inset 12px 12px 30px #000, inset -6px -6px 20px #0008, 0 0 0 1px #ffffff0f, 0 0 0 4px #00000040;
}
.cast-shadow { position: absolute; left: 0; top: 0; background: #000; filter: blur(32px); border-radius: 12px; transition: opacity 1.2s, transform 1.2s; }
.scene { position: absolute; inset: 0; perspective: 1500px; perspective-origin: 50% 45%; }
.box { position: relative; transform-style: preserve-3d; transition: transform 1.6s cubic-bezier(.2, .8, .2, 1); }
.stage:hover .box { transition-duration: 0.15s; }
.face { position: absolute; top: 0; left: 0; backface-visibility: visible; }
.back { background: #1a0d12; }
.velvet { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 35%, #6e1a34 0%, #3a0c1c 55%, #1b060d 100%); }
.velvet::after { content: ''; position: absolute; inset: 0; background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>"); mix-blend-mode: overlay; opacity: 0.6; }
.wood {
  background:
    repeating-linear-gradient(92deg, #0000 0 7px, #00000022 7px 8px, #0000 8px 17px),
    linear-gradient(180deg, #5a3a22, #3a2312 50%, #26150a);
  box-shadow: inset 0 0 30px #000b;
}
.side-t { background: linear-gradient(180deg, #4a2f1b, #2a180c), repeating-linear-gradient(92deg, #0000 0 7px, #00000022 7px 8px); box-shadow: inset 0 0 30px #000; }
.side-b { background: linear-gradient(0deg, #1c0f07, #3a2312); }
.cushion {
  position: absolute; left: 50%; top: 50%; width: 230px; height: 500px; margin: -250px 0 0 -115px; border-radius: 110px;
  background: radial-gradient(ellipse at 40% 30%, #8c2745, #4b1226 60%, #2a0912);
  box-shadow: inset 0 6px 14px #ffffff22, inset 0 -12px 24px #0009, 0 10px 30px #0008;
}
.watch { position: absolute; left: 50%; top: 50%; width: 270px; margin: -184px 0 0 -135px; transform-style: preserve-3d; transition: transform 0.9s cubic-bezier(.2, .8, .2, 1); filter: drop-shadow(0 18px 18px #000a); }
.frame {
  position: absolute; inset: 0; pointer-events: none; border-radius: 4px; padding: 14px;
  background: linear-gradient(135deg, #f6e6a6, #8a6a22 28%, #e9d27a 50%, #6b4f12 76%, #d9b35c);
  -webkit-mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  filter: drop-shadow(0 2px 3px #000a);
  transform-style: flat;
}
.lid { position: absolute; left: 14px; top: 14px; transform-origin: top center; transform: translateZ(2px); transition: transform 1.1s cubic-bezier(.3, 1.3, .4, 1); cursor: pointer; transform-style: preserve-3d; outline: none; }
.lid.open { transform: translateZ(2px) rotateX(-112deg); }
.lid:focus-visible .glass { outline: 2px solid #e9d27a; }
.glass { position: absolute; inset: 0; background: linear-gradient(135deg, #ffffff22 0%, #ffffff05 40%, #ffffff00 55%, #ffffff10 100%); box-shadow: inset 0 0 0 1px #ffffff30, inset 0 0 40px #8cc4ff10; backdrop-filter: blur(0.4px); }
.glare { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, #ffffff35 45%, transparent 60%) 0 0 / 250% 250%; mix-blend-mode: screen; pointer-events: none; }
.plaque { position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%); padding: 3px 12px; font: 600 9px/1 Inter, sans-serif; letter-spacing: 0.25em; text-transform: uppercase; color: #3a2a07; background: linear-gradient(135deg, #f1dc9a, #b08a2c); border-radius: 2px; white-space: nowrap; box-shadow: 0 1px 2px #000a; }
.rim-light { position: absolute; left: 14px; right: 14px; top: 14px; height: 40px; background: linear-gradient(180deg, #fff3c455, transparent); pointer-events: none; transform: translateZ(1px); }
.hint { position: relative; z-index: 2; text-align: center; opacity: 0.6; margin-top: 12px; }
@media (prefers-reduced-motion: reduce) { .box, .lid, .watch, .cast-shadow { transition: none; } }
</style>
