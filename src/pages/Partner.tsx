import { useState } from 'react'
import { Page } from '../components/Layout'
import { Field, Table } from '../components/ui'
import { PRICING } from '../config'
import { artists } from '../data/artists'
import { getReferrals, getShows, inWindow } from '../lib/derive'
import { money } from '../lib/format'
import { useStore } from '../lib/store'

// Reseller view: a promoter, label or agency pays us $1.00 per ticket and charges its artists $1.25.
export default function Partner() {
  const s = useStore()
  const shows = new Map(getShows(s).map((x) => [x.id, x]))
  const perArtist = artists.map((a) => ({
    a,
    n: getReferrals(s).filter((r) => { const x = shows.get(r.showId); return x && x.artistId === a.id && inWindow(x) })
      .reduce((t, r) => t + r.tickets, 0),
  }))
  const real = perArtist.reduce((t, r) => t + r.n, 0)
  const [n, setN] = useState<number | null>(null)
  const tickets = n ?? real

  const margin = PRICING.resellerCharge - PRICING.resellerPerTicket
  const revenue = tickets * PRICING.resellerCharge
  const cost = PRICING.resellerMonthly + tickets * PRICING.resellerPerTicket
  const breakEven = Math.ceil(PRICING.resellerMonthly / margin)

  return (
    <Page art={56} hero={
      <>
        <h1 className="m-0 text-xl font-bold">Partner view</h1>
      </>
    }>
      <div className="grid gap-8 px-4 py-6 md:px-6 lg:grid-cols-2">
        <div>
          <h3 className="m-0 mb-2 font-bold">Client artists, last and next 30 days</h3>
          <Table>
            <thead><tr><th>Artist</th><th className="num">Fan-driven tickets</th><th className="num">We charge you</th><th className="num">You charge them</th><th className="num">Your margin</th></tr></thead>
            <tbody>
              {perArtist.map(({ a, n: k }) => (
                <tr key={a.id}><td>{a.name}</td><td className="num">{k}</td>
                  <td className="num">{money(k * PRICING.resellerPerTicket)}</td><td className="num">{money(k * PRICING.resellerCharge)}</td>
                  <td className="num">{money(k * margin)}</td></tr>
              ))}
              <tr className="font-bold"><td>Total</td><td className="num">{real}</td>
                <td className="num">{money(real * PRICING.resellerPerTicket)}</td><td className="num">{money(real * PRICING.resellerCharge)}</td>
                <td className="num">{money(real * margin)}</td></tr>
            </tbody>
          </Table>
        </div>
        <div className="grid content-start gap-4">
          <Field label={`Referred tickets this month: ${tickets}`}>
            <input type="range" min={0} max={Math.max(1000, real * 2)} value={tickets} className="w-full accent-[#272727]" onChange={(e) => setN(Number(e.target.value))} />
          </Field>
          <Table>
            <tbody>
              <tr><td>You charge artists ({money(PRICING.resellerCharge)} each)</td><td className="num">{money(revenue)}</td></tr>
              <tr><td>You pay us {money(PRICING.resellerMonthly)}/month</td><td className="num">-{money(PRICING.resellerMonthly)}</td></tr>
              <tr><td>You pay us {money(PRICING.resellerPerTicket)} per ticket</td><td className="num">-{money(tickets * PRICING.resellerPerTicket)}</td></tr>
              <tr className="font-bold"><td>Your net this month</td><td className="num">{money(revenue - cost)}</td></tr>
            </tbody>
          </Table>
          <p className="m-0 text-sm">
            Margin is {money(margin)} per ticket. If the {money(PRICING.resellerMonthly)} monthly fee is not passed on to artists,
            a partner breaks even at {breakEven} referred tickets a month.
          </p>
        </div>
      </div>
    </Page>
  )
}
