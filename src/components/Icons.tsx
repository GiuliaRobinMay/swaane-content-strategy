import type { ReactNode } from 'react'
import type { SeriesKey } from '../data/types'
import type { Route } from '../lib/store'

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export const navIcons: Record<Route, () => ReactNode> = {
  today: () => (
    <Svg><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></Svg>
  ),
  calendar: () => (
    <Svg><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M3.5 10h17M8 3v4M16 3v4" /><circle cx="8.5" cy="14.5" r=".6" fill="currentColor" /><circle cx="12" cy="14.5" r=".6" fill="currentColor" /><circle cx="15.5" cy="14.5" r=".6" fill="currentColor" /></Svg>
  ),
  review: () => (
    <Svg><rect x="6" y="3.5" width="12" height="15" rx="2.5" /><path d="M3.5 7v11a3 3 0 0 0 3 3h9" /><path d="M9.5 11l1.8 1.8L15 9" /></Svg>
  ),
  strategy: () => (
    <Svg><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /><path d="m14.5 9.5-1.6 3.4-3.4 1.6 1.6-3.4z" /></Svg>
  ),
  funnel: () => (
    <Svg><path d="M4 5h16l-6 7.5V19l-4-2v-4.5z" /></Svg>
  ),
  results: () => (
    <Svg><path d="M4 19.5h16" /><path d="M5 15l4-4 3.5 3 6.5-7" /><circle cx="19" cy="7" r="1.2" /></Svg>
  ),
  accounts: () => (
    <Svg><circle cx="9" cy="12" r="4.5" /><circle cx="15" cy="12" r="4.5" /></Svg>
  ),
}

export const seriesIcons: Record<SeriesKey, (size?: number) => ReactNode> = {
  lesson: (size) => (
    <Svg size={size}><path d="M12 6.5c-2-1.6-5-2-8-1.5v12.5c3-.5 6-.1 8 1.5 2-1.6 5-2 8-1.5V5c-3-.5-6-.1-8 1.5z" /><path d="M12 6.5V19" /></Svg>
  ),
  line: (size) => (
    <Svg size={size}><path d="M5 15.5c0-3.5 1.5-6 4-7.5M5 15.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0zM13 15.5c0-3.5 1.5-6 4-7.5M13 15.5a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" /></Svg>
  ),
  checkin: (size) => (
    <Svg size={size}><circle cx="12" cy="12" r="7.5" /><path d="M12 4.5a7.5 7.5 0 0 1 0 15" fill="currentColor" fillOpacity=".18" /></Svg>
  ),
  helping: (size) => (
    <Svg size={size}><path d="M5 19c6 0 13-4 14-14C9 6 5 12 5 19z" /><path d="M5 19c3-4 6-7 10-9.5" /></Svg>
  ),
  table: (size) => (
    <Svg size={size}><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="4" r="1" /><circle cx="12" cy="20" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="20" cy="12" r="1" /><circle cx="6.3" cy="6.3" r="1" /><circle cx="17.7" cy="17.7" r="1" /><circle cx="17.7" cy="6.3" r="1" /><circle cx="6.3" cy="17.7" r="1" /></Svg>
  ),
  stories: (size) => (
    <Svg size={size}><path d="M3.5 12.5h17a8.5 8.5 0 0 1-17 0z" /><path d="M9 9c0-1.2 1-1.6 1-3M12.5 9c0-1.2 1-1.6 1-3" /></Svg>
  ),
  yourself: (size) => (
    <Svg size={size}><path d="M3 17.5h18" /><path d="M7 17.5a5 5 0 0 1 10 0" /><path d="M12 7.5v1.5M6.5 9.8l1 1M17.5 9.8l-1 1" /></Svg>
  ),
}

export const Arrow = ({ dir = 'right' }: { dir?: 'left' | 'right' }) => (
  <Svg size={18}>{dir === 'right' ? <path d="M9 5l7 7-7 7" /> : <path d="M15 5l-7 7 7 7" />}</Svg>
)
export const Close = () => <Svg size={18}><path d="M6 6l12 12M18 6 6 18" /></Svg>
export const Plus = () => <Svg size={18}><path d="M12 5v14M5 12h14" /></Svg>
export const Copy = () => <Svg size={18}><rect x="8" y="8" width="11" height="12" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h8" /></Svg>
export const Upload = () => <Svg size={18}><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5" /><path d="M4.5 14.5v3a2.5 2.5 0 0 0 2.5 2.5h10a2.5 2.5 0 0 0 2.5-2.5v-3" /></Svg>
export const Check = () => <Svg size={18}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
export const Spark = () => <Svg size={16}><path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5z" /></Svg>
