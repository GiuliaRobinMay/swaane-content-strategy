import { useSyncExternalStore } from 'react'
import type { MonthTheme, PostStatus, WeekTheme } from '../data/types'
import { yearlyTheme } from '../data/strategy'

export interface MediaRef {
  id: string
  name: string
  type: string
  size: number
}
export interface Metrics {
  likes?: number
  comments?: number
  saves?: number
  shares?: number
  reach?: number
}
export interface PostState {
  status: PostStatus
  body?: string
  notes?: string
  accountId?: string
  media?: MediaRef[]
  postedAt?: string
  metrics?: Metrics
  updatedAt?: string
}
export type Platform = 'instagram' | 'facebook' | 'threads' | 'tiktok' | 'linkedin'
export interface Account {
  id: string
  platform: Platform
  handle: string
  label?: string
}
export type MagnetKind = 'challenge' | 'webinar' | 'giveaway' | 'quiz' | 'other'
export type MagnetStatus = 'idea' | 'planned' | 'live' | 'done'
export interface Magnet {
  id: string
  kind: MagnetKind
  title: string
  description: string
  date?: string
  status: MagnetStatus
}
export interface AppState {
  version: 1
  ownerName: string
  year: { title: string; subtitle: string }
  months: Record<string, Partial<Pick<MonthTheme, 'theme' | 'hook' | 'movement'>>>
  weeks: Record<string, Partial<Pick<WeekTheme, 'title' | 'question'>>>
  posts: Record<string, PostState>
  accounts: Account[]
  magnets: Magnet[]
}

const KEY = 'swaane-studio-v1'

export const defaultMagnets: Magnet[] = [
  {
    id: 'm-swyn',
    kind: 'challenge',
    title: 'Say What You Need',
    description: 'Seven daily emails to practise recognising a need, finding the words, and making a clearer request. Proposed paid pilot, needs a price and a registration page.',
    date: '2027-09-06',
    status: 'planned',
  },
  {
    id: 'm-webinar',
    kind: 'webinar',
    title: 'Talking about desire without blame',
    description: 'Idea: a free 45-minute live session in Desire month, with a replay sent by email to everyone who signs up.',
    date: '2027-03-18',
    status: 'idea',
  },
  {
    id: 'm-giveaway',
    kind: 'giveaway',
    title: 'A copy of The Taste of Her Journey',
    description: 'Idea: a Valentine’s week giveaway. Entry by email sign-up, winner announced at the Friday Table.',
    date: '2027-02-08',
    status: 'idea',
  },
  {
    id: 'm-quiz',
    kind: 'quiz',
    title: 'What does care look like for you?',
    description: 'Idea: a short quiz in Care month. Results arrive by email with a matching first lesson.',
    date: '2027-05-03',
    status: 'idea',
  },
]

function fresh(): AppState {
  return {
    version: 1,
    ownerName: 'Swaane',
    year: { title: yearlyTheme.title, subtitle: yearlyTheme.subtitle },
    months: {},
    weeks: {},
    posts: {},
    accounts: [],
    magnets: defaultMagnets,
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return fresh()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (parsed.version !== 1) return fresh()
    return { ...fresh(), ...parsed } as AppState
  } catch {
    return fresh()
  }
}

let state: AppState = load()
const listeners = new Set<() => void>()
let timer: ReturnType<typeof setTimeout> | undefined

function persist() {
  clearTimeout(timer)
  timer = setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* storage unavailable: keep working in memory */
    }
  }, 250)
}

export const app = {
  get: () => state,
  set(fn: (s: AppState) => AppState) {
    state = fn(state)
    listeners.forEach((l) => l())
    persist()
  },
  replace(next: AppState) {
    state = { ...fresh(), ...next }
    listeners.forEach((l) => l())
    persist()
  },
  reset() {
    state = fresh()
    listeners.forEach((l) => l())
    persist()
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => listeners.delete(l)
  },
}

export function useApp(): AppState {
  return useSyncExternalStore(app.subscribe, app.get, app.get)
}

const DEFAULT_POST: PostState = { status: 'review' }
export const postOf = (s: AppState, date: string): PostState => s.posts[date] ?? DEFAULT_POST

export function updatePost(date: string, patch: Partial<PostState>) {
  app.set((s) => ({
    ...s,
    posts: {
      ...s.posts,
      [date]: { ...(s.posts[date] ?? DEFAULT_POST), ...patch, updatedAt: new Date().toISOString() },
    },
  }))
}

export const uid = (p: string) => `${p}-${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`

// ---- UI state (not persisted) ----
export type Route = 'today' | 'calendar' | 'review' | 'strategy' | 'funnel' | 'results' | 'accounts'
export const ROUTES: Route[] = ['today', 'calendar', 'review', 'strategy', 'funnel', 'results', 'accounts']

export interface UiState {
  route: Route
  calMonth: string
  selected?: string
  reviewStatus: PostStatus | 'all'
  reviewMonth: string | 'all'
  reviewDate?: string
  toast?: { text: string; at: number }
}

function initialRoute(): Route {
  try {
    const h = location.hash.replace('#', '') as Route
    if (ROUTES.includes(h)) return h
  } catch {
    /* ignore */
  }
  return 'today'
}

let ui: UiState = {
  route: initialRoute(),
  calMonth: '2026-10',
  reviewStatus: 'review',
  reviewMonth: 'all',
}
const uiListeners = new Set<() => void>()

export const uiStore = {
  get: () => ui,
  set(patch: Partial<UiState>) {
    ui = { ...ui, ...patch }
    uiListeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    uiListeners.add(l)
    return () => uiListeners.delete(l)
  },
}
export function useUi(): UiState {
  return useSyncExternalStore(uiStore.subscribe, uiStore.get, uiStore.get)
}

export function go(route: Route, patch: Partial<UiState> = {}) {
  uiStore.set({ ...patch, route })
  try {
    history.replaceState(null, '', `#${route}`)
  } catch {
    /* ignore */
  }
  try {
    document.querySelector('.main')?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
  } catch {
    /* ignore */
  }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
export function toast(text: string) {
  uiStore.set({ toast: { text, at: Date.now() } })
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => uiStore.set({ toast: undefined }), 2600)
}
