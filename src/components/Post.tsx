import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PostStatus } from '../data/types'
import { bodyFor, headline, holidaysOn, monthFor, offersIn, seedBody, seriesFor, weekFor } from '../lib/content'
import { longDate, todayISO } from '../lib/dates'
import { deleteMedia, putMedia, useMediaUrl } from '../lib/media'
import { moodBackground, paletteFor } from '../lib/mood'
import { go, postOf, toast, uid, updatePost, useApp } from '../lib/store'
import type { MediaRef } from '../lib/store'
import { Check, Close, Copy, Upload, seriesIcons } from './Icons'

export const STATUS_LABEL: Record<PostStatus, string> = {
  review: 'Ready for review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  posted: 'Posted',
}
export const STATUSES: PostStatus[] = ['review', 'reviewed', 'approved', 'posted']

export function SeriesTag({ date }: { date: string }) {
  const s = seriesFor(date)
  return (
    <span className="series-tag">
      <span className="g">{seriesIcons[s.key](17)}</span>
      {s.name}
    </span>
  )
}

export function StatusPill({ status }: { status: PostStatus }) {
  return (
    <span className="status-pill">
      <span className={`dot ${status}`} />
      {STATUS_LABEL[status]}
    </span>
  )
}

/** The post as it could look on Instagram: the seasonal plate with the key line, or the first uploaded image or video. */
export function Visual({ date, compact = false }: { date: string; compact?: boolean }) {
  const state = useApp()
  const post = postOf(state, date)
  const first = post.media?.find((m) => m.type.startsWith('image') || m.type.startsWith('video')) ?? post.media?.[0]
  const url = useMediaUrl(first?.id)
  const p = paletteFor(date)
  const s = seriesFor(date)

  if (first && url) {
    return (
      <div className="visual media">
        {first.type.startsWith('image') && <img src={url} alt={first.name} />}
        {first.type.startsWith('video') && <video src={url} controls playsInline />}
        {first.type.startsWith('audio') && (
          <div className="audio-wrap mood on-dark" style={{ background: moodBackground(date, p) }}>
            <audio src={url} controls style={{ width: '100%' }} />
          </div>
        )}
      </div>
    )
  }
  return (
    <div className={`visual mood ${p.text === 'light' ? 'on-dark' : 'on-light'}`} style={{ background: moodBackground(date, p) }}>
      <div className="vk">
        <span>{s.short}</span>
        {!compact && <span>{longDate(date).split(' ').slice(1, 3).join(' ')}</span>}
      </div>
      <div className="vh">{headline(bodyFor(date, state), s.key)}</div>
      <div className="vf">swaane</div>
    </div>
  )
}

export function StatusControl({ date }: { date: string }) {
  const state = useApp()
  const status = postOf(state, date).status
  return (
    <div className="status-ctl" role="group" aria-label="Status">
      {STATUSES.map((s) => (
        <button
          key={s}
          type="button"
          aria-pressed={status === s}
          onClick={() => updatePost(date, { status: s, postedAt: s === 'posted' ? postOf(state, date).postedAt ?? todayISO() : undefined })}
        >
          <span className={`dot ${s}`} />
          {s === 'review' ? 'For review' : STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  )
}

function MediaThumb({ m, onRemove }: { m: MediaRef; onRemove: () => void }) {
  const url = useMediaUrl(m.id)
  return (
    <div className="media-item" title={m.name}>
      {url && m.type.startsWith('image') && <img src={url} alt={m.name} />}
      {url && m.type.startsWith('video') && <video src={url} muted playsInline />}
      {(!url || m.type.startsWith('audio')) && <span className="kind">{m.type.startsWith('audio') ? 'Audio' : 'File'}<br />{m.name.slice(0, 18)}</span>}
      <button type="button" className="rm" aria-label={`Remove ${m.name}`} onClick={onRemove}><Close /></button>
    </div>
  )
}

export function MediaSection({ date }: { date: string }) {
  const state = useApp()
  const media = postOf(state, date).media ?? []
  const input = useRef<HTMLInputElement>(null)

  async function onFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    const added: MediaRef[] = []
    let stored = true
    for (const f of files) {
      const id = uid('media')
      stored = (await putMedia(id, f)) && stored
      added.push({ id, name: f.name, type: f.type || 'application/octet-stream', size: f.size })
    }
    updatePost(date, { media: [...(postOf(state, date).media ?? []), ...added] })
    toast(stored ? `${added.length === 1 ? 'File' : 'Files'} added` : 'Added for this visit only. This browser is not saving files.')
  }
  function remove(m: MediaRef) {
    deleteMedia(m.id)
    updatePost(date, { media: media.filter((x) => x.id !== m.id) })
  }
  return (
    <div className="field">
      <span>Image, audio or video</span>
      <div className="media-list">
        {media.map((m) => <MediaThumb key={m.id} m={m} onRemove={() => remove(m)} />)}
        <button type="button" className="drop" onClick={() => input.current?.click()}>
          <Upload />
          Add file
        </button>
        <input ref={input} id={`media-${date}`} type="file" accept="image/*,video/*,audio/*" multiple hidden onChange={onFiles} />
      </div>
    </div>
  )
}

async function copyText(text: string, fallback: HTMLTextAreaElement | null) {
  try {
    await navigator.clipboard.writeText(text)
    toast('Caption copied')
  } catch {
    if (fallback) {
      fallback.focus()
      fallback.select()
    }
    toast('Copying is blocked here. The caption is selected, so press copy on your keyboard.')
  }
}

/** Caption, offers, media, notes and the posting actions. Shared by the calendar panel and the review feed. */
export function PostEditor({ date, showStatus = true }: { date: string; showStatus?: boolean }) {
  const state = useApp()
  const post = postOf(state, date)
  const body = bodyFor(date, state)
  const original = seedBody(date)
  const ta = useRef<HTMLTextAreaElement>(null)
  const [editing, setEditing] = useState(false)
  const offers = offersIn(body)
  const account = state.accounts.find((a) => a.id === post.accountId)

  return (
    <div className="editor">
      {showStatus && <StatusControl date={date} />}

      <div className="field">
        <span>Caption</span>
        {editing ? (
          <textarea
            ref={ta}
            id={`caption-${date}`}
            className="textarea read"
            value={body}
            onChange={(e) => updatePost(date, { body: e.target.value === original ? undefined : e.target.value })}
            autoFocus
          />
        ) : (
          <div className="read" style={{ whiteSpace: 'pre-wrap' }}>{body}</div>
        )}
        <div className="actions">
          <button type="button" className="btn small" onClick={() => setEditing((v) => !v)}>{editing ? 'Done editing' : 'Edit caption'}</button>
          {post.body !== undefined && (
            <button type="button" className="btn small ghost" onClick={() => updatePost(date, { body: undefined })}>Restore original</button>
          )}
          <button type="button" className="btn small ghost" onClick={() => copyText(body, ta.current)}><Copy />Copy caption</button>
        </div>
      </div>

      {offers.length > 0 && (
        <div className="field">
          <span>Invitation in this post</span>
          <div className="offers">
            {offers.map((o) => <span key={o.key} className={`chip ${o.proposed ? 'proposed' : 'offer'}`}>{o.name}{o.proposed ? ' · proposed' : ''}</span>)}
          </div>
        </div>
      )}

      <MediaSection date={date} />

      <div className="field">
        <span>Notes for yourself</span>
        <textarea
          id={`notes-${date}`}
          className="textarea"
          placeholder="A photo idea, a change to make, a reply to plan…"
          value={post.notes ?? ''}
          onChange={(e) => updatePost(date, { notes: e.target.value || undefined })}
        />
      </div>

      <div className="field">
        <span>Post to</span>
        {state.accounts.length ? (
          <select id={`acc-${date}`} className="select" value={post.accountId ?? ''} onChange={(e) => updatePost(date, { accountId: e.target.value || undefined })}>
            <option value="">Choose an account</option>
            {state.accounts.map((a) => <option key={a.id} value={a.id}>{a.platform === 'instagram' ? 'Instagram' : a.platform[0].toUpperCase() + a.platform.slice(1)} · @{a.handle}</option>)}
          </select>
        ) : (
          <p className="muted small" style={{ margin: 0 }}>
            No accounts yet. <button type="button" className="link" onClick={() => go('accounts')}>Add Instagram or Facebook</button>
          </p>
        )}
        <div className="actions" style={{ marginTop: 6 }}>
          <button type="button" className="btn primary" disabled title="Direct publishing needs a connected Meta app. See Accounts.">
            Publish{account ? ` to @${account.handle}` : ''}
          </button>
          {post.status !== 'posted' ? (
            <button type="button" className="btn" onClick={() => { updatePost(date, { status: 'posted', postedAt: todayISO() }); toast('Marked as posted') }}>
              <Check />Mark as posted
            </button>
          ) : (
            <span className="status-pill"><span className="dot posted" />Posted{post.postedAt ? ` on ${longDate(post.postedAt)}` : ''}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function PostContext({ date }: { date: string }) {
  const state = useApp()
  const w = weekFor(date, state)
  const m = monthFor(date.slice(0, 7), state)
  const hol = holidaysOn(date)
  return (
    <div className="meta-row">
      <SeriesTag date={date} />
      {hol.map((h) => <span key={h} className="chip holiday">{h}</span>)}
      <span className="small muted">
        {m ? <><i style={{ fontFamily: 'var(--display)', fontSize: 16, color: 'var(--ink-2)' }}>{m.theme}</i> · </> : null}
        {w?.title}
      </span>
    </div>
  )
}
