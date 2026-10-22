import { seeds, seedByDate } from '../data/posts'
import { holidays, months, offers, series, seriesByWeekday, weeks } from '../data/strategy'
import type { MonthTheme, Offer, SeriesInfo, WeekTheme } from '../data/types'
import { weekday } from './dates'
import type { AppState } from './store'

export const FIRST_DAY = '2026-10-01'
export const LAST_DAY = '2027-12-31'
export const FIRST_MONTH = '2026-10'
export const LAST_MONTH = '2027-12'
export const ALL_DATES = seeds.map((s) => s.date)

export const inRange = (d: string) => d >= FIRST_DAY && d <= LAST_DAY
export const monthInRange = (k: string) => k >= FIRST_MONTH && k <= LAST_MONTH

const seriesMap = new Map(series.map((s) => [s.key, s]))
export const seriesFor = (date: string): SeriesInfo => seriesMap.get(seriesByWeekday[weekday(date)])!

export function weekFor(date: string, state: AppState): WeekTheme | undefined {
  let found: WeekTheme | undefined
  for (const w of weeks) {
    if (w.start <= date) found = w
    else break
  }
  if (!found) return undefined
  const o = state.weeks[found.start]
  return o ? { ...found, ...o } : found
}

export function monthFor(key: string, state: AppState): MonthTheme | undefined {
  const m = months.find((x) => x.key === key)
  if (!m) return undefined
  const o = state.months[key]
  return o ? { ...m, ...o } : m
}

export function weeksIn(key: string): WeekTheme[] {
  return weeks.filter((w) => w.start.slice(0, 7) === key)
}

export const holidaysOn = (date: string) => holidays.filter((h) => h.date === date).map((h) => h.label)

export function offersIn(body: string): Offer[] {
  const lower = body.toLowerCase()
  return offers.filter((o) => o.keywords.some((k) => lower.includes(k.toLowerCase())))
}

export function seedBody(date: string) {
  return seedByDate.get(date)?.body ?? ''
}
export function bodyFor(date: string, state: AppState) {
  return state.posts[date]?.body ?? seedBody(date)
}

const PREFIXES = [
  /^A line to keep:\s*/i,
  /^The Friday Table[^:]*:\s*/i,
  /^Welcome to the Friday Table\.\s*/i,
  /^Something for yourself:\s*/i,
  /^A helping hand:\s*/i,
  /^Midweek check-in:\s*/i,
]

/** The line that would sit on the post visual. */
export function headline(body: string, seriesKey: string): string {
  if (seriesKey === 'line') {
    const m = body.match(/“([^”]+)”/)
    if (m) return m[1]
  }
  let t = body
  for (const p of PREFIXES) t = t.replace(p, '')
  // "Borrow this: “There is something…”" → the words inside the quote
  const quoted = /^[^“.?!]{0,48}:\s*“/.test(t)
  t = t.replace(/^[^“.?!]{0,48}:\s*“/, '')
  const close = t.indexOf('”')
  const m = t.match(/^(.{12,120}?[.?!…])(\s|$)/)
  let out = (quoted && close > 6 && close < 160 ? t.slice(0, close) : m ? m[1] : t.slice(0, 110)).trim()
  if (quoted && out.length > 90) {
    const first = out.match(/^(.{12,}?[.?!…])(\s|$)/)
    if (first) out = first[1]
  }
  const opens = (out.match(/“/g) ?? []).length
  const closes = (out.match(/”/g) ?? []).length
  if (opens > closes) out = out.replace(/“(?![^“]*”)/, '')
  if (closes > opens) out = out.replace(/”(?!.*”)/, '')
  return out.length > 118 ? out.slice(0, 115).trimEnd() + '…' : out
}
