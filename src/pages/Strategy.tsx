import { chapters, months, series as allSeries } from '../data/strategy'
import type { PostStatus } from '../data/types'
import { seriesIcons } from '../components/Icons'
import { ALL_DATES, monthFor, weeksIn } from '../lib/content'
import { MONTHS, WEEKDAYS, monthLabel, shortDate, todayISO } from '../lib/dates'
import { moodBackground, paletteFor } from '../lib/mood'
import { app, go, postOf, useApp } from '../lib/store'

const ORDER: PostStatus[] = ['posted', 'approved', 'reviewed', 'review']
const COLOR: Record<PostStatus, string> = { posted: 'var(--st-posted)', approved: 'var(--st-approved)', reviewed: 'var(--st-reviewed)', review: 'var(--line-2)' }
const DAY_FOR: Record<string, string> = { lesson: 'Monday', line: 'Tuesday', checkin: 'Wednesday', helping: 'Thursday', table: 'Friday', stories: 'Saturday', yourself: 'Sunday' }

export function Strategy() {
  const state = useApp()
  const nowKey = todayISO().slice(0, 7)
  const yp = paletteFor('2027-02')

  const setMonth = (key: string, field: 'theme' | 'hook' | 'movement', value: string) =>
    app.set((s) => ({ ...s, months: { ...s.months, [key]: { ...s.months[key], [field]: value } } }))
  const setWeek = (start: string, field: 'title' | 'question', value: string) =>
    app.set((s) => ({ ...s, weeks: { ...s.weeks, [start]: { ...s.weeks[start], [field]: value } } }))

  return (
    <div className="page">
      <header style={{ display: 'grid', gap: 6 }}>
        <div className="eyebrow">Strategy</div>
        <h1 className="display">The year, the months, <em>the weeks</em></h1>
        <p className="lede">Change a theme here and the calendar, the review feed and today’s page follow. The daily posts stay as written until you edit them.</p>
      </header>

      <section className="year-card mood on-dark" style={{ background: moodBackground('year', yp) }}>
        <div className="eyebrow" style={{ color: 'inherit', opacity: .85 }}>The yearly theme</div>
        <input id="year-title" className="year-input" aria-label="Yearly theme" value={state.year.title} onChange={(e) => app.set((s) => ({ ...s, year: { ...s.year, title: e.target.value } }))} />
        <textarea id="year-sub" className="year-sub" rows={2} aria-label="Yearly theme description" value={state.year.subtitle} onChange={(e) => app.set((s) => ({ ...s, year: { ...s.year, subtitle: e.target.value } }))} />
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 className="h2">Five <em>chapters</em></h2>
        <div className="chapters">
          {chapters.map((c) => (
            <div key={c.key} className="chapter">
              <div className="eyebrow">{c.months}</div>
              <div className="h3">{c.title}</div>
              <div className="q">“{c.question}”</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 className="h2">The weekly <em>rhythm</em></h2>
        <div className="rhythm">
          {allSeries.map((s) => (
            <div key={s.key} className="r">
              <div className="day">{DAY_FOR[s.key]}</div>
              <div>{seriesIcons[s.key](22)}</div>
              <div className="nm">{s.name}</div>
              <p>{s.purpose}</p>
              <p className="muted">{s.format}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gap: 12 }}>
        <h2 className="h2">Month by <em>month</em></h2>
        {months.map((base) => {
          const m = monthFor(base.key, state)!
          const p = paletteFor(base.key)
          const dates = ALL_DATES.filter((d) => d.startsWith(base.key))
          const tally = ORDER.map((st) => ({ st, n: dates.filter((d) => postOf(state, d).status === st).length }))
          return (
            <details key={base.key} className="month-block" open={base.key === nowKey}>
              <summary className="month-sum">
                <div className={`plate mood ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(base.key + 'band', p) }}>{MONTHS[Number(base.key.slice(5, 7)) - 1].slice(0, 3)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="eyebrow">{monthLabel(base.key)}</div>
                  <div className="t">{m.theme}</div>
                  <div className="h">{m.hook}</div>
                </div>
                <div className="stack" title="Posted, approved, reviewed, still to review">
                  {tally.map((t) => <i key={t.st} style={{ width: `${(t.n / dates.length) * 100}%`, background: COLOR[t.st] }} />)}
                </div>
              </summary>
              <div className="month-body">
                <div className="month-fields">
                  <label className="field"><span>Monthly theme</span><input id={`m-theme-${base.key}`} className="input" value={m.theme} onChange={(e) => setMonth(base.key, 'theme', e.target.value)} /></label>
                  <label className="field"><span>Seasonal hook</span><input id={`m-hook-${base.key}`} className="input" value={m.hook} onChange={(e) => setMonth(base.key, 'hook', e.target.value)} /></label>
                </div>
                <label className="field"><span>The movement this month</span><textarea id={`m-move-${base.key}`} className="textarea" style={{ minHeight: 60 }} value={m.movement} onChange={(e) => setMonth(base.key, 'movement', e.target.value)} /></label>
                <div className="field">
                  <span>Weekly subtopics</span>
                  <div className="week-list">
                    {weeksIn(base.key).map((w) => {
                      const ov = state.weeks[w.start] ?? {}
                      const wd = WEEKDAYS[new Date(w.start + 'T00:00:00Z').getUTCDay()].slice(0, 3)
                      return (
                        <div key={w.start} className="week-row">
                          <span className="when">{wd} {shortDate(w.start)}</span>
                          <input id={`w-title-${w.start}`} className="input" aria-label="Subtopic" value={ov.title ?? w.title} onChange={(e) => setWeek(w.start, 'title', e.target.value)} />
                          <input id={`w-q-${w.start}`} className="input" aria-label="Guiding question" placeholder="Guiding question" value={ov.question ?? w.question ?? ''} onChange={(e) => setWeek(w.start, 'question', e.target.value)} />
                          <button type="button" className="btn small ghost" onClick={() => go('calendar', { calMonth: base.key, selected: w.start })}>Open</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </details>
          )
        })}
      </section>
    </div>
  )
}
