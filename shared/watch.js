// Renderizador SVG procedural de relojes. Puro JS: lo usa el servidor (imágenes
// de producto / Open Graph) y el cliente (componente WatchSvg.vue).
const R = 200 // viewBox -250..250

const pt = (deg, r) => {
  const a = ((deg - 90) * Math.PI) / 180
  return [+(Math.cos(a) * r).toFixed(2), +(Math.sin(a) * r).toFixed(2)]
}

function strap(c, style, id) {
  const fill = style === 'metal' ? `url(#${id}-metal)` : style === 'rubber' ? c.strap : `url(#${id}-leather)`
  const links =
    style === 'metal'
      ? Array.from({ length: 9 }, (_, i) => `<path d="M-62 ${-300 + i * 22}h124" stroke="#00000033" stroke-width="2"/><path d="M-62 ${-299 + i * 22}h124" stroke="#ffffff40" stroke-width="1"/>`).join('') +
        Array.from({ length: 9 }, (_, i) => `<path d="M-62 ${150 + i * 22}h124" stroke="#00000033" stroke-width="2"/>`).join('')
      : style === 'leather'
        ? `<path d="M-52 -310v120M52 -310v120M-52 190v120M52 190v120" stroke="#ffffff30" stroke-width="2" stroke-dasharray="6 5"/>`
        : Array.from({ length: 8 }, (_, i) => `<path d="M-58 ${180 + i * 18}h116" stroke="#ffffff10" stroke-width="3"/>`).join('')
  const holes = style === 'metal' ? '' : Array.from({ length: 5 }, (_, i) => `<circle cx="0" cy="${230 + i * 22}" r="4" fill="#0006"/>`).join('')
  return `<g>
    <path d="M-66 -330 Q-70 -230 -78 -150 L78 -150 Q70 -230 66 -330 Z" fill="${fill}"/>
    <path d="M-78 150 L78 150 Q70 260 66 340 L-66 340 Q-70 260 -78 150 Z" fill="${fill}"/>
    ${links}${holes}
  </g>`
}

function indexes(c, style) {
  let out = ''
  if (style === 'minimal') {
    for (const h of [0, 90, 180, 270]) {
      const [x1, y1] = pt(h, 168), [x2, y2] = pt(h, 146)
      out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.hands}" stroke-width="3" stroke-linecap="round"/>`
    }
    return out
  }
  for (let i = 0; i < 60; i++) {
    const [x1, y1] = pt(i * 6, 176), [x2, y2] = pt(i * 6, i % 5 ? 170 : 164)
    out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c.hands}" stroke-opacity="${i % 5 ? 0.45 : 0.9}" stroke-width="${i % 5 ? 1 : 2}"/>`
  }
  for (let h = 1; h <= 12; h++) {
    const [x, y] = pt(h * 30, 142)
    if (style === 'classic' || style === 'skeleton') {
      const rom = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][h - 1]
      out += `<text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Georgia,serif" font-size="${h % 3 ? 17 : 21}" fill="${c.hands}">${rom}</text>`
    } else {
      const [ax, ay] = pt(h * 30, 150), [bx, by] = pt(h * 30, 124)
      const w = h % 3 ? 7 : 11
      out += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${c.hands}" stroke-width="${w}" stroke-linecap="butt"/>
      <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${c.accent}" stroke-opacity="0.35" stroke-width="${w - 4}"/>`
    }
  }
  return out
}

function skeletonMovement(c, id) {
  const gear = (cx, cy, r, teeth, rot) => {
    let d = ''
    for (let i = 0; i < teeth * 2; i++) {
      const a = ((i / (teeth * 2)) * 360 + rot) * (Math.PI / 180)
      const rr = i % 2 ? r : r + 7
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ' ' + (cy + Math.sin(a) * rr).toFixed(1)
    }
    return `<g><path d="${d}Z" fill="none" stroke="${c.accent}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="none" stroke="${c.accent}" stroke-opacity=".6" stroke-width="2"/>${[0, 60, 120, 180, 240, 300].map((a) => `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos((a * Math.PI) / 180) * (r - 14)).toFixed(1)}" y2="${(cy + Math.sin((a * Math.PI) / 180) * (r - 14)).toFixed(1)}" stroke="${c.accent}" stroke-opacity=".5"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="5" fill="#c0203a"/></g>`
  }
  return `<g class="sk">${gear(-55, -35, 52, 18, 0)}${gear(60, 35, 42, 14, 6)}${gear(-30, 70, 30, 11, 3)}
  <path d="M-150 60 Q-60 160 60 120 Q130 90 150 -10" fill="none" stroke="${c.accent}" stroke-opacity=".35" stroke-width="14"/>
  <circle cx="75" cy="-60" r="30" fill="none" stroke="${c.accent}" stroke-width="3"/><circle cx="75" cy="-60" r="22" fill="none" stroke="${c.accent}" stroke-opacity=".5" stroke-dasharray="3 4"/></g>`
}

function subdials(c, style) {
  if (style === 'chrono') {
    return [[-62, 0], [62, 0], [0, 66]].map(([x, y]) => {
      let ticks = ''
      for (let i = 0; i < 12; i++) { const [a, b] = pt(i * 30, 34), [d, e] = pt(i * 30, 29); ticks += `<line x1="${x + a}" y1="${y + b}" x2="${x + d}" y2="${y + e}" stroke="${c.hands}" stroke-opacity=".7"/>` }
      return `<g><circle cx="${x}" cy="${y}" r="38" fill="${c.dialDark}" stroke="${c.hands}" stroke-opacity=".35" stroke-width="2"/>${ticks}<line x1="${x}" y1="${y}" x2="${x + 20}" y2="${y - 18}" stroke="${c.accent}" stroke-width="2.5"/><circle cx="${x}" cy="${y}" r="3" fill="${c.accent}"/></g>`
    }).join('')
  }
  return ''
}

function moonphase(c) {
  return `<g><path d="M-48 70 a48 48 0 0 1 96 0 Z" fill="#06102c" stroke="${c.accent}" stroke-width="2"/><circle cx="0" cy="58" r="17" fill="${c.accent}"/><circle cx="-8" cy="52" r="3" fill="#0003"/><circle cx="-26" cy="40" r="1.6" fill="#fff"/><circle cx="26" cy="48" r="1.2" fill="#fff"/><circle cx="14" cy="30" r="1.4" fill="#fff"/></g>`
}

export function watchStatic(c, style = 'classic', id = 'w') {
  const bezelTicks = style === 'diver' || style === 'chrono' ? Array.from({ length: 60 }, (_, i) => { const [a, b] = pt(i * 6, 196), [d, e] = pt(i * 6, i % 5 ? 190 : 183); return `<line x1="${a}" y1="${b}" x2="${d}" y2="${e}" stroke="${c.hands}" stroke-opacity=".8" stroke-width="${i % 5 ? 1.5 : 3}"/>` }).join('') : ''
  const [px] = pt(0, 0)
  void px
  const dateBox = style !== 'minimal' && style !== 'skeleton' && style !== 'chrono' ? `<g transform="translate(118,0)"><rect x="-17" y="-13" width="34" height="26" rx="3" fill="#f6f6f2" stroke="${c.caseDark}"/><text x="0" y="8" text-anchor="middle" font-family="Arial" font-size="19" font-weight="600" fill="#111">12</text></g>` : ''
  return `<defs>
    <linearGradient id="${id}-case" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c.case}"/><stop offset=".45" stop-color="#fff" stop-opacity=".85"/><stop offset=".55" stop-color="${c.case}"/><stop offset="1" stop-color="${c.caseDark}"/></linearGradient>
    <linearGradient id="${id}-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.caseDark}"/><stop offset=".3" stop-color="${c.strap}"/><stop offset=".5" stop-color="#fff" stop-opacity=".7"/><stop offset=".7" stop-color="${c.strap}"/><stop offset="1" stop-color="${c.caseDark}"/></linearGradient>
    <linearGradient id="${id}-leather" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".2" stop-color="${c.strap}"/><stop offset=".6" stop-color="${c.strap}"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
    <radialGradient id="${id}-dial" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="${c.dial}"/><stop offset="1" stop-color="${c.dialDark}"/></radialGradient>
    <radialGradient id="${id}-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".35" stop-color="#fff" stop-opacity=".05"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>
    <clipPath id="${id}-clip"><circle r="182"/></clipPath>
  </defs>
  ${strap(c, c.strapStyle, id)}
  <rect x="-224" y="-22" width="22" height="44" rx="6" fill="url(#${id}-case)" transform="scale(-1,1)"/>
  <rect x="198" y="-20" width="22" height="40" rx="5" fill="url(#${id}-case)"/>
  ${Array.from({ length: 6 }, (_, i) => `<line x1="${203 + 0}" y1="${-16 + i * 6.4}" x2="${216}" y2="${-16 + i * 6.4}" stroke="#0004"/>`).join('')}
  ${style === 'chrono' || style === 'diver' ? '' : ''}
  <circle r="214" fill="url(#${id}-case)"/>
  <circle r="206" fill="${c.caseDark}" opacity=".5"/>
  <circle r="200" fill="${c.bezel}"/>
  <circle r="200" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
  ${style === 'diver' ? `<circle cx="0" cy="-193" r="5" fill="${c.accent}"/>` : ''}
  ${bezelTicks}
  <circle r="182" fill="url(#${id}-dial)"/>
  <g clip-path="url(#${id}-clip)">
    <circle r="182" fill="url(#${id}-sun)"/>
    ${style === 'classic' ? Array.from({ length: 14 }, (_, i) => `<circle r="${12 + i * 12}" fill="none" stroke="#000" stroke-opacity=".05" stroke-width="1"/>`).join('') : ''}
    ${style === 'skeleton' ? skeletonMovement(c, id) : ''}
    ${style === 'chrono' || style === 'diver' ? Array.from({ length: 36 }, (_, i) => `<line x1="0" y1="0" x2="${pt(i * 10, 182)[0]}" y2="${pt(i * 10, 182)[1]}" stroke="#fff" stroke-opacity=".035"/>`).join('') : ''}
  </g>
  <circle r="182" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="3"/>
  ${indexes(c, style)}
  ${subdials(c, style)}
  ${c.dial === '#0f1c3f' ? moonphase(c) : ''}
  <text x="0" y="-92" text-anchor="middle" font-family="Georgia,serif" font-size="17" letter-spacing="5" fill="${c.hands}" opacity=".9">CHRONOS</text>
  ${style === 'skeleton' ? '' : `<text x="0" y="${style === 'chrono' ? -62 : 100}" text-anchor="middle" font-family="Arial" font-size="9" letter-spacing="3" fill="${c.hands}" opacity=".55">${style === 'diver' ? 'DIVER 300M' : style === 'chrono' ? 'CHRONOGRAPH' : 'AUTOMATIC'}</text>`}
  ${dateBox}`
}

export function watchHands(c, h, m, s, id = 'w') {
  const ha = (h % 12) * 30 + m * 0.5 + s / 120
  const ma = m * 6 + s * 0.1
  const sa = s * 6
  return `<g>
    <g transform="rotate(${ha.toFixed(2)})"><path d="M-9 14 L-7 -90 L0 -110 L7 -90 L9 14Z" fill="${c.hands}" stroke="#000" stroke-opacity=".35"/><path d="M-4 -20 L-3.5 -85 L0 -100 L3.5 -85 L4 -20Z" fill="${c.accent}" opacity=".45"/></g>
    <g transform="rotate(${ma.toFixed(2)})"><path d="M-6 16 L-4.5 -140 L0 -168 L4.5 -140 L6 16Z" fill="${c.hands}" stroke="#000" stroke-opacity=".35"/><path d="M-2.2 -20 L-2 -138 L0 -156 L2 -138 L2.2 -20Z" fill="${c.accent}" opacity=".45"/></g>
    <g transform="rotate(${sa.toFixed(2)})"><line x1="0" y1="40" x2="0" y2="-172" stroke="${c.accent}" stroke-width="2.2"/><circle cx="0" cy="-130" r="6" fill="${c.accent}"/><circle cx="0" cy="38" r="4" fill="${c.accent}"/></g>
    <circle r="9" fill="${c.hands}" stroke="#000" stroke-opacity=".4"/><circle r="3.5" fill="${c.accent}"/>
  </g>
  <circle r="182" fill="url(#${id}-glass)" pointer-events="none"/>
  <path d="M-140 -120 Q-60 -190 60 -170" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="10" stroke-linecap="round"/>`
}

export function watchSvgString(c, style, { id = 'w', h = 10, m = 8, s = 36, size } = {}) {
  const dims = size ? `width="${size}" height="${size * 1.28}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-250 -340 500 680" ${dims}>${watchStatic(c, style, id)}${watchHands(c, h, m, s, id)}</svg>`
}
export { R }
