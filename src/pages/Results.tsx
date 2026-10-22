import { headline, bodyFor, seriesFor, ALL_DATES } from '../lib/content'
import { series as allSeries } from '../data/strategy'
import { shortDate } from '../lib/dates'
import { go, postOf, updatePost, useApp } from '../lib/store'
import type { Metrics } from '../lib/store'

const FIELDS: { key: keyof Metrics; label: string }[] = [
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'saves', label: 'Saves' },
  { key: 'shares', label: 'Shares' },
  { key: 'reach', label: 'Reach' },
]
const engagement = (m: Metrics = {}) => {
  const e = (m.likes ?? 0) + (m.comments ?? 0) + (m.saves ?? 0) + (m.shares ?? 0)
  return m.reach ? e / m.reach : undefined
}
const fmtPct = (n?: number) => (n === undefined ? '–' : `${(n * 100).toFixed(1)}%`)

export function Results() {
  const state = useApp()
  const posted = ALL_DATES.filter((d) => postOf(state, d).status === 'posted')
  const withData = posted.filter((d) => FIELDS.some((f) => postOf(state, d).metrics?.[f.key] !== undefined))
  const sum = (k: keyof Metrics) => posted.reduce((a, d) => a + (postOf(state, d).metrics?.[k] ?? 0), 0)

  const setMetric = (d: string, k: keyof Metrics, v: string) => {
    const n = v === '' ? undefined : Math.max(0, Math.round(Number(v)))
    updatePost(d, { metrics: { ...postOf(state, d).metrics, [k]: Number.isFinite(n as number) ? n : undefined } })
  }

  const bySeries = allSeries.map((s) => {
    const rates = withData.filter((d) => seriesFor(d).key === s.key).map((d) => engagement(postOf(state, d).metrics)).filter((x): x is number => x !== undefined)
    return { s, n: rates.length, avg: rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : undefined }
  })

  return (
    <div className="page">
      <header style={{ display: 'grid', gap: 6 }}>
        <div className="eyebrow">Results</div>
        <h1 className="display">What <em>resonated</em></h1>
        <p className="lede">Every post you mark as posted appears here. Add likes, comments, saves and reach by hand for now. Once Instagram is connected, these numbers can arrive by themselves.</p>
      </header>

      {posted.length === 0 ? (
        <div className="empty-state card">
          <div className="h2">Nothing posted <em>yet</em></div>
          <p>When a post goes out, open it and choose “Mark as posted”. It will appear here, ready for its numbers.</p>
          <button type="button" className="btn primary" onClick={() => go('review', { reviewStatus: 'approved', reviewMonth: 'all', reviewDate: undefined })}>See approved posts</button>
        </div>
      ) : (
        <>
          <section className="tiles">
            <div className="tile rose" style={{ cursor: 'default' }}><div className="top"><span>Posted</span></div><div><div className="num">{posted.length}</div><div className="sub">{withData.length} with numbers</div></div></div>
            <div className="tile butter" style={{ cursor: 'default' }}><div className="top"><span>Likes</span></div><div><div className="num">{sum('likes')}</div><div className="sub">across posted days</div></div></div>
            <div className="tile sage" style={{ cursor: 'default' }}><div className="top"><span>Saves</span></div><div><div className="num">{sum('saves')}</div><div className="sub">a sign of real value</div></div></div>
            <div className="tile sky" style={{ cursor: 'default' }}><div className="top"><span>Comments</span></div><div><div className="num">{sum('comments')}</div><div className="sub">conversations started</div></div></div>
          </section>

          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Day</th><th>Series</th><th>Post</th>
                  {FIELDS.map((f) => <th key={f.key} className="num">{f.label}</th>)}
                  <th className="num">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {posted.map((d) => {
                  const m = postOf(state, d).metrics ?? {}
                  return (
                    <tr key={d}>
                      <td style={{ whiteSpace: 'nowrap' }}>{shortDate(d)}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{seriesFor(d).short}</td>
                      <td className="hl">{headline(bodyFor(d, state), seriesFor(d).key)}</td>
                      {FIELDS.map((f) => (
                        <td key={f.key} className="num">
                          <input id={`m-${d}-${f.key}`} type="number" min={0} inputMode="numeric" aria-label={`${f.label} on ${d}`} value={m[f.key] ?? ''} onChange={(e) => setMetric(d, f.key, e.target.value)} />
                        </td>
                      ))}
                      <td className="num">{fmtPct(engagement(m))}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {withData.length > 0 && (
            <section style={{ display: 'grid', gap: 12 }}>
              <h2 className="h2">By <em>series</em></h2>
              <p className="muted" style={{ margin: 0 }}>Engagement is likes, comments, saves and shares divided by reach. Only posts with a reach figure count.</p>
              <div className="rhythm">
                {bySeries.map(({ s, n, avg }) => (
                  <div key={s.key} className="r">
                    <div className="day">{s.short}</div>
                    <div className="nm" style={{ fontSize: 30 }}>{fmtPct(avg)}</div>
                    <p className="muted">{n} {n === 1 ? 'post' : 'posts'} measured</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
