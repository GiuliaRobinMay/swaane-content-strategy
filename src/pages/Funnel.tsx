import { useState } from 'react'
import type { ReactNode } from 'react'
import { Plus, Close } from '../components/Icons'
import { challengeEmails } from '../data/emails'
import { offers } from '../data/strategy'
import { ALL_DATES, bodyFor, offersIn, seriesFor } from '../lib/content'
import { longDate } from '../lib/dates'
import { app, uid, useApp } from '../lib/store'
import type { Magnet, MagnetKind, MagnetStatus } from '../lib/store'

const KIND_LABEL: Record<MagnetKind, string> = { challenge: 'Seven-day challenge', webinar: 'Webinar', giveaway: 'Giveaway', quiz: 'Quiz or test', other: 'Other' }
const KIND_TONE: Record<MagnetKind, string> = { challenge: 'var(--tile-rose)', webinar: 'var(--tile-sky)', giveaway: 'var(--tile-butter)', quiz: 'var(--tile-sage)', other: 'var(--tile-clay)' }
const STATUS_LABEL: Record<MagnetStatus, string> = { idea: 'Idea', planned: 'Planned', live: 'Live', done: 'Done' }

function Stage({ n, title, sub, last, children }: { n: number; title: string; sub: string; last?: boolean; children: ReactNode }) {
  return (
    <div className="stage">
      <div className="rail"><div className="node">{n}</div>{!last && <div className="line" />}</div>
      <div className="content">
        <div>
          <h2 className="h2">{title}</h2>
          <p className="muted" style={{ margin: '6px 0 0', maxWidth: '64ch' }}>{sub}</p>
        </div>
        {children}
      </div>
    </div>
  )
}

function MagnetCard({ m }: { m: Magnet }) {
  const update = (patch: Partial<Magnet>) => app.set((s) => ({ ...s, magnets: s.magnets.map((x) => (x.id === m.id ? { ...x, ...patch } : x)) }))
  const remove = () => app.set((s) => ({ ...s, magnets: s.magnets.filter((x) => x.id !== m.id) }))
  return (
    <div className="magnet" style={{ background: KIND_TONE[m.kind] }}>
      <div className="ft"><span className="kind">{KIND_LABEL[m.kind]}</span>
        <button type="button" className="link" style={{ color: 'inherit' }} aria-label={`Remove ${m.title}`} onClick={remove}><Close /></button>
      </div>
      <div className="ttl">{m.title}</div>
      <p>{m.description}</p>
      <div className="ft">
        <span>{m.date ? longDate(m.date) : 'No date yet'}</span>
        <select id={`magnet-${m.id}`} aria-label="Status" value={m.status} onChange={(e) => update({ status: e.target.value as MagnetStatus })}>
          {(Object.keys(STATUS_LABEL) as MagnetStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
    </div>
  )
}

export function Funnel() {
  const state = useApp()
  const [kind, setKind] = useState<MagnetKind>('webinar')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const invitations = ALL_DATES.filter((d) => seriesFor(d).key === 'helping')
  const tally = offers.map((o) => ({ o, n: ALL_DATES.filter((d) => offersIn(bodyFor(d, state)).some((x) => x.key === o.key)).length }))
  const max = Math.max(1, ...tally.map((t) => t.n))
  const sorted = [...state.magnets].sort((a, b) => (a.date ?? '9') < (b.date ?? '9') ? -1 : 1)

  function add() {
    if (!title.trim()) return
    app.set((s) => ({ ...s, magnets: [...s.magnets, { id: uid('mag'), kind, title: title.trim(), description: 'New idea. Describe what people receive and why they would sign up.', date: date || undefined, status: 'idea' }] }))
    setTitle('')
    setDate('')
  }

  return (
    <div className="page">
      <header style={{ display: 'grid', gap: 6 }}>
        <div className="eyebrow">Funnel</div>
        <h1 className="display">From a post <em>to a conversation</em></h1>
        <p className="lede">Daily posts build trust. A challenge, webinar, giveaway or quiz invites people to leave their email. The emails keep the conversation going, and lead to a free introductory call.</p>
      </header>

      <div className="flow">
        <Stage n={1} title="Posts" sub={`${ALL_DATES.length} posts from October 2026 to December 2027. Every Thursday (${invitations.length} in total) carries a clear invitation. This is how often each offer is mentioned across all posts.`}>
          <div className="card">
            <div className="offer-bars">
              {tally.map(({ o, n }) => (
                <div key={o.key} className="offer-bar">
                  <span>{o.name}{o.proposed ? <span className="muted"> · proposed</span> : null}</span>
                  <div className="bar"><i style={{ width: `${(n / max) * 100}%`, opacity: o.proposed ? 0.5 : 1 }} /></div>
                  <span className="v">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </Stage>

        <Stage n={2} title="Something to sign up for" sub="Each of these collects an email address. Ideas are suggestions to shape or delete. Only Say What You Need comes from the strategy itself.">
          <div className="magnets">
            {sorted.map((m) => <MagnetCard key={m.id} m={m} />)}
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="add-form">
              <label className="field"><span>Kind</span>
                <select id="new-kind" className="select" value={kind} onChange={(e) => setKind(e.target.value as MagnetKind)}>
                  {(Object.keys(KIND_LABEL) as MagnetKind[]).map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
                </select>
              </label>
              <label className="field"><span>Title</span><input id="new-title" className="input" placeholder="For example: A slow Sunday morning ritual" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /></label>
              <label className="field"><span>Date</span><input id="new-date" className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
              <button type="button" className="btn primary" onClick={add}><Plus />Add</button>
            </div>
          </div>
        </Stage>

        <Stage n={3} title="Email sign-up" sub="A short form on the sign-up page. No email provider is connected yet.">
          <div className="note-box">
            <p><strong>Next step:</strong> choose where the list lives, for example Flodesk or Kit. Once it is connected, new sign-ups and the nurture emails can appear here.</p>
          </div>
        </Stage>

        <Stage n={4} title="Nurture emails" sub="The seven emails of Say What You Need, as drafted in the strategy. A general welcome sequence can sit beside it later.">
          <div className="email-list">
            {challengeEmails.map((e) => (
              <details key={e.day}>
                <summary><span className="d">{e.day}</span><span className="s">{e.subject}</span></summary>
                <p className="b">{e.body}</p>
              </details>
            ))}
          </div>
        </Stage>

        <Stage n={5} title="A free introductory call" sub="Every path ends with the same simple step: a free conversation about one-to-one coaching." last>
          <div className="card pad" style={{ display: 'grid', gap: 8 }}>
            <div className="h3">One-to-one coaching and bodywork</div>
            <p className="read" style={{ margin: 0 }}>“Would you like support with this? Book a free introductory call to talk about what you’d like support with and see whether we’re a good fit.”</p>
          </div>
        </Stage>
      </div>
    </div>
  )
}
