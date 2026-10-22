// Seasonal colour worlds, one per month. Used for the month bands and for the
// generated "visual draft" behind each post until a real photo is added.
export interface Palette {
  base: string
  a: string
  b: string
  c: string
  text: 'light' | 'dark'
  name: string
}

export const palettes: Record<number, Palette> = {
  1: { name: 'Winter light', base: '#D9E2EA', a: '#F2ECE2', b: '#B4C4D6', c: '#E9DCC0', text: 'dark' },
  2: { name: 'Pomegranate', base: '#7A2E45', a: '#C8707F', b: '#4E1F2E', c: '#E2A99A', text: 'light' },
  3: { name: 'Almond blossom', base: '#EED9DC', a: '#C9D3AE', b: '#D8C8E3', c: '#F7EDE4', text: 'dark' },
  4: { name: 'Citrus and sky', base: '#F1E3B8', a: '#B8D0E6', b: '#EDB49E', c: '#F8F1DF', text: 'dark' },
  5: { name: 'Peony and sage', base: '#EBCBCF', a: '#C3CBAE', b: '#EFD9A9', c: '#F6ECE6', text: 'dark' },
  6: { name: 'Cobalt summer', base: '#2F55C8', a: '#F0B68A', b: '#8CC0C4', c: '#1E3A8F', text: 'light' },
  7: { name: 'Tomato and basil', base: '#C9603F', a: '#F3C98E', b: '#8A9E62', c: '#9E3B26', text: 'light' },
  8: { name: 'Lavender rest', base: '#D9D0E6', a: '#C9C79C', b: '#A9B4CF', c: '#EEE7DC', text: 'dark' },
  9: { name: 'Fig and wheat', base: '#5E3D50', a: '#C9A774', b: '#8C6E9A', c: '#3F2A38', text: 'light' },
  10: { name: 'Dusk', base: '#4C2E40', a: '#B5654A', b: '#7E4F66', c: '#2E1B28', text: 'light' },
  11: { name: 'Candle and chestnut', base: '#6E4636', a: '#D4A76A', b: '#6C6E52', c: '#43281E', text: 'light' },
  12: { name: 'Pine and berry', base: '#23392F', a: '#8B2E3C', b: '#CDAA6B', c: '#152520', text: 'light' },
}

export function paletteFor(dateOrKey: string): Palette {
  return palettes[Number(dateOrKey.slice(5, 7))] ?? palettes[1]
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** A soft, deterministic gradient "plate" in the month's palette. */
export function moodBackground(seed: string, p: Palette) {
  const h = hash(seed)
  const r = (shift: number, min: number, span: number) => min + ((h >>> shift) % span)
  const x1 = r(0, 5, 45), y1 = r(4, 5, 50)
  const x2 = r(8, 50, 45), y2 = r(12, 35, 60)
  const x3 = r(16, 20, 60), y3 = r(20, 60, 40)
  return [
    `radial-gradient(60% 55% at ${x1}% ${y1}%, ${p.a} 0%, transparent 70%)`,
    `radial-gradient(55% 60% at ${x2}% ${y2}%, ${p.b} 0%, transparent 72%)`,
    `radial-gradient(70% 50% at ${x3}% ${y3}%, ${p.c} 0%, transparent 75%)`,
    `linear-gradient(160deg, ${p.base}, ${p.base})`,
  ].join(', ')
}
