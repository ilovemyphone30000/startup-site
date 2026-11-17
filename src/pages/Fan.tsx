import { useState, type FormEvent } from 'react'
import { Page } from '../components/Layout'
import { Bar, DemoTag, Field, Table } from '../components/ui'
import { QR } from '../components/QR'
import { NAME, REF_HOST, SCORE_WEIGHTS, TORCH_MIN_SCORE } from '../config'
import { LADDER } from '../data/rewards'
import { cityName, fanCities } from '../data/cities'
import { sampleInstagramJson, sampleSignals, sampleSpotifyJson } from '../data/samples'
import type { Artist, Show, SourceId } from '../data/types'
import { copyText } from '../lib/clipboard'
import { fanStats, getArtists, getShows, leaderboard, matchArtist, myShowTickets, seatsLeft, tierFor, YOU } from '../lib/derive'
import { daysUntil, fmtDate, fmtDateLong, norm, slug, uid } from '../lib/format'
import { mergeSignals, parseInstagram, parseSpotify } from '../lib/importers'
import { getState, patchFan, resetAll, useStore } from '../lib/store'


const TABS = [
  ['shows', 'Shows'], ['score', 'My score'], ['sources', 'Sources'],
  ['rewards', 'Rewards'], ['board', 'Leaderboard'], ['torch', 'Pass the torch'],
] as const
type Tab = (typeof TABS)[number][0]

/* ---------- Shows ---------- */

function ShowCard({ show, artist, handle, mine, notify, onBuy }: {
  show: Show; artist: Artist | undefined; handle: string; mine: number
  notify: (m: string) => void; onBuy: (id: string) => void
}) {
  const [qr, setQr] = useState(false)
  const link = `https://${REF_HOST}/${show.id}/${slug(handle)}`
  const left = seatsLeft(show)
  const d = daysUntil(show.date)
  const text = `${artist?.name ?? 'This band'} at ${show.venue}, ${cityName(show.cityId)}, ${fmtDate(show.date)}. ${left} tickets left. I'm going. Come with me: ${link}`
  const copy = async (what: string, t: string) =>
    notify((await copyText(t)) ? `${what} copied.` : 'Could not copy. Select the text and copy it by hand.')

  // Open the phone's share sheet where it exists, otherwise copy the message.
  const share = async () => {
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ text })
        return notify('Shared.')
      }
    } catch (e) {
      if ((e as DOMException)?.name === 'AbortError') return
    }
    copy('Message', text)
  }

  return (
    <article className="border-b border-ink px-4 py-4" aria-label={`${artist?.name} in ${cityName(show.cityId)}`}>
      <h3 className="m-0 font-bold">{artist?.name ?? 'Unknown artist'}</h3>
      <p className="m-0 text-sm text-mute">{artist?.genre}</p>
      <p className="mb-2 mt-1">{show.venue}, {cityName(show.cityId)}<br />{fmtDate(show.date)} ({d === 0 ? 'today' : `in ${d} days`})</p>
      <Bar value={left} max={show.capacity} label={`Tickets left: ${left} of ${show.capacity}`} />
      <p className="mb-3 mt-1 text-sm">{left === 0 ? 'Sold out' : `${left} tickets left of ${show.capacity}`}</p>
      {mine > 0 && <p className="mb-3 mt-0 text-sm font-bold">You have driven {mine} ticket{mine === 1 ? '' : 's'} to this show.</p>}

      <label className="label" htmlFor={`link-${show.id}`}>Your link</label>
      <div className="flex gap-2">
        <input id={`link-${show.id}`} readOnly className="field min-w-0 flex-1 text-sm" value={link} onFocus={(e) => e.currentTarget.select()} />
        <button className="btn btn-sm" onClick={() => copy('Link', link)}>Copy</button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn btn-solid btn-sm" onClick={share}>Share</button>
        <button className="btn btn-sm" aria-pressed={qr} onClick={() => setQr(!qr)}>{qr ? 'Hide QR' : 'Show QR'}</button>
      </div>
      {qr && <div className="mt-3"><QR text={link} label={`QR code for your link to ${artist?.name} in ${cityName(show.cityId)}`} /></div>}

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer">Demo controls</summary>
        <div className="mt-2 flex flex-wrap gap-2">
          <button className="btn btn-sm" disabled={left === 0} onClick={() => onBuy(show.id)}>A friend buys through my link</button>
          <button className="btn btn-sm" onClick={() => notify('Blocked: self-referral. No credit and no charge. Flagged for review (mocked).')}>
            I buy through my own link
          </button>
        </div>
        <p className="mb-0 mt-2 text-mute">Fraud prevention is mocked: self-referrals are blocked and fans buying through their own link are flagged.</p>
      </details>
    </article>
  )
}

function ShowsTab({ notify }: { notify: (m: string) => void }) {
  const s = useStore()
  const arts = new Map(getArtists(s).map((a) => [a.id, a]))
  const mine = myShowTickets(s)
  const feed = getShows(s)
    .filter((x) => x.cityId === s.fan.cityId && daysUntil(x.date) >= 0)
    .sort((a, b) => a.date.localeCompare(b.date))

  const buy = (id: string) => {
    const before = tierFor(fanStats(getState()).score).cur?.id
    patchFan((f) => ({ extra: { ...f.extra, [id]: (f.extra[id] ?? 0) + 1 } }))
    const after = tierFor(fanStats(getState()).score).cur
    notify(after && after.id !== before
      ? `Unlocked: ${after.name}. A friend bought through your link.`
      : `A friend bought through your link. +${SCORE_WEIGHTS.ticketDriven} Fan Score.`)
  }

  return (
    <div>
      <p className="m-0 border-b border-ink px-4 py-2 text-sm">Upcoming shows in {cityName(s.fan.cityId)} <DemoTag /></p>
      {feed.length === 0 && <p className="px-4 py-6">No upcoming shows here yet. Try another city.</p>}
      {feed.map((sh) => (
        <ShowCard key={sh.id} show={sh} artist={arts.get(sh.artistId)} handle={s.fan.handle || 'you.demo'}
          mine={mine.get(sh.id) ?? 0} notify={notify} onBuy={buy} />
      ))}
    </div>
  )
}

/* ---------- My score ---------- */

function LogForm({ notify }: { notify: (m: string) => void }) {
  const s = useStore()
  const logged = new Set(s.fan.logged.map((l) => l.showId))
  const past = getShows(s).filter((x) => daysUntil(x.date) < 0 && !logged.has(x.id)).sort((a, b) => b.date.localeCompare(a.date))
  const arts = new Map(getArtists(s).map((a) => [a.id, a]))
  const [pick, setPick] = useState('')
  const [err, setErr] = useState('')

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const friends = Math.max(0, Math.min(50, Number(f.get('friends')) || 0))
    const via = Math.max(0, Number(f.get('via')) || 0)
    const artistLabel = String(f.get('artist') ?? '').trim()
    if (!pick) return setErr('Pick a show first.')
    if (pick === 'other' && !artistLabel) return setErr('Enter the artist name.')
    if (via > friends) return setErr('Friends who bought through your link cannot be more than friends you brought.')
    setErr('')
    const before = fanStats(getState()).score
    patchFan((fan) => ({
      logged: [...fan.logged, {
        id: uid('log'), showId: pick === 'other' ? undefined : pick, artistLabel,
        cityLabel: pick === 'other' ? cityName(String(f.get('city'))) : '', friends, via,
      }],
    }))
    notify(`Logged. Fan Score +${fanStats(getState()).score - before}. Entries are checked against ticket scans (mocked).`)
    e.currentTarget.reset()
    setPick('')
  }

  return (
    <form onSubmit={submit} className="grid gap-3" aria-labelledby="log-h">
      <h3 id="log-h" className="m-0 font-bold">Log a show you went to</h3>
      <Field label="Show">
        <select className="field" value={pick} onChange={(e) => setPick(e.target.value)} required>
          <option value="" disabled>Pick one</option>
          {past.map((x) => <option key={x.id} value={x.id}>{arts.get(x.artistId)?.name}, {cityName(x.cityId)}, {fmtDate(x.date)}</option>)}
          <option value="other">Not listed</option>
        </select>
      </Field>
      {pick === 'other' && (
        <>
          <Field label="Artist"><input className="field" name="artist" maxLength={60} autoComplete="off" /></Field>
          <Field label="City">
            <select className="field" name="city" defaultValue={s.fan.cityId}>
              {fanCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
        </>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Friends you brought"><input className="field" name="friends" type="number" min={0} max={50} defaultValue={0} /></Field>
        <Field label="Of those, bought via your link"><input className="field" name="via" type="number" min={0} max={50} defaultValue={0} /></Field>
      </div>
      {err && <p role="alert" className="m-0 text-sm font-bold">{err}</p>}
      <button className="btn btn-solid" type="submit">Add to my score</button>
    </form>
  )
}

function ScoreTab({ notify }: { notify: (m: string) => void }) {
  const s = useStore()
  const stats = fanStats(s)
  const arts = new Map(getArtists(s).map((a) => [a.id, a]))
  const byShow = new Map(getShows(s).map((x) => [x.id, x]))
  const mine = myShowTickets(s)

  // Credit grouped by artist. This is the cross-artist view: one score, every artist.
  const perArtist = new Map<string, { name: string; tickets: number; dayOne: boolean }>()
  const ensure = (id: string, name: string) => {
    const r = perArtist.get(id) ?? { name, tickets: 0, dayOne: false }
    perArtist.set(id, r)
    return r
  }
  for (const [id, n] of mine) { const sh = byShow.get(id); if (sh) ensure(sh.artistId, arts.get(sh.artistId)?.name ?? '?').tickets += n }
  for (const l of s.fan.logged) {
    const sh = l.showId ? byShow.get(l.showId) : undefined
    if (sh) ensure(sh.artistId, arts.get(sh.artistId)?.name ?? '?')
    else ensure(`x:${norm(l.artistLabel)}`, l.artistLabel)
  }
  for (const id of stats.dayOne) ensure(id, arts.get(id)?.name ?? id).dayOne = true

  const showRows = [...mine].map(([id, n]) => ({ sh: byShow.get(id), n })).filter((r) => r.sh)
    .sort((a, b) => a.sh!.date.localeCompare(b.sh!.date))

  return (
    <div className="grid gap-8 px-4 py-5">
      <section aria-labelledby="bd-h">
        <h3 id="bd-h" className="m-0 mb-2 font-bold">How your Fan Score adds up</h3>
        <Table>
          <thead><tr><th>Action</th><th className="num">Count</th><th className="num">Points</th></tr></thead>
          <tbody>
            {stats.rows.map((r) => (
              <tr key={r.label}><td>{r.label} <span className="text-mute">({r.each} each)</span></td><td className="num">{r.n}</td><td className="num">{r.pts}</td></tr>
            ))}
            <tr className="font-bold"><td>Total</td><td /><td className="num">{stats.score}</td></tr>
          </tbody>
        </Table>
      </section>

      <section aria-labelledby="imp-h">
        <h3 id="imp-h" className="m-0 font-bold">My impact</h3>
        <p className="mb-3 mt-1 text-sm">Running total: <strong>{stats.ticketsDriven} tickets driven</strong>. Your credit counts for every artist on {NAME}.</p>
        <Table>
          <thead><tr><th>Artist</th><th className="num">Tickets</th><th>Badge</th></tr></thead>
          <tbody>
            {[...perArtist.values()].sort((a, b) => b.tickets - a.tickets).map((r) => (
              <tr key={r.name}><td>{r.name}</td><td className="num">{r.tickets}</td><td>{r.dayOne ? 'Day one' : ''}</td></tr>
            ))}
          </tbody>
        </Table>
        <details className="mt-3 text-sm" open>
          <summary className="cursor-pointer">Tickets driven per show</summary>
          <ul className="m-0 mt-2 list-none p-0">
            {showRows.length === 0 && <li>None yet.</li>}
            {showRows.map(({ sh, n }) => (
              <li key={sh!.id} className="flex justify-between gap-3 border-t border-ink py-1">
                <span>{arts.get(sh!.artistId)?.name}, {cityName(sh!.cityId)}, {fmtDate(sh!.date)}</span><strong>{n}</strong>
              </li>
            ))}
          </ul>
        </details>
        <p className="mb-0 mt-3 text-xs text-mute">Day one: among the first supporters of an artist, by follow or first listen before the artist's early cutoff. Verified from your imported accounts.</p>
      </section>

      <LogForm notify={notify} />

      <section aria-labelledby="hist-h">
        <h3 id="hist-h" className="m-0 mb-2 font-bold">Shows I have logged</h3>
        <ul className="m-0 list-none p-0">
          {s.fan.logged.length === 0 && <li>None yet.</li>}
          {s.fan.logged.map((l) => {
            const sh = l.showId ? byShow.get(l.showId) : undefined
            return (
              <li key={l.id} className="flex items-center justify-between gap-3 border-t border-ink py-2 text-sm">
                <span>{sh ? `${arts.get(sh.artistId)?.name}, ${cityName(sh.cityId)}, ${fmtDateLong(sh.date)}` : `${l.artistLabel}, ${l.cityLabel}`}<br />
                  <span className="text-mute">{l.friends} friends, {l.via} via link</span></span>
                <button className="btn btn-sm" onClick={() => patchFan((f) => ({ logged: f.logged.filter((x) => x.id !== l.id) }))}>Remove</button>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="prof-h" className="grid gap-3">
        <h3 id="prof-h" className="m-0 font-bold">Profile</h3>
        <Field label="Your handle (used in your links)">
          <input className="field" maxLength={24} value={s.fan.handle} onChange={(e) => patchFan({ handle: e.target.value })} autoComplete="off" />
        </Field>
        <div><button className="btn btn-sm" onClick={() => { resetAll(); notify('Demo data reset.') }}>Reset all demo data</button></div>
      </section>
    </div>
  )
}

/* ---------- Sources ---------- */

interface SourceDef {
  id: SourceId; name: string; gives: string; how: string; file?: { accept: string; parse: (t: string) => ReturnType<typeof parseSpotify> }
  sample: () => ReturnType<typeof parseSpotify>
}
const SOURCES: SourceDef[] = [
  { id: 'spotify', name: 'Spotify', gives: 'First play and play count per artist',
    how: 'Spotify only returns the last 50 plays through its API, so the fan uploads their Extended streaming history instead: Account, Privacy, Download your data, Extended streaming history. Spotify emails it in up to about 30 days. Upload the Streaming_History_Audio JSON files.',
    file: { accept: '.json,application/json', parse: parseSpotify }, sample: () => parseSpotify(sampleSpotifyJson()) },
  { id: 'lastfm', name: 'Last.fm', gives: 'First scrobble and play count per artist',
    how: 'The live route. A public profile needs only an API key, and the API allows browser calls. Fans who scrobble Spotify to Last.fm get their full history with dates. Mocked here.',
    sample: () => sampleSignals.lastfm },
  { id: 'instagram', name: 'Instagram', gives: 'The date a fan followed an artist',
    how: 'No API gives follow dates. The data export does: Instagram, Accounts Center, Your information and permissions, Download your information, Followers and following, JSON, All time. Upload following.json.',
    file: { accept: '.json,application/json', parse: parseInstagram }, sample: () => parseInstagram(sampleInstagramJson()) },
  { id: 'discogs', name: 'Discogs', gives: 'Records owned and when they were added',
    how: 'Public collections can be read without login and every release has a date added. A live call from the browser is feasible later. Mocked here.',
    sample: () => sampleSignals.discogs },
  { id: 'dice', name: 'DICE', gives: 'Past tickets',
    how: 'DICE has no fan-facing API. Its documented API is partner only, so this is a partnership integration, or fans forward ticket emails. Mocked here.',
    sample: () => sampleSignals.dice },
]

function SourceCard({ def, notify }: { def: SourceDef; notify: (m: string) => void }) {
  const s = useStore()
  const status = s.fan.sources[def.id]
  const arts = getArtists(s)
  const rows = s.fan.signals.filter((x) => x.source === def.id)

  const apply = (incoming: ReturnType<typeof parseSpotify>, mode: 'sample' | 'file', fileName?: string) => {
    const before = fanStats(getState()).score
    patchFan((f) => ({
      signals: [...f.signals.filter((x) => x.source !== def.id), ...incoming],
      sources: { ...f.sources, [def.id]: { at: new Date().toISOString(), mode, rows: incoming.length, fileName } },
    }))
    const matched = incoming.filter((x) => matchArtist(x.artist, arts)).length
    const gain = fanStats(getState()).score - before
    notify(`${def.name}: ${incoming.length} artists found, ${matched} match the demo roster. Fan Score ${gain >= 0 ? '+' : ''}${gain}.`)
  }

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !def.file) return
    try {
      const parts = await Promise.all([...files].map(async (f) => def.file!.parse(await f.text())))
      apply(mergeSignals(parts.flat()), 'file', [...files].map((f) => f.name).join(', '))
    } catch {
      notify(`Could not read that file as a ${def.name} export. Nothing was changed.`)
    }
  }

  return (
    <section className="border-b border-ink px-4 py-4" aria-labelledby={`src-${def.id}`}>
      <h3 id={`src-${def.id}`} className="m-0 font-bold">{def.name}</h3>
      <p className="m-0 text-sm text-mute">Gives us: {def.gives}</p>
      <p className="my-2 text-sm">{def.how}</p>
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-sm" onClick={() => apply(def.sample(), 'sample')}>Load sample</button>
        {def.file && (
          <label className="btn btn-sm cursor-pointer">
            Upload file
            <input type="file" accept={def.file.accept} multiple className="sr-only" onChange={(e) => { void onFiles(e.target.files); e.target.value = '' }} />
          </label>
        )}
        {status && (
          <button className="btn btn-sm" onClick={() => patchFan((f) => ({
            signals: f.signals.filter((x) => x.source !== def.id),
            sources: Object.fromEntries(Object.entries(f.sources).filter(([k]) => k !== def.id)),
          }))}>Remove</button>
        )}
      </div>
      {status && (
        <p className="mb-0 mt-2 text-sm" role="status">
          Connected ({status.mode === 'file' ? status.fileName : 'sample'}), {status.rows} artists.
        </p>
      )}
      {rows.length > 0 && (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer">What we read</summary>
          <Table>
            <thead><tr><th>Artist</th><th>First seen</th><th className="num">Count</th><th>Match</th></tr></thead>
            <tbody>
              {rows.slice(0, 12).map((r) => (
                <tr key={r.artist}><td>{r.artist}</td><td>{r.firstSeen}</td><td className="num">{r.count}</td>
                  <td>{matchArtist(r.artist, arts) ? 'Yes' : '-'}</td></tr>
              ))}
            </tbody>
          </Table>
          {rows.length > 12 && <p className="m-0 mt-1 text-mute">Showing 12 of {rows.length}.</p>}
        </details>
      )}
    </section>
  )
}

function SourcesTab({ notify }: { notify: (m: string) => void }) {
  return (
    <div>
      <p className="m-0 border-b border-ink px-4 py-3 text-sm">
        Connect where you already show you are a fan. We use it to verify the artists you support and to award Day one badges.
        Files are read in your browser. Nothing is uploaded. <DemoTag>Samples are fake</DemoTag>
      </p>
      {SOURCES.map((d) => <SourceCard key={d.id} def={d} notify={notify} />)}
    </div>
  )
}

/* ---------- Rewards, leaderboard, torch ---------- */

function RewardsTab() {
  const s = useStore()
  const { score } = fanStats(s)
  const { cur, next } = tierFor(score)
  const upcoming = getShows(s).filter((x) => daysUntil(x.date) >= 0)
  const artistCount = new Set(upcoming.map((x) => x.artistId)).size
  return (
    <div className="px-4 py-5">
      <p className="m-0 border border-ink p-3 text-sm">
        Your credit carries across every artist on {NAME}. Your tier works at {upcoming.length} upcoming shows by {artistCount} artists right now.
      </p>
      <ol className="m-0 mt-4 list-none p-0">
        {LADDER.map((t, i) => {
          const unlocked = score >= t.at
          const isNext = next?.id === t.id
          const prev = LADDER[i - 1]?.at ?? 0
          return (
            <li key={t.id} className="border-t border-ink py-3">
              <div className="flex justify-between gap-3">
                <strong>{i + 1}. {t.name}</strong>
                <span className="whitespace-nowrap text-sm">{unlocked ? 'Unlocked' : isNext ? 'Next' : 'Locked'} ({t.at})</span>
              </div>
              <p className="my-1 text-sm">{t.perk}</p>
              {isNext && (
                <>
                  <Bar value={score - prev} max={t.at - prev} label={`Progress to ${t.name}`} />
                  <p className="m-0 mt-1 text-sm">{t.at - score} points to go. About {Math.ceil((t.at - score) / SCORE_WEIGHTS.ticketDriven)} friends buying through your link.</p>
                </>
              )}
            </li>
          )
        })}
      </ol>
      <p className="mb-0 mt-2 text-sm text-mute">{cur ? `You are at: ${cur.name}.` : 'Earn 50 points to unlock your first perk.'}</p>
    </div>
  )
}

function BoardTab() {
  const s = useStore()
  const rows = leaderboard(s, s.fan.cityId)
  const top = rows.slice(0, 10)
  const myRank = rows.findIndex((r) => r.fan.id === YOU) + 1
  return (
    <div className="px-4 py-5">
      <h3 className="m-0 font-bold">Top fans this month in {cityName(s.fan.cityId)} <DemoTag /></h3>
      <p className="mb-3 mt-1 text-sm text-mute">Tickets driven in the last 30 days and the next 30.</p>
      <Table>
        <thead><tr><th>#</th><th>Fan</th><th className="num">Tickets</th></tr></thead>
        <tbody>
          {top.map((r, i) => (
            <tr key={r.fan.id} className={r.fan.id === YOU ? 'font-bold' : ''}>
              <td>{i + 1}</td><td>{r.fan.handle}{r.fan.id === YOU ? ' (you)' : ''}</td><td className="num">{r.tickets}</td>
            </tr>
          ))}
          {myRank > 10 && <tr className="font-bold"><td>{myRank}</td><td>{s.fan.handle} (you)</td><td className="num">{rows[myRank - 1].tickets}</td></tr>}
        </tbody>
      </Table>
    </div>
  )
}

function TorchTab({ notify }: { notify: (m: string) => void }) {
  const s = useStore()
  const t = s.fan.torch
  const link = t ? `https://${REF_HOST}/torch/${t.cityId}/${slug(t.to)}` : ''
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const to = String(f.get('to')).trim()
    if (!to) return
    patchFan({ torch: { to, cityId: String(f.get('city')), note: String(f.get('note')).trim(), at: new Date().toISOString() } })
    notify('Invite created. Demo only, nothing was sent.')
  }
  const { score } = fanStats(s)
  if (!t && score < TORCH_MIN_SCORE) {
    return (
      <div className="grid gap-3 px-4 py-5">
        <p className="m-0 text-sm">Graduating? Hand your campus to a younger fan so the crew you built keeps showing up.</p>
        <div className="border border-ink p-3">
          <p className="m-0 font-bold">Locked until {TORCH_MIN_SCORE} Fan Score</p>
          <p className="mb-2 mt-1 text-sm">You can only pass the torch once you have proven you can run a campus.</p>
          <Bar value={score} max={TORCH_MIN_SCORE} label={`Fan Score ${score} of ${TORCH_MIN_SCORE} to unlock Pass the torch`} />
          <p className="mb-0 mt-1 text-sm">{score} of {TORCH_MIN_SCORE}. {TORCH_MIN_SCORE - score} points to go.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="grid gap-4 px-4 py-5">
      <p className="m-0 text-sm">Graduating? Hand your campus to a younger fan so the crew you built keeps showing up.</p>
      {!t ? (
        <form onSubmit={submit} className="grid gap-3">
          <Field label="Who is taking over? (their handle)"><input className="field" name="to" required maxLength={24} autoComplete="off" /></Field>
          <Field label="Campus or city">
            <select className="field" name="city" defaultValue={s.fan.cityId}>{fanCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          </Field>
          <Field label="A note for them (optional)"><textarea className="field" name="note" rows={3} maxLength={200} /></Field>
          <button className="btn btn-solid" type="submit">Create invite</button>
        </form>
      ) : (
        <div className="grid gap-3">
          <p className="m-0 border border-ink p-3">Invite for <strong>{t.to}</strong> to take over {cityName(t.cityId)}.{t.note && <><br />Note: {t.note}</>}</p>
          <div className="flex gap-2">
            <input readOnly className="field min-w-0 flex-1 text-sm" value={link} aria-label="Invite link" onFocus={(e) => e.currentTarget.select()} />
            <button className="btn btn-sm" onClick={async () => notify((await copyText(link)) ? 'Invite link copied.' : 'Could not copy.')}>Copy</button>
          </div>
          <QR text={link} label={`QR code for the invite to ${t.to}`} />
          <button className="btn btn-sm w-fit" onClick={() => patchFan({ torch: null })}>Cancel invite</button>
        </div>
      )}
      <div className="grid gap-3 border-t border-ink pt-4 text-sm md:grid-cols-2">
        <div><strong>Passes on</strong><br />Your campus crew, your local contacts and the campus lead spot.</div>
        <div><strong>Stays with you</strong><br />Your Fan Score and credit for every artist, even after you graduate.</div>
      </div>
    </div>
  )
}

/* ---------- Score meter ---------- */

const METER_MAX = 600 // top rung of the ladder

/** Bold black bar from 0 to the top tier, with a tick at every benchmark. */
function ScoreMeter({ score }: { score: number }) {
  const marks = [...LADDER.map((t) => ({ at: t.at, name: t.name })), { at: TORCH_MIN_SCORE, name: 'Pass the torch' }]
    .sort((a, b) => a.at - b.at)
  const left = (n: number) => `${(n / METER_MAX) * 100}%`
  return (
    <div className="mt-3">
      <div className="relative pb-7 pt-2">
        <div role="meter" aria-label={`Fan Score ${score} on a scale of 0 to ${METER_MAX}`} aria-valuemin={0} aria-valuemax={METER_MAX}
          aria-valuenow={Math.min(score, METER_MAX)} className="h-6 w-full border-2 border-ink bg-paper">
          <div className="h-full bg-ink" style={{ width: `${Math.min(100, (score / METER_MAX) * 100)}%` }} />
        </div>
        {marks.map((m) => (
          <span key={m.at} aria-hidden="true" className="absolute top-0 block h-10 w-0.5 -translate-x-1/2 bg-ink" style={{ left: left(m.at) }} />
        ))}
        {marks.map((m) => (
          <span key={`n${m.at}`} aria-hidden="true" style={{ left: left(m.at) }}
            className={`absolute top-10 text-xs font-bold ${m.at >= METER_MAX ? '-translate-x-full' : '-translate-x-1/2'}`}>
            {m.at}
          </span>
        ))}
      </div>
      <p className="m-0 text-xs">{marks.map((m) => `${m.at} ${m.name}`).join(', ')}</p>
    </div>
  )
}

/* ---------- Page ---------- */

export default function Fan() {
  const s = useStore()
  const [tab, setTab] = useState<Tab>('shows')
  const [msg, setMsg] = useState('')
  const { score } = fanStats(s)
  const { cur, next } = tierFor(score)

  return (
    <Page art={56} hero={
      <>
        <h1 className="m-0 text-xl font-bold">Fan app demo</h1>
      </>
    }>
      <div className="fan-view mx-auto max-w-2xl md:border-x md:border-ink">
        <div className="border-b-2 border-ink bg-accent px-4 py-4">
          <p className="m-0 text-sm">Fan Score</p>
          <p className="m-0 text-5xl font-bold leading-none" aria-label={`Fan Score ${score}`}>{score}</p>
          <p className="mb-2 mt-2 text-sm">{cur ? cur.name : 'No tier yet'}{next ? `. Next: ${next.name} at ${next.at}.` : '. Top tier.'}</p>
          <ScoreMeter score={score} />
          <div className="mt-3 max-w-xs">
            <Field label="Your city or campus">
              <select className="field" value={s.fan.cityId} onChange={(e) => patchFan({ cityId: e.target.value })}>
                {fanCities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>
        </div>
        <nav aria-label="Fan app sections" className="flex gap-2 overflow-x-auto border-b border-ink px-4 py-2">
          {TABS.map(([id, label]) => (
            <button key={id} className="btn btn-sm whitespace-nowrap" aria-current={tab === id} onClick={() => setTab(id)}>{label}</button>
          ))}
        </nav>
        <div role="status" aria-live="polite" className={msg ? 'border-b border-ink bg-ink px-4 py-2 text-sm text-paper' : 'sr-only'}>{msg}</div>
        {tab === 'shows' && <ShowsTab notify={setMsg} />}
        {tab === 'score' && <ScoreTab notify={setMsg} />}
        {tab === 'sources' && <SourcesTab notify={setMsg} />}
        {tab === 'rewards' && <RewardsTab />}
        {tab === 'board' && <BoardTab />}
        {tab === 'torch' && <TorchTab notify={setMsg} />}
      </div>
    </Page>
  )
}
