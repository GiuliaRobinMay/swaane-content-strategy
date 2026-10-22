import { useEffect } from 'react'
import { navIcons } from './components/Icons'
import { ALL_DATES, inRange, monthFor } from './lib/content'
import { monthLabel, todayISO } from './lib/dates'
import { moodBackground, paletteFor } from './lib/mood'
import { ROUTES, go, postOf, uiStore, useApp, useUi } from './lib/store'
import type { Route } from './lib/store'
import { Accounts } from './pages/Accounts'
import { Calendar } from './pages/Calendar'
import { Funnel } from './pages/Funnel'
import { Results } from './pages/Results'
import { Review } from './pages/Review'
import { Strategy } from './pages/Strategy'
import { Today } from './pages/Today'

const LABEL: Record<Route, string> = {
  today: 'Today',
  calendar: 'Calendar',
  review: 'Review',
  strategy: 'Strategy',
  funnel: 'Funnel',
  results: 'Results',
  accounts: 'Accounts',
}

export default function App() {
  const state = useApp()
  const ui = useUi()
  const today = todayISO()
  const monthKey = inRange(today) ? today.slice(0, 7) : '2026-10'
  const m = monthFor(monthKey, state)
  const p = paletteFor(monthKey)
  const waiting = ALL_DATES.filter((d) => d >= today && postOf(state, d).status === 'review').length

  useEffect(() => {
    const onHash = () => {
      const h = location.hash.replace('#', '') as Route
      if (ROUTES.includes(h) && h !== uiStore.get().route) uiStore.set({ route: h })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.title = `${LABEL[ui.route]} · Swaane Studio`
  }, [ui.route])

  return (
    <div className="shell">
      <nav className="side" aria-label="Main">
        <div className="brand">
          <div className="word">swaane</div>
          <div className="sub">Content studio</div>
        </div>
        <div className="nav">
          {ROUTES.map((r) => (
            <button key={r} type="button" aria-current={ui.route === r ? 'page' : undefined} onClick={() => go(r)}>
              <span className="ic">{navIcons[r]()}</span>
              {LABEL[r]}
              {r === 'review' && waiting > 0 && <span className="count">{waiting}</span>}
            </button>
          ))}
        </div>
        {m && (
          <button type="button" className={`side-month mood ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(monthKey + 'side', p) }} onClick={() => go('calendar', { calMonth: monthKey })}>
            <span className="k">{monthLabel(monthKey)}</span>
            <span className="t">{m.theme}</span>
          </button>
        )}
        <div className="side-year">This year: <i>{state.year.title}</i></div>
      </nav>

      <main className="main">
        {ui.route === 'today' && <Today />}
        {ui.route === 'calendar' && <Calendar />}
        {ui.route === 'review' && <Review />}
        {ui.route === 'strategy' && <Strategy />}
        {ui.route === 'funnel' && <Funnel />}
        {ui.route === 'results' && <Results />}
        {ui.route === 'accounts' && <Accounts />}
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {ROUTES.map((r) => (
          <button key={r} type="button" aria-current={ui.route === r ? 'page' : undefined} onClick={() => go(r)}>
            {navIcons[r]()}
            {LABEL[r]}
          </button>
        ))}
      </nav>

      {ui.toast && <div className="toast" role="status" key={ui.toast.at}>{ui.toast.text}</div>}
    </div>
  )
}
