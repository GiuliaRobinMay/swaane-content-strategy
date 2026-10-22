import { useEffect } from 'react'
import { PostContext, StatusPill, Visual, PostEditor } from '../components/Post'
import { Arrow, Close, seriesIcons } from '../components/Icons'
import { series as allSeries, seriesByWeekday } from '../data/strategy'
import { FIRST_MONTH, LAST_MONTH, bodyFor, headline, holidaysOn, inRange, monthInRange, seriesFor, weekFor } from '../lib/content'
import { MONTHS, WEEK_ORDER, WEEKDAYS, addMonths, longDate, monthGrid, shortDate, todayISO } from '../lib/dates'
import { moodBackground, paletteFor } from '../lib/mood'
import { go, postOf, uiStore, useApp, useUi } from '../lib/store'
import { MonthBand } from './Today'

function DayPanel({ date }: { date: string }) {
  const close = () => uiStore.set({ selected: undefined })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <aside className="panel" aria-label={`Post for ${longDate(date)}`}>
      <div className="panel-head">
        <div>
          <div className="eyebrow">{longDate(date)}</div>
          <div style={{ marginTop: 8 }}><PostContext date={date} /></div>
        </div>
        <button type="button" className="icon-btn" aria-label="Close" onClick={close}><Close /></button>
      </div>
      <div className="panel-visual"><Visual date={date} /></div>
      <PostEditor date={date} />
      <button type="button" className="btn" onClick={() => go('review', { reviewStatus: 'all', reviewMonth: 'all', reviewDate: date })}>Open in the review feed <Arrow /></button>
    </aside>
  )
}

export function Calendar() {
  const state = useApp()
  const ui = useUi()
  const key = ui.calMonth
  const year = Number(key.slice(0, 4))
  const month = Number(key.slice(5, 7))
  const today = todayISO()
  const rows = monthGrid(key)
  const p = paletteFor(key)
  const sel = ui.selected && inRange(ui.selected) ? ui.selected : undefined

  const setMonth = (k: string) => monthInRange(k) && uiStore.set({ calMonth: k, selected: undefined })
  const setYear = (y: number) => {
    let k = `${y}-${String(month).padStart(2, '0')}`
    if (k < FIRST_MONTH) k = FIRST_MONTH
    if (k > LAST_MONTH) k = LAST_MONTH
    setMonth(k)
  }

  return (
    <div className="page">
      <div className="cal-head">
        <div className="eyebrow">Content calendar</div>
        <div className="cal-center">
          <div className="seg" role="group" aria-label="Year">
            {[2026, 2027].map((y) => (
              <button key={y} type="button" aria-pressed={y === year} onClick={() => setYear(y)}>{y}</button>
            ))}
          </div>
          <div className="cal-title">
            <button type="button" className="icon-btn" aria-label="Previous month" disabled={key <= FIRST_MONTH} onClick={() => setMonth(addMonths(key, -1))}><Arrow dir="left" /></button>
            <h1 className="h2">{MONTHS[month - 1]} <em>{year}</em></h1>
            <button type="button" className="icon-btn" aria-label="Next month" disabled={key >= LAST_MONTH} onClick={() => setMonth(addMonths(key, 1))}><Arrow /></button>
          </div>
          <div className="months-strip" role="group" aria-label="Months">
            {MONTHS.map((name, i) => {
              const k = `${year}-${String(i + 1).padStart(2, '0')}`
              return (
                <button key={k} type="button" title={name} aria-pressed={k === key} disabled={!monthInRange(k)} onClick={() => setMonth(k)}>
                  {name[0]}
                </button>
              )
            })}
          </div>
        </div>
        <div className="cal-right">
          <button type="button" className="btn small" onClick={() => monthInRange(today.slice(0, 7)) && uiStore.set({ calMonth: today.slice(0, 7), selected: today })}>Today</button>
        </div>
      </div>

      <MonthBand monthKey={key} compact />

      <div className={`cal-wrap ${sel ? 'with-panel' : ''}`}>
        <div className="cal" role="grid" aria-label={`${MONTHS[month - 1]} ${year}`}>
          <div className="cal-row" role="row">
            <div className="cal-dow spacer"><div className="d">Week</div><div className="s">The subtopic</div></div>
            {WEEK_ORDER.map((wd) => {
              const sr = allSeries.find((x) => x.key === seriesByWeekday[wd])!
              return (
                <div key={wd} className="cal-dow" role="columnheader">
                  <div className="d">{WEEKDAYS[wd].slice(0, 3)}</div>
                  <div className="s">{seriesIcons[sr.key](14)}{sr.short}</div>
                </div>
              )
            })}
          </div>
          {rows.map((row) => {
            const anchor = inRange(row[0]) ? row[0] : row.find(inRange)
            const w = anchor ? weekFor(anchor, state) : undefined
            return (
              <div key={row[0]} className="cal-row" role="row">
                <div className="cal-week">
                  <div className="wk">Week of {shortDate(row[0])}</div>
                  {w && <div className="wt">{w.title}</div>}
                </div>
                {row.map((d) => {
                  const inMonth = d.startsWith(key)
                  if (!inRange(d)) return <div key={d} className="cell empty" aria-hidden="true"><div className="top"><span className="num">{Number(d.slice(8))}</span></div></div>
                  const sr = seriesFor(d)
                  const st = postOf(state, d).status
                  const hol = holidaysOn(d)
                  const dp = paletteFor(d)
                  return (
                    <button
                      key={d}
                      type="button"
                      role="gridcell"
                      className={`cell ${inMonth ? '' : 'out'} ${d === today ? 'today' : ''}`}
                      aria-pressed={d === sel}
                      aria-label={`${longDate(d)}, ${sr.name}`}
                      onClick={() => uiStore.set({ selected: d, ...(inMonth ? {} : { calMonth: d.slice(0, 7) }) })}
                    >
                      <div className="top">
                        <span className="num">{Number(d.slice(8))}</span>
                        <span className={`dot ${st}`} title={st} />
                      </div>
                      <div className="swatch" style={{ background: `linear-gradient(90deg, ${dp.base}, ${dp.a}, ${dp.b})` }} />
                      <div className="sr">{seriesIcons[sr.key](14)}{sr.short}</div>
                      {hol.map((h) => <div key={h} className="hol">{h}</div>)}
                      <div className="ex">{headline(bodyFor(d, state), sr.key)}</div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div className="agenda">
          {rows.map((row) => {
            const days = row.filter((d) => d.startsWith(key) && inRange(d))
            if (!days.length) return null
            const w = weekFor(days[0], state)
            return (
              <div key={row[0]} style={{ display: 'grid', gap: 8 }}>
                <div className="agenda-week">{w?.title}</div>
                {days.map((d) => {
                  const sr = seriesFor(d)
                  const st = postOf(state, d).status
                  return (
                    <button key={d} type="button" className="agenda-item" onClick={() => uiStore.set({ selected: d })}>
                      <div className={`thumb mood ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(d, paletteFor(d)) }}>{Number(d.slice(8))}</div>
                      <div style={{ display: 'grid', gap: 4, minWidth: 0 }}>
                        <div className="meta-row" style={{ gap: 8 }}>
                          <span className="small" style={{ fontWeight: 600 }}>{WEEKDAYS[new Date(d + 'T00:00:00Z').getUTCDay()]}</span>
                          <span className="small muted" style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>{seriesIcons[sr.key](14)}{sr.short}</span>
                          <StatusPill status={st} />
                        </div>
                        <div className="t">{headline(bodyFor(d, state), sr.key)}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {sel && <DayPanel key={sel} date={sel} />}
      </div>
    </div>
  )
}
