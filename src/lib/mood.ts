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
  1: { name: 'Winter light', base: '#EEF2F6', a: '#FFFFFF', b: '#D6E1EC', c: '#F3EADB', text: 'dark' },
  2: { name: 'Pomegranate blush', base: '#F7E8EA', a: '#FFF8F6', b: '#EBC9D1', c: '#F6E0D6', text: 'dark' },
  3: { name: 'Almond blossom', base: '#F7EEF0', a: '#E6EDD8', b: '#EADFF0', c: '#FFFAF6', text: 'dark' },
  4: { name: 'Citrus and sky', base: '#F9F2E0', a: '#DFE9F5', b: '#F5DCD0', c: '#FFFCF4', text: 'dark' },
  5: { name: 'Peony and sage', base: '#F8EBED', a: '#E5EBDA', b: '#F6EBD2', c: '#FFF9F7', text: 'dark' },
  6: { name: 'Cobalt summer', base: '#EBF0FB', a: '#FBE6D6', b: '#D9ECEC', c: '#F8FAFF', text: 'dark' },
  7: { name: 'Peach and basil', base: '#FCEEE4', a: '#FBEFD3', b: '#E4ECD6', c: '#FFF8F2', text: 'dark' },
  8: { name: 'Lavender rest', base: '#F1EDF6', a: '#EDEDDE', b: '#DFE5F2', c: '#FBF8F3', text: 'dark' },
  9: { name: 'Fig and wheat', base: '#F4ECF1', a: '#F5EADA', b: '#E6DDEE', c: '#FCF9F5', text: 'dark' },
  10: { name: 'Rose dusk', base: '#F6EBEF', a: '#F6E0D5', b: '#E7D3E0', c: '#FCF7F4', text: 'dark' },
  11: { name: 'Candle and oat', base: '#F6EEE6', a: '#F6E6CF', b: '#E6E8DC', c: '#FDF9F4', text: 'dark' },
  12: { name: 'Frost and berry', base: '#EDF2EF', a: '#F3E1E5', b: '#F3ECD9', c: '#FAFCFB', text: 'dark' },
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
