export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] // Monday first

export const pad = (n: number) => String(n).padStart(2, '0')
export const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

export function parts(s: string) {
  const [y, m, d] = s.split('-').map(Number)
  return { y, m, d }
}
const toDate = (s: string) => new Date(`${s}T00:00:00Z`)
const fromDate = (d: Date) => d.toISOString().slice(0, 10)

export function addDays(s: string, n: number) {
  const d = toDate(s)
  d.setUTCDate(d.getUTCDate() + n)
  return fromDate(d)
}
export const weekday = (s: string) => toDate(s).getUTCDay()
export const monthKey = (s: string) => s.slice(0, 7)

export function todayISO() {
  const n = new Date()
  return iso(n.getFullYear(), n.getMonth() + 1, n.getDate())
}
export function mondayOf(s: string) {
  return addDays(s, -((weekday(s) + 6) % 7))
}
export function daysBetween(a: string, b: string) {
  return Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000)
}
export function addMonths(key: string, n: number) {
  const [y, m] = key.split('-').map(Number)
  const idx = y * 12 + (m - 1) + n
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`
}
export function monthLabel(key: string) {
  const [y, m] = key.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}
export function longDate(s: string) {
  const { y, m, d } = parts(s)
  return `${WEEKDAYS[weekday(s)]} ${d} ${MONTHS[m - 1]} ${y}`
}
export function shortDate(s: string) {
  const { m, d } = parts(s)
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`
}
/** Weeks of a month view, Monday first, padded with neighbouring days. */
export function monthGrid(key: string): string[][] {
  const first = `${key}-01`
  let cursor = mondayOf(first)
  const rows: string[][] = []
  do {
    const row: string[] = []
    for (let i = 0; i < 7; i++) row.push(addDays(cursor, i))
    rows.push(row)
    cursor = addDays(cursor, 7)
  } while (monthKey(cursor) === key)
  return rows
}
export function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
