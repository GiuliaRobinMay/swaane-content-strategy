import { useState } from 'react'
import { Close, Copy, Plus } from '../components/Icons'
import { app, uid, useApp, toast } from '../lib/store'
import type { AppState, Platform } from '../lib/store'

const PLATFORMS: { key: Platform; name: string; short: string }[] = [
  { key: 'instagram', name: 'Instagram', short: 'IG' },
  { key: 'facebook', name: 'Facebook', short: 'f' },
  { key: 'threads', name: 'Threads', short: '@' },
  { key: 'tiktok', name: 'TikTok', short: 'TT' },
  { key: 'linkedin', name: 'LinkedIn', short: 'in' },
]

export function Accounts() {
  const state = useApp()
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [handle, setHandle] = useState('')
  const [exported, setExported] = useState('')
  const [incoming, setIncoming] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const add = () => {
    const h = handle.trim().replace(/^@/, '')
    if (!h) return
    app.set((s) => ({ ...s, accounts: [...s.accounts, { id: uid('acc'), platform, handle: h }] }))
    setHandle('')
    toast('Account added')
  }
  const remove = (id: string) => app.set((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }))

  const doExport = async () => {
    const json = JSON.stringify(app.get(), null, 1)
    setExported(json)
    try {
      await navigator.clipboard.writeText(json)
      toast('All data copied')
    } catch {
      toast('Copying is blocked here. Select the text below and copy it.')
    }
  }
  const doImport = () => {
    try {
      const parsed = JSON.parse(incoming) as AppState
      if (parsed.version !== 1 || typeof parsed.posts !== 'object') throw new Error('shape')
      app.replace(parsed)
      setIncoming('')
      toast('Data imported')
    } catch {
      toast('That text is not a valid export from this studio.')
    }
  }

  return (
    <div className="page">
      <header style={{ display: 'grid', gap: 6 }}>
        <div className="eyebrow">Accounts and settings</div>
        <h1 className="display">Where the posts <em>go</em></h1>
      </header>

      <div className="two-col">
        <section style={{ display: 'grid', gap: 14 }}>
          <h2 className="h2">Social <em>accounts</em></h2>
          <div className="acc-list">
            {state.accounts.length === 0 && <p className="muted" style={{ margin: 0 }}>No accounts yet. Add each Instagram and Facebook account you post to; you can choose one per post.</p>}
            {state.accounts.map((a) => {
              const p = PLATFORMS.find((x) => x.key === a.platform)!
              return (
                <div key={a.id} className="acc">
                  <div className={`logo ${a.platform}`}>{p.short}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>@{a.handle}</div>
                    <div className="small muted">{p.name} · not connected for publishing</div>
                  </div>
                  <button type="button" className="btn small" disabled title="Needs a Meta app, see the note">Connect</button>
                  <button type="button" className="icon-btn" aria-label={`Remove @${a.handle}`} onClick={() => remove(a.id)}><Close /></button>
                </div>
              )
            })}
          </div>
          <div className="card" style={{ padding: 16, display: 'grid', gap: 10 }}>
            <div className="add-form" style={{ gridTemplateColumns: '150px minmax(0,1fr) auto' }}>
              <label className="field"><span>Platform</span>
                <select id="acc-platform" className="select" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}>
                  {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}
                </select>
              </label>
              <label className="field"><span>Handle</span><input id="acc-handle" className="input" placeholder="@swaane" value={handle} onChange={(e) => setHandle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /></label>
              <button type="button" className="btn primary" onClick={add}><Plus />Add</button>
            </div>
          </div>
          <div className="note-box">
            <strong>About posting directly from here</strong>
            <p>Publishing to Instagram and Facebook goes through Meta. It needs a Meta developer app with Instagram publishing approved, a business or creator account linked to a Facebook page, and a small server that keeps the login safe. That is the next building step.</p>
            <p>Until then, each post has “Copy caption” and “Mark as posted”, and the results page takes the numbers by hand.</p>
          </div>
        </section>

        <section style={{ display: 'grid', gap: 14 }}>
          <h2 className="h2">Your <em>studio</em></h2>
          <div className="card pad" style={{ display: 'grid', gap: 14 }}>
            <label className="field"><span>Name in the greeting</span><input id="owner-name" className="input" value={state.ownerName} onChange={(e) => app.set((s) => ({ ...s, ownerName: e.target.value }))} /></label>
            <p className="small muted" style={{ margin: 0 }}>Edits, statuses and notes are saved in this browser. Uploaded files are saved in this browser too. Copy your data now and then to keep a backup, or to move it to another device.</p>
            <div className="actions">
              <button type="button" className="btn" onClick={doExport}><Copy />Copy all data</button>
              {!confirmReset ? (
                <button type="button" className="btn ghost" onClick={() => setConfirmReset(true)}>Start over</button>
              ) : (
                <>
                  <button type="button" className="btn accent" onClick={() => { app.reset(); setConfirmReset(false); toast('Back to the original strategy') }}>Yes, clear my edits</button>
                  <button type="button" className="btn ghost" onClick={() => setConfirmReset(false)}>Keep them</button>
                </>
              )}
            </div>
            {exported && <textarea id="export-box" className="textarea" readOnly value={exported} style={{ minHeight: 120, fontSize: 12 }} onFocus={(e) => e.currentTarget.select()} />}
            <label className="field"><span>Bring data back</span>
              <textarea id="import-box" className="textarea" placeholder="Paste copied data here" value={incoming} onChange={(e) => setIncoming(e.target.value)} style={{ minHeight: 80, fontSize: 12 }} />
            </label>
            <div><button type="button" className="btn" disabled={!incoming.trim()} onClick={doImport}>Import</button></div>
          </div>
        </section>
      </div>
    </div>
  )
}
