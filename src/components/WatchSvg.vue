<script setup>
import { computed, ref, onMounted, onBeforeUnmount, useId } from 'vue'
import { watchStatic, watchHands } from '@shared/watch.js'

const props = defineProps({
  colors: { type: Object, required: true },
  watchStyle: { type: String, default: 'classic' },
  live: Boolean,
  lume: Boolean,
  label: { type: String, default: 'Reloj CHRONOS' }
})

const id = 'w' + useId().replace(/[^a-z0-9]/gi, '')
const body = computed(() => watchStatic(props.colors, props.watchStyle, id))
const t = ref({ h: 10, m: 8, s: 36 })
let raf = 0
let last = 0
function tick(ts) {
  // 15 fps es suficiente para un segundero "sweep" fluido sin gastar CPU
  if (ts - last > 66) {
    const d = new Date()
    t.value = { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() + d.getMilliseconds() / 1000 }
    last = ts
  }
  raf = requestAnimationFrame(tick)
}
onMounted(() => { if (props.live && !matchMedia('(prefers-reduced-motion: reduce)').matches) raf = requestAnimationFrame(tick); else if (props.live) { const d = new Date(); t.value = { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() } } })
onBeforeUnmount(() => cancelAnimationFrame(raf))
const hands = computed(() => watchHands(props.colors, t.value.h, t.value.m, t.value.s, id))
</script>

<template>
  <svg class="watch-svg" :class="{ lume }" viewBox="-250 -340 500 680" role="img" :aria-label="label">
    <g class="w-body" v-html="body" />
    <g class="w-hands" v-html="hands" />
  </svg>
</template>

<style scoped>
.watch-svg { width: 100%; height: auto; display: block; overflow: visible; }
.w-body, .w-hands { transition: filter 0.6s; }
.lume .w-body { filter: brightness(0.32) saturate(0.7); }
.lume .w-hands { filter: drop-shadow(0 0 5px #7dffb4) drop-shadow(0 0 14px #3dff8a) brightness(1.2); }
</style>
