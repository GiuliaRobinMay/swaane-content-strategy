export type SeriesKey =
  | 'lesson'
  | 'line'
  | 'checkin'
  | 'helping'
  | 'table'
  | 'stories'
  | 'yourself'

export interface SeriesInfo {
  key: SeriesKey
  name: string
  short: string
  purpose: string
  format: string
}

export type PostStatus = 'review' | 'reviewed' | 'approved' | 'posted'

export interface PostSeed {
  date: string // YYYY-MM-DD
  body: string
}

export interface MonthTheme {
  key: string // YYYY-MM
  theme: string
  hook: string
  movement: string
  chapter: string
}

export interface WeekTheme {
  start: string // YYYY-MM-DD, first day the subtopic applies to
  title: string
  question?: string
}

export interface Holiday {
  date: string
  label: string
}

export interface Offer {
  key: string
  name: string
  kind: 'coaching' | 'course' | 'book' | 'retreat' | 'challenge'
  description: string
  keywords: string[]
  proposed?: boolean
}
