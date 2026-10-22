import { PostContext, StatusPill, Visual } from '../components/Post'
import { Arrow, seriesIcons } from '../components/Icons'
import { chapters } from '../data/strategy'
import type { PostStatus } from '../data/types'
import { ALL_DATES, FIRST_DAY, LAST_DAY, bodyFor, headline, inRange, monthFor, seriesFor, weekFor } from '../lib/content'
import { MONTHS, WEEKDAYS, addDays, addMonths, daysBetween, greeting, longDate, mondayOf, monthLabel, todayISO } from '../lib/dates'
import { moodBackground, paletteFor } from '../lib/mood'
import { go, postOf, useApp } from '../lib/store'

const TODAY_IS: Record<string, string> = {
  lesson: 'Today opens the week with a lesson and a tiny dare.',
  line: 'Today is a line to keep.',
  checkin: 'Today is the midweek check-in.',
  helping: 'Today is a helping hand, with an invitation.',
  table: 'Today the Friday Table is set.',
  stories: 'Today is for love, leftovers and other stories.',
  yourself: 'Today is something for yourself.',
}

export function MonthBand({ monthKey, compact = false }: { monthKey: string; compact?: boolean }) {
  const state = useApp()
  const m = monthFor(monthKey, state)
  if (!m) return null
  const p = paletteFor(monthKey)
  const ch = chapters.find((c) => c.key === m.chapter)
  return (
    <section className={`band mood ${compact ? 'compact' : ''} ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(monthKey + 'band', p) }}>
      <div>
        <div className="k">{monthLabel(monthKey)} · {ch?.title}</div>
        <div className="t">{m.theme}</div>
        {!compact && <div className="hook">{m.hook}</div>}
      </div>
      {compact ? (
        <div className="hook" style={{ margin: 0, maxWidth: '38ch' }}>{m.hook}</div>
      ) : (
        <div style={{ display: 'grid', gap: 14, justifyItems: 'start' }}>
          <div className="move">{m.movement}</div>
          <button type="button" className="btn small" onClick={() => go('calendar', { calMonth: monthKey, selected: undefined })}>
            Open {MONTHS[Number(monthKey.slice(5, 7)) - 1]} <Arrow />
          </button>
        </div>
      )}
    </section>
  )
}

export function Today() {
  const state = useApp()
  const real = todayISO()
  const today = inRange(real) ? real : real < FIRST_DAY ? FIRST_DAY : LAST_DAY
  const week = weekFor(today, state)
  const s = seriesFor(today)
  const monthKey = today.slice(0, 7)
  const nextKey = addMonths(monthKey, 1)
  const next = monthFor(nextKey, state)
  const daysToNext = daysBetween(today, `${nextKey}-01`)

  const horizon = ALL_DATES.filter((d) => d >= today && d <= addDays(today, 13))
  const count = (st: PostStatus, dates: string[]) => dates.filter((d) => postOf(state, d).status === st).length
  const postedThisMonth = ALL_DATES.filter((d) => d.startsWith(monthKey) && postOf(state, d).status === 'posted').length

  const monday = mondayOf(today)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i)).filter(inRange)
  const tiles: { st: PostStatus; tone: string; label: string; n: number; sub: string }[] = [
    { st: 'review', tone: 'butter', label: 'Waiting for you', n: count('review', horizon), sub: 'in the next two weeks' },
    { st: 'reviewed', tone: 'sky', label: 'Reviewed', n: count('reviewed', horizon), sub: 'in the next two weeks' },
    { st: 'approved', tone: 'sage', label: 'Approved', n: count('approved', horizon), sub: 'ready to go out' },
    { st: 'posted', tone: 'rose', label: 'Posted', n: postedThisMonth, sub: `in ${MONTHS[Number(monthKey.slice(5, 7)) - 1]}` },
  ]

  return (
    <div className="page">
      <header className="hello">
        <div className="eyebrow">{longDate(real)}</div>
        <h1 className="display">{greeting()}, <em>{state.ownerName}</em></h1>
        <p className="lede">
          This week we are exploring <em>{week?.title.toLowerCase()}</em>. {TODAY_IS[s.key]}
          {today !== real ? ` The calendar starts on ${longDate(FIRST_DAY)}.` : ''}
        </p>
      </header>

      <section className="tiles" aria-label="Where things stand">
        {tiles.map((t) => (
          <button key={t.st} type="button" className={`tile ${t.tone}`} onClick={() => go('review', { reviewStatus: t.st, reviewMonth: 'all', reviewDate: undefined })}>
            <div className="top"><span>{t.label}</span><span className={`dot ${t.st}`} /></div>
            <div>
              <div className="num">{t.n}</div>
              <div className="sub">{t.sub}</div>
            </div>
          </button>
        ))}
      </section>

      <section className="feature" aria-label="Today’s post">
        <Visual date={today} />
        <div className="body">
          <div className="eyebrow">Today’s post</div>
          <h2 className="h2">{headline(bodyFor(today, state), s.key)}</h2>
          <PostContext date={today} />
          <p className="read" style={{ margin: 0 }}>{bodyFor(today, state)}</p>
          <div className="meta-row"><StatusPill status={postOf(state, today).status} /></div>
          <div className="actions">
            <button type="button" className="btn primary" onClick={() => go('review', { reviewStatus: 'all', reviewMonth: 'all', reviewDate: today })}>Review today’s post</button>
            <button type="button" className="btn" onClick={() => go('calendar', { calMonth: monthKey, selected: today })}>Open in calendar</button>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gap: 14 }}>
        <div className="section-head">
          <h2 className="h2">This week, <em>{week?.title.toLowerCase()}</em></h2>
          {week?.question && <span className="muted" style={{ fontFamily: 'var(--read)', fontStyle: 'italic', fontSize: 17 }}>“{week.question}”</span>}
        </div>
        <div className="dailies">
          {weekDates.map((d) => {
            const p = paletteFor(d)
            const sr = seriesFor(d)
            const st = postOf(state, d).status
            return (
              <button key={d} type="button" className={`daily ${d === real ? 'is-today' : ''}`} onClick={() => go('calendar', { calMonth: d.slice(0, 7), selected: d })}>
                <div className={`plate mood ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(d, p) }}>
                  <div className="wd">{WEEKDAYS[new Date(d + 'T00:00:00Z').getUTCDay()].slice(0, 3)} {Number(d.slice(8))}</div>
                  <div className="hl">{headline(bodyFor(d, state), sr.key)}</div>
                </div>
                <div className="cap"><span className={`dot ${st}`} />{seriesIcons[sr.key](16)}{sr.short}</div>
              </button>
            )
          })}
        </div>
      </section>

      <MonthBand monthKey={monthKey} />

      {next && (
        <p className="muted" style={{ margin: 0, fontFamily: 'var(--read)', fontSize: 17 }}>
          In {daysToNext} {daysToNext === 1 ? 'day' : 'days'}, {monthLabel(nextKey)} turns to <i style={{ fontFamily: 'var(--display)', fontSize: 20, color: 'var(--ink)' }}>{next.theme.toLowerCase()}</i>: {next.hook.toLowerCase()}.
        </p>
      )}
    </div>
  )
}
