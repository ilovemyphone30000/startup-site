import { useState, type FormEvent } from 'react'
import { Page } from '../components/Layout'
import { Bar, DemoTag, Field, RiskFlag, Table } from '../components/ui'
import { PRICING, TICKET_PRICE, directPerTicket } from '../config'
import { cities, cityName } from '../data/cities'
import type { Show } from '../data/types'
import {
  cityFans, getArtists, getFans, getReferrals, getShows, inWindow, isAtRisk, projectedLift, sellThrough, seatsLeft,
} from '../lib/derive'
import { daysUntil, fmtDate, money, pct, todayISO, uid } from '../lib/format'
import { patchAgent, resetAll, useStore } from '../lib/store'

const TABS = [
  ['overview', 'Overview'], ['dates', 'Tour dates'], ['attrib', 'Attribution'], ['cost', 'Cost'], ['enter', 'Enter data'],
] as const
type Tab = (typeof TABS)[number][0]

/** Tickets credited to fans in the monthly window, plus the data every tab needs. */
function useAgentData() {
  const s = useStore()
  const arts = getArtists(s)
  const artById = new Map(arts.map((a) => [a.id, a]))
  const shows = getShows(s).sort((a, b) => a.date.localeCompare(b.date))
  const refs = getReferrals(s)
  const showById = new Map(shows.map((x) => [x.id, x]))
  const fansById = new Map(getFans(s).map((f) => [f.id, f]))
  const monthReferred = refs.filter((r) => { const sh = showById.get(r.showId); return sh && inWindow(sh) }).reduce((a, r) => a + r.tickets, 0)
  return { s, arts, artById, shows, refs, showById, fansById, monthReferred }
}

function Tile({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="cell">
      <p className="m-0 text-sm text-mute">{label}</p>
      <p className="m-0 text-3xl font-bold leading-tight">{value}</p>
      {note && <p className="m-0 text-xs text-mute">{note}</p>}
    </div>
  )
}

function StatusCell({ show }: { show: Show }) {
  const d = daysUntil(show.date)
  const { s } = useAgentData()
  if (d < 0) return <span className="text-mute">Done</span>
  if (isAtRisk(show)) return <><RiskFlag />{s.agent.activated[show.id] !== undefined && <span className="ml-2 text-xs">Activated</span>}</>
  return <>{s.agent.activated[show.id] !== undefined ? 'Activated' : 'On track'}</>
}

/* ---------- Activate panel ---------- */

function ActivatePanel({ show, onClose }: { show: Show; onClose: () => void }) {
  const { s, artById } = useAgentData()
  const top = cityFans(s, show.cityId).slice(0, 5)
  const lift = projectedLift(show, top)
  const done = s.agent.activated[show.id]
  const after = show.sold + lift
  return (
    <section aria-labelledby="act-h" className="mt-6 border-2 border-ink p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 id="act-h" className="m-0 font-bold">Activate superfans in {cityName(show.cityId)}</h3>
        <button className="btn btn-sm" onClick={onClose}>Close</button>
      </div>
      <p className="mb-3 mt-1 text-sm">{artById.get(show.artistId)?.name}, {show.venue}, {fmtDate(show.date)}. {seatsLeft(show)} seats left.</p>
      <Table>
        <thead><tr><th>Local fan</th><th className="num">Tickets driven, all shows</th><th className="num">Shows</th><th className="num">Avg per show</th></tr></thead>
        <tbody>
          {top.map((r) => <tr key={r.fan.id}><td>{r.fan.handle}</td><td className="num">{r.tickets}</td><td className="num">{r.shows}</td><td className="num">{r.avg.toFixed(1)}</td></tr>)}
        </tbody>
      </Table>
      <div className="mt-4 grid max-w-xl gap-2">
        <p className="m-0 text-sm">Sold now: {show.sold} of {show.capacity} ({pct(sellThrough(show))})</p>
        <Bar value={show.sold} max={show.capacity} label="Sold now" />
        <p className="m-0 text-sm">Projected lift: <strong>+{lift} tickets</strong>, to {after} ({pct(after / show.capacity)}) <DemoTag>Mock model</DemoTag></p>
        <Bar value={after} max={show.capacity} label="Projected sold after activation" />
        <p className="m-0 text-xs text-mute">Mock model: the top five local fans repeat their average per-show result, capped at seats left.</p>
      </div>
      <div className="mt-4">
        {done === undefined
          ? <button className="btn btn-solid" onClick={() => patchAgent((a) => ({ activated: { ...a.activated, [show.id]: lift } }))}>Activate {top.length} fans</button>
          : <p role="status" className="m-0 font-bold">Activated. {top.length} fans notified (mocked, nothing is sent). You pay only for tickets that sell.</p>}
      </div>
    </section>
  )
}

/* ---------- Tabs ---------- */

function Overview({ go }: { go: (id: string) => void }) {
  const { arts, shows, artById, monthReferred, s } = useAgentData()
  const upcoming = shows.filter((x) => daysUntil(x.date) >= 0)
  const risky = upcoming.filter(isAtRisk)
  const sold = upcoming.reduce((a, x) => a + x.sold, 0)
  const cap = upcoming.reduce((a, x) => a + x.capacity, 0)
  return (
    <>
      <div className="grid border-y border-ink sm:grid-cols-2 lg:grid-cols-5 lg:border-x [&>.cell:first-child]:border-l-0">
        <Tile label="Artists on roster" value={arts.length} />
        <Tile label="Upcoming dates" value={upcoming.length} />
        <Tile label="Tickets sold, upcoming" value={sold.toLocaleString()} note={`${pct(cap ? sold / cap : 0)} of ${cap.toLocaleString()}`} />
        <Tile label="At risk" value={risky.length} note="Low sell-through near show date" />
        <Tile label="Fan-driven, last and next 30 days" value={monthReferred} />
      </div>
      <h3 className="mb-2 mt-6 font-bold">Needs attention</h3>
      {risky.length === 0 ? <p className="m-0">Nothing at risk.</p> : (
        <Table>
          <thead><tr><th>Artist</th><th>City</th><th>Date</th><th className="num">Sell-through</th><th /></tr></thead>
          <tbody>
            {risky.map((x) => (
              <tr key={x.id}>
                <td>{artById.get(x.artistId)?.name}</td><td>{cityName(x.cityId)}</td>
                <td>{fmtDate(x.date)} ({daysUntil(x.date)}d)</td><td className="num">{pct(sellThrough(x))}</td>
                <td className="text-right">
                  {s.agent.activated[x.id] !== undefined ? 'Activated' : <button className="btn btn-sm" onClick={() => go(x.id)}>Activate superfans</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

function Dates({ sel, setSel }: { sel: string; setSel: (id: string) => void }) {
  const { s, arts, artById, shows, showById } = useAgentData()
  const [artist, setArtist] = useState('all')
  const rows = shows.filter((x) => artist === 'all' || x.artistId === artist)
  const selected = showById.get(sel)
  return (
    <>
      <div className="mb-3 max-w-xs">
        <Field label="Artist">
          <select className="field" value={artist} onChange={(e) => setArtist(e.target.value)}>
            <option value="all">All artists</option>
            {arts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
      </div>
      <Table>
        <thead>
          <tr><th>Artist</th><th>City</th><th>Date</th><th className="num">Days</th><th className="num">Capacity</th><th className="num">Sold</th><th>Sell-through</th><th>Status</th><th /></tr>
        </thead>
        <tbody>
          {rows.map((x) => {
            const d = daysUntil(x.date)
            const risk = isAtRisk(x)
            return (
              <tr key={x.id}>
                <td>{artById.get(x.artistId)?.name}</td><td>{cityName(x.cityId)}<br /><span className="text-xs text-mute">{x.venue}</span></td>
                <td>{fmtDate(x.date)}</td><td className="num">{d}</td><td className="num">{x.capacity}</td>
                <td className="num">
                  <input aria-label={`Tickets sold, ${artById.get(x.artistId)?.name} in ${cityName(x.cityId)}`} type="number" min={0} max={x.capacity}
                    className="field !w-20 !px-1 !py-0.5 text-right" value={x.sold}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(x.capacity, Number(e.target.value) || 0))
                      patchAgent((a) => ({ soldOverride: { ...a.soldOverride, [x.id]: Math.max(0, v - (s.fan.extra[x.id] ?? 0)) } }))
                    }} />
                </td>
                <td className="min-w-28"><Bar value={x.sold} max={x.capacity} risk={risk} label={`Sell-through ${pct(sellThrough(x))}`} /><span className="text-xs">{pct(sellThrough(x))}</span></td>
                <td><StatusCell show={x} /></td>
                <td>{d >= 0 && <button className="btn btn-sm whitespace-nowrap" onClick={() => setSel(x.id)}>Activate superfans</button>}</td>
              </tr>
            )
          })}
        </tbody>
      </Table>
      <p className="mb-0 mt-2 text-xs text-mute">Edit "Sold" to update a count. At risk means under {pct(0.6)} sold within 14 days, or under {pct(0.35)} within 30.</p>
      {selected && <ActivatePanel show={selected} onClose={() => setSel('')} />}
    </>
  )
}

function Attribution() {
  const { refs, showById, fansById, artById } = useAgentData()
  const [by, setBy] = useState<'detail' | 'show' | 'city' | 'fan'>('detail')
  const total = refs.reduce((a, r) => a + r.tickets, 0)
  const sum = <K,>(key: (r: (typeof refs)[number]) => K) => {
    const m = new Map<K, number>()
    for (const r of refs) m.set(key(r), (m.get(key(r)) ?? 0) + r.tickets)
    return [...m].sort((a, b) => b[1] - a[1])
  }
  const label = (id: string) => { const x = showById.get(id); return x ? `${artById.get(x.artistId)?.name}, ${cityName(x.cityId)}, ${fmtDate(x.date)}` : id }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-end gap-3">
        <div className="w-56">
          <Field label="Group by">
            <select className="field" value={by} onChange={(e) => setBy(e.target.value as typeof by)}>
              <option value="detail">Fan by show (detail)</option><option value="show">Show</option>
              <option value="city">City</option><option value="fan">Fan</option>
            </select>
          </Field>
        </div>
        <p className="m-0 text-sm">{total} tickets credited to fans in total <DemoTag /></p>
      </div>
      <Table>
        {by === 'detail' && (<>
          <thead><tr><th>Fan</th><th>City</th><th>Show</th><th className="num">Tickets</th></tr></thead>
          <tbody>{[...refs].sort((a, b) => b.tickets - a.tickets).slice(0, 60).map((r, i) => (
            <tr key={i}><td>{fansById.get(r.fanId)?.handle}</td><td>{cityName(fansById.get(r.fanId)?.cityId ?? '')}</td><td>{label(r.showId)}</td><td className="num">{r.tickets}</td></tr>
          ))}</tbody>
        </>)}
        {by === 'show' && (<>
          <thead><tr><th>Show</th><th className="num">Sold</th><th className="num">Fan-driven</th><th className="num">Share</th></tr></thead>
          <tbody>{sum((r) => r.showId).map(([id, n]) => { const sh = showById.get(id); return (
            <tr key={id}><td>{label(id)}</td><td className="num">{sh?.sold}</td><td className="num">{n}</td><td className="num">{pct(sh?.sold ? n / sh.sold : 0)}</td></tr>) })}</tbody>
        </>)}
        {by === 'city' && (<>
          <thead><tr><th>City</th><th className="num">Fan-driven tickets</th><th className="num">Share of all</th></tr></thead>
          <tbody>{sum((r) => showById.get(r.showId)?.cityId ?? '').map(([id, n]) => (
            <tr key={id}><td>{cityName(id)}</td><td className="num">{n}</td><td className="num">{pct(total ? n / total : 0)}</td></tr>))}</tbody>
        </>)}
        {by === 'fan' && (<>
          <thead><tr><th>Fan</th><th>City</th><th className="num">Tickets</th><th className="num">Share of all</th></tr></thead>
          <tbody>{sum((r) => r.fanId).slice(0, 40).map(([id, n]) => (
            <tr key={id}><td>{fansById.get(id)?.handle}</td><td>{cityName(fansById.get(id)?.cityId ?? '')}</td><td className="num">{n}</td><td className="num">{pct(total ? n / total : 0)}</td></tr>))}</tbody>
        </>)}
      </Table>
      <p className="mb-0 mt-3 text-xs text-mute">Attribution is not the same as lift. A pilot should measure tickets that would not have sold anyway.</p>
    </>
  )
}

function Cost() {
  const { s, monthReferred } = useAgentData()
  const [n, setN] = useState<number | null>(null)
  const tickets = n ?? monthReferred
  const per = directPerTicket()
  const fee = PRICING.directMonthly
  const total = fee + per * tickets
  const eff = tickets ? total / tickets : 0
  const ads = tickets * s.agent.adCpt
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="grid content-start gap-4">
        <Field label={`Referred tickets this month: ${tickets}`}>
          <input type="range" min={0} max={Math.max(600, monthReferred * 2)} value={tickets} className="w-full accent-[#272727]" onChange={(e) => setN(Number(e.target.value))} />
        </Field>
        <p className="m-0 text-xs text-mute">Starts at the fan-driven tickets in the last and next 30 days ({monthReferred}). Drag to try other volumes.</p>
        <Field label="Paid ads cost per ticket (mock, edit me)">
          <input className="field" type="number" min={1} step={0.5} value={s.agent.adCpt} onChange={(e) => patchAgent({ adCpt: Math.max(1, Number(e.target.value) || 1) })} />
        </Field>
      </div>
      <div>
        <Table>
          <tbody>
            <tr><td>Monthly fee</td><td className="num">{money(fee)}</td></tr>
            <tr><td>{tickets} referred tickets x {money(per)} (5% of {money(TICKET_PRICE, 0)})</td><td className="num">{money(per * tickets)}</td></tr>
            <tr className="font-bold"><td>Total this month</td><td className="num">{money(total)}</td></tr>
            <tr><td>Cost per ticket with us</td><td className="num">{money(eff)}</td></tr>
            <tr><td>Same tickets via paid ads at {money(s.agent.adCpt)} each</td><td className="num">{money(ads)}</td></tr>
            <tr className="font-bold"><td>Difference</td><td className="num">{money(ads - total)}</td></tr>
          </tbody>
        </Table>
        <p className="mb-0 mt-3 text-sm">You pay per ticket that sells, never per click. Self-referrals are blocked and flagged buys are reviewed before billing (mocked). Refunded tickets are not billed.</p>
        <p className="mb-0 mt-2 text-xs text-mute">Ad cost per ticket is an illustrative mock figure, not a benchmark.</p>
      </div>
    </div>
  )
}

function EnterData() {
  const { s, arts, artById, shows } = useAgentData()
  const [msg, setMsg] = useState('')

  const addArtist = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name')).trim()
    if (!name) return
    patchAgent((a) => ({
      customArtists: [...a.customArtists, { id: uid('c'), name, genre: String(f.get('genre')).trim() || 'Genre not set', blurb: '', ig: '', earlyCutoff: todayISO(), custom: true }],
    }))
    e.currentTarget.reset()
    setMsg(`Added ${name}.`)
  }
  const addDate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const capacity = Number(f.get('capacity'))
    const sold = Number(f.get('sold')) || 0
    if (!(capacity > 0)) return setMsg('Capacity must be more than zero.')
    if (sold > capacity) return setMsg('Sold cannot be more than capacity.')
    patchAgent((a) => ({
      customShows: [...a.customShows, {
        id: uid('s'), artistId: String(f.get('artist')), cityId: String(f.get('city')), venue: String(f.get('venue')).trim() || 'Venue TBD',
        date: String(f.get('date')), capacity, sold, price: Number(f.get('price')) || TICKET_PRICE, custom: true,
      }],
    }))
    e.currentTarget.reset()
    setMsg('Tour date added. Fans in that city can see it in the fan app.')
  }

  return (
    <div className="grid gap-8">
      <p role="status" className="m-0 min-h-6 text-sm font-bold">{msg}</p>
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={addArtist} className="grid content-start gap-3" aria-labelledby="aa-h">
          <h3 id="aa-h" className="m-0 font-bold">Add an artist</h3>
          <Field label="Name"><input className="field" name="name" required maxLength={50} autoComplete="off" /></Field>
          <Field label="Genre"><input className="field" name="genre" maxLength={40} autoComplete="off" /></Field>
          <button className="btn btn-solid w-fit" type="submit">Add artist</button>
        </form>
        <form onSubmit={addDate} className="grid content-start gap-3" aria-labelledby="ad-h">
          <h3 id="ad-h" className="m-0 font-bold">Add a tour date</h3>
          <Field label="Artist"><select className="field" name="artist" required>{arts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City"><select className="field" name="city" defaultValue="columbus">{cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
            <Field label="Date"><input className="field" name="date" type="date" min={todayISO()} required /></Field>
          </div>
          <Field label="Venue"><input className="field" name="venue" maxLength={50} autoComplete="off" /></Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Capacity"><input className="field" name="capacity" type="number" min={1} defaultValue={300} required /></Field>
            <Field label="Sold so far"><input className="field" name="sold" type="number" min={0} defaultValue={0} /></Field>
            <Field label="Ticket price"><input className="field" name="price" type="number" min={1} step={0.5} defaultValue={TICKET_PRICE} /></Field>
          </div>
          <button className="btn btn-solid w-fit" type="submit">Add tour date</button>
        </form>
      </div>
      <div>
        <h3 className="m-0 mb-2 font-bold">Entered by you</h3>
        {s.agent.customArtists.length + s.agent.customShows.length === 0 && <p className="m-0 text-sm">Nothing yet.</p>}
        <ul className="m-0 list-none p-0">
          {s.agent.customArtists.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 border-t border-ink py-2 text-sm">
              <span>Artist: {a.name}</span>
              <button className="btn btn-sm" onClick={() => patchAgent((x) => ({ customArtists: x.customArtists.filter((y) => y.id !== a.id), customShows: x.customShows.filter((z) => z.artistId !== a.id) }))}>Remove</button>
            </li>
          ))}
          {shows.filter((x) => x.custom).map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 border-t border-ink py-2 text-sm">
              <span>Date: {artById.get(x.artistId)?.name}, {cityName(x.cityId)}, {fmtDate(x.date)}</span>
              <button className="btn btn-sm" onClick={() => patchAgent((a) => ({ customShows: a.customShows.filter((z) => z.id !== x.id) }))}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
      <div><button className="btn btn-sm" onClick={() => { resetAll(); setMsg('All demo data reset, fan side too.') }}>Reset all demo data</button></div>
    </div>
  )
}

/* ---------- Page ---------- */

export default function Agent() {
  const [tab, setTab] = useState<Tab>('overview')
  const [sel, setSel] = useState('')
  const goActivate = (id: string) => { setSel(id); setTab('dates') }

  return (
    <Page art={56} hero={
      <>
        <h1 className="m-0 text-xl font-bold">Agent/Artist Backend</h1>
      </>
    }>
      <div className="grid md:grid-cols-[190px_1fr]">
        <nav aria-label="Agent sections" className="border-b border-ink p-3 md:border-b-0 md:border-r">
          <ul className="m-0 flex list-none gap-2 overflow-x-auto p-0 md:flex-col">
            {TABS.map(([id, label]) => (
              <li key={id}><button className="btn btn-sm w-full whitespace-nowrap text-left" aria-current={tab === id} onClick={() => setTab(id)}>{label}</button></li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 px-4 py-5 md:px-6">
          {tab === 'overview' && <Overview go={goActivate} />}
          {tab === 'dates' && <Dates sel={sel} setSel={setSel} />}
          {tab === 'attrib' && <Attribution />}
          {tab === 'cost' && <Cost />}
          {tab === 'enter' && <EnterData />}
        </div>
      </div>
    </Page>
  )
}
