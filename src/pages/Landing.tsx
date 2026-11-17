import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'
import { Section, Field, Table } from '../components/ui'
import { NAME, PRICING, TICKET_PRICE, directPerTicket } from '../config'
import { shows } from '../data/shows'
import { cityName, fanCities } from '../data/cities'
import { competitors } from '../data/competitors'
import { daysUntil, money } from '../lib/format'
import { update, useStore } from '../lib/store'

function SeatGrid({ sold, capacity, caption, label }: { sold: number; capacity: number; caption: string; label: string }) {
  const filled = Math.round((sold / capacity) * 100)
  return (
    <figure className="m-0">
      <div role="img" aria-label={`${label}: ${sold} of ${capacity} tickets sold`} className="grid w-fit grid-cols-10 gap-[3px]">
        {Array.from({ length: 100 }, (_, i) => (
          <span key={i} className={`block h-3.5 w-3.5 border border-ink ${i < filled ? 'bg-ink' : ''}`} />
        ))}
      </div>
      <figcaption className="mt-2 text-sm">{caption}</figcaption>
    </figure>
  )
}

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="m-0 mb-3 font-bold">{title}</h3>
      <ol className="m-0 list-none p-0">
        {steps.map((t, i) => (
          <li key={t} className="flex gap-3 border-t border-ink py-3">
            <span className="font-bold">0{i + 1}</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Waitlist() {
  const { waitlist } = useStore()
  const [done, setDone] = useState<'fan' | 'agent' | null>(null)

  const submit = (kind: 'fan' | 'agent') => (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    update((s) => ({
      ...s,
      waitlist: [...s.waitlist, { kind, email: String(f.get('email')), a: String(f.get('a')), b: String(f.get('b')), at: new Date().toISOString() }],
    }))
    e.currentTarget.reset()
    setDone(kind)
  }

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={submit('fan')} className="grid gap-3" aria-labelledby="wl-fan">
          <h3 id="wl-fan" className="m-0 font-bold">Fans and students</h3>
          <Field label="Email"><input className="field" name="email" type="email" required autoComplete="off" /></Field>
          <Field label="Your city or campus">
            <select className="field" name="a" required defaultValue="">
              <option value="" disabled>Pick one</option>
              {fanCities.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Shows you go to each month">
            <select className="field" name="b" defaultValue="2 to 3">
              <option>0 to 1</option><option>2 to 3</option><option>4 or more</option>
            </select>
          </Field>
          <button className="btn btn-solid" type="submit">Join the fan waitlist</button>
          {done === 'fan' && <p role="status" className="m-0 text-sm">Saved on this device. Demo only, nothing is sent.</p>}
        </form>
        <form onSubmit={submit('agent')} className="grid gap-3" aria-labelledby="wl-agent">
          <h3 id="wl-agent" className="m-0 font-bold">Agents and managers</h3>
          <Field label="Work email"><input className="field" name="email" type="email" required autoComplete="off" /></Field>
          <Field label="Agency or management company"><input className="field" name="a" type="text" required autoComplete="off" /></Field>
          <Field label="Artists on your roster">
            <select className="field" name="b" defaultValue="3 to 5">
              <option>1 to 2</option><option>3 to 5</option><option>6 or more</option>
            </select>
          </Field>
          <button className="btn btn-solid" type="submit">Join the agent waitlist</button>
          {done === 'agent' && <p role="status" className="m-0 text-sm">Saved on this device. Demo only, nothing is sent.</p>}
        </form>
      </div>
      <p className="mb-0 mt-6 border border-ink p-3 text-sm">
        Demo only. Nothing is sent. Submissions are stored in this browser's localStorage.
        {waitlist.length > 0 && (
          <> {waitlist.length} saved here.{' '}
            <button className="underline" onClick={() => update((s) => ({ ...s, waitlist: [] }))}>Clear</button></>
        )}
      </p>
    </>
  )
}

export default function Landing() {
  const home = shows.find((s) => s.id === 'ms-nyc')!
  const away = shows.find((s) => s.id === 'ms-athens')!

  return (
    <Page
      hero={
        <>
          <h1 className="m-0 font-normal">
            {NAME} is a fan-powered ticket promotion platform for developing artists. When a show is selling slowly in a
            secondary or college market, we activate the local superfans and students who already bring friends, track every
            ticket they drive, and reward them. Booking agents and managers pay per ticket that sells. Fans pay nothing.
          </h1>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="btn btn-solid" to="/fan">I'm a fan</Link>
            <Link className="btn" to="/agent">I'm an agent / manager</Link>
          </div>
        </>
      }
    >
      <Section id="problem" title="The problem" open>
        <div className="grid gap-8 md:grid-cols-2">
          <SeatGrid sold={home.sold} capacity={home.capacity} label="Home market show"
            caption={`${cityName(home.cityId)}: sold out, ${home.sold} of ${home.capacity}`} />
          <SeatGrid sold={away.sold} capacity={away.capacity} label="Secondary market show"
            caption={`${cityName(away.cityId)}: ${away.sold} of ${away.capacity} sold, ${daysUntil(away.date)} days out`} />
        </div>
      </Section>

      <Section id="how" title="How it works">
        <div className="grid gap-8 md:grid-cols-2">
          <Steps title="For fans" steps={[
            'Pick your city or campus and a show you are going to.',
            'Share your link to the group chat. Friends buy through it.',
            'Earn Fan Score that follows you to every artist: guest list, soundcheck, commission, an intro to the industry.',
          ]} />
          <Steps title="For agents and managers" steps={[
            'Add your roster and tour dates.',
            'We flag slow cities and activate the top local fans.',
            'Pay only for tickets that sell, and see which fans sold them.',
          ]} />
        </div>
        <p className="mt-6 max-w-2xl">VIP perks without VIP prices. Fraud controls are built in: self-referrals are blocked and fans buying through their own link are flagged (mocked in this demo).</p>
      </Section>

      <Section id="pricing" title="Pricing" note={`Assumes a ${money(TICKET_PRICE, 0)} ticket.`}>
        <div className="grid border-y border-ink md:grid-cols-3 md:border-x">
          <div className="cell md:border-l-0">
            <h3 className="m-0 font-bold">Fans</h3>
            <p className="my-2 font-bold">{money(0, 0)}</p>
            <p className="m-0 text-sm">The app is a free download. Fans earn, they never pay.</p>
          </div>
          <div className="cell">
            <h3 className="m-0 font-bold">Direct</h3>
            <p className="my-2 font-bold">{money(PRICING.directMonthly, 0)}/month + 5% per referred ticket</p>
            <p className="m-0 text-sm">Booking agents and managers. 5% of a {money(TICKET_PRICE, 0)} ticket is {money(directPerTicket())}.</p>
          </div>
          <div className="cell">
            <h3 className="m-0 font-bold">B2B reseller</h3>
            <p className="my-2 font-bold">{money(PRICING.resellerMonthly, 0)}/month + {money(PRICING.resellerPerTicket)} per ticket</p>
            <p className="m-0 text-sm">Promoters, labels and agencies. They charge their artists {money(PRICING.resellerCharge)}.</p>
          </div>
        </div>
      </Section>

      <Section id="different" title="How we're different" note="Our read of public descriptions and interviews. Not verified feature by feature.">
        <Table>
          <thead><tr><th>Tool</th><th>What it is</th><th>Tracks one fan across shows, artists and cities</th><th>Artist pays only for tickets that sell</th></tr></thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.name} className={c.us ? 'font-bold' : ''}>
                <th scope="row" className="!border-b !border-ink font-bold">{c.name}</th><td>{c.what}</td><td>{c.tracksAcross}</td><td>{c.perSold}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <h3 className="mb-2 mt-6 font-bold">What if</h3>
        <ul className="m-0 grid max-w-2xl gap-2 pl-5">
          <li>What if we rewarded independent promoters for bringing people to shows?</li>
          <li>What if agencies, up-and-coming artists and curators were partners, not just customers?</li>
          <li>What if superfans turned somewhat-fans into superfans?</li>
        </ul>
      </Section>

      <Section id="waitlist" title="Waitlist">
        <Waitlist />
      </Section>
    </Page>
  )
}
