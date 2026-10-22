import { useEffect } from 'react'
import { PostContext, STATUS_LABEL, STATUSES, Visual, PostEditor } from '../components/Post'
import { Arrow } from '../components/Icons'
import type { PostStatus } from '../data/types'
import { ALL_DATES, bodyFor, headline, seriesFor } from '../lib/content'
import { longDate, monthLabel, todayISO } from '../lib/dates'
import { moodBackground, paletteFor } from '../lib/mood'
import { postOf, toast, uiStore, updatePost, useApp, useUi } from '../lib/store'

const MONTH_KEYS = Array.from(new Set(ALL_DATES.map((d) => d.slice(0, 7))))

export function Review() {
  const state = useApp()
  const ui = useUi()

  const inMonth = (d: string) => ui.reviewMonth === 'all' || d.startsWith(ui.reviewMonth)
  const counts: Record<PostStatus | 'all', number> = { all: 0, review: 0, reviewed: 0, approved: 0, posted: 0 }
  for (const d of ALL_DATES) {
    if (!inMonth(d)) continue
    counts.all++
    counts[postOf(state, d).status]++
  }
  const list = ALL_DATES.filter((d) => inMonth(d) && (ui.reviewStatus === 'all' || postOf(state, d).status === ui.reviewStatus))

  // Keep the current card stable: stay on the chosen date, or on the next one after it.
  let current = ui.reviewDate && list.includes(ui.reviewDate) ? ui.reviewDate : undefined
  const from = ui.reviewDate ?? todayISO()
  if (!current && list.length) current = list.find((d) => d >= from) ?? list[list.length - 1]
  const idx = current ? list.indexOf(current) : -1

  const move = (step: number) => {
    const next = list[idx + step]
    if (next) uiStore.set({ reviewDate: next })
  }
  const setStatus = (st: PostStatus) => {
    if (!current) return
    const after = list[idx + 1]
    updatePost(current, { status: st, ...(st === 'posted' ? { postedAt: postOf(state, current).postedAt ?? new Date().toISOString().slice(0, 10) } : {}) })
    toast(`${STATUS_LABEL[st]}: ${longDate(current)}`)
    if (ui.reviewStatus !== 'all' && ui.reviewStatus !== st) uiStore.set({ reviewDate: after })
    else if (after) uiStore.set({ reviewDate: after })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT' || t.tagName === 'SELECT')) return
      if (e.key === 'ArrowRight' || e.key === 'j') move(1)
      else if (e.key === 'ArrowLeft' || e.key === 'k') move(-1)
      else if (e.key === 'r') setStatus('reviewed')
      else if (e.key === 'a') setStatus('approved')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const upNext = idx >= 0 ? list.slice(idx + 1, idx + 7) : []

  return (
    <div className="page">
      <header style={{ display: 'grid', gap: 6 }}>
        <div className="eyebrow">Review feed</div>
        <h1 className="display">One post <em>at a time</em></h1>
      </header>

      <div className="review-top">
        <div className="seg" role="group" aria-label="Status">
          {(['review', 'reviewed', 'approved', 'posted', 'all'] as const).map((st) => (
            <button key={st} type="button" aria-pressed={ui.reviewStatus === st} onClick={() => uiStore.set({ reviewStatus: st })}>
              {st !== 'all' && <span className={`dot ${st}`} />}
              {st === 'all' ? 'All' : STATUS_LABEL[st]}
              <span className="n">{counts[st]}</span>
            </button>
          ))}
        </div>
        <select id="review-month" className="select" style={{ width: 'auto', borderRadius: 999 }} value={ui.reviewMonth} onChange={(e) => uiStore.set({ reviewMonth: e.target.value })}>
          <option value="all">All months</option>
          {MONTH_KEYS.map((k) => <option key={k} value={k}>{monthLabel(k)}</option>)}
        </select>
      </div>

      {!current ? (
        <div className="empty-state card">
          <div className="h2">Nothing <em>here</em></div>
          <p>
            {ui.reviewStatus === 'review'
              ? 'Every post in this selection has been reviewed. Choose another status or month to keep going.'
              : `No posts are ${STATUS_LABEL[ui.reviewStatus as PostStatus]?.toLowerCase() ?? 'here'} in this selection yet.`}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 8 }}>
            <div className="review-nav">
              <span className="small muted">{idx + 1} of {list.length}</span>
              <span className="small muted">Keys: <span className="kbd">←</span> <span className="kbd">→</span> to move, <span className="kbd">r</span> reviewed, <span className="kbd">a</span> approve</span>
            </div>
            <div className="progress"><i style={{ width: `${((idx + 1) / list.length) * 100}%` }} /></div>
          </div>

          <article className="review-card" key={current}>
            <div style={{ display: 'grid', gap: 10 }}>
              <Visual date={current} />
              <p className="visual-note">A visual draft from the month’s colours. Add her own photo or video below to replace it.</p>
            </div>
            <div className="review-side">
              <div className="review-nav">
                <button type="button" className="icon-btn" aria-label="Previous post" disabled={idx <= 0} onClick={() => move(-1)}><Arrow dir="left" /></button>
                <div style={{ textAlign: 'center' }}>
                  <div className="eyebrow">{longDate(current)}</div>
                </div>
                <button type="button" className="icon-btn" aria-label="Next post" disabled={idx >= list.length - 1} onClick={() => move(1)}><Arrow /></button>
              </div>
              <PostContext date={current} />
              <h2 className="h2">{headline(bodyFor(current, state), seriesFor(current).key)}</h2>
              <div className="actions">
                <button type="button" className="btn" onClick={() => setStatus('review')}>Send back for review</button>
                <button type="button" className="btn" onClick={() => setStatus('reviewed')}><span className="dot reviewed" />Mark reviewed</button>
                <button type="button" className="btn primary" onClick={() => setStatus('approved')}>Approve</button>
              </div>
              <hr className="hr" />
              <PostEditor date={current} showStatus={false} />
            </div>
          </article>

          {upNext.length > 0 && (
            <section style={{ display: 'grid', gap: 12 }}>
              <h2 className="h3">Up next</h2>
              <div className="dailies">
                {upNext.map((d) => {
                  const p = paletteFor(d)
                  const sr = seriesFor(d)
                  return (
                    <button key={d} type="button" className="daily" onClick={() => uiStore.set({ reviewDate: d })}>
                      <div className={`plate mood ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(d, p) }}>
                        <div className="wd">{longDate(d).split(' ').slice(0, 3).join(' ')}</div>
                        <div className="hl">{headline(bodyFor(d, state), sr.key)}</div>
                      </div>
                      <div className="cap"><span className={`dot ${postOf(state, d).status}`} />{sr.short}</div>
                    </button>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}
      <p className="small muted" style={{ margin: 0 }}>Statuses: {STATUSES.map((s) => STATUS_LABEL[s]).join(', then ')}.</p>
    </div>
  )
}
