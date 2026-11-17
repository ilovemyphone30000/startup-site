import { artists as baseArtists } from '../data/artists'
import { shows as baseShows } from '../data/shows'
import { fans as baseFans, SEED_DAY_ONE } from '../data/fans'
import { referrals as baseReferrals } from '../data/referrals'
import { LADDER } from '../data/rewards'
import type { Artist, Fan, Referral, Show, State } from '../data/types'
import { MONTH_WINDOW, RISK, SCORE_WEIGHTS } from '../config'
import { daysUntil, norm } from './format'

export const YOU = 'you'

export const getArtists = (s: State): Artist[] => [...baseArtists, ...s.agent.customArtists]

/** All shows with agent edits applied, plus friend purchases simulated in the fan app. */
export function getShows(s: State): Show[] {
  return [...baseShows, ...s.agent.customShows].map((sh) => {
    const base = s.agent.soldOverride[sh.id] ?? sh.sold
    return { ...sh, sold: Math.min(sh.capacity, base + (s.fan.extra[sh.id] ?? 0)) }
  })
}
export const sellThrough = (sh: Show) => (sh.capacity > 0 ? sh.sold / sh.capacity : 0)
export const seatsLeft = (sh: Show) => Math.max(0, sh.capacity - sh.sold)

export function isAtRisk(sh: Show) {
  const d = daysUntil(sh.date)
  if (d < 0) return false
  const st = sellThrough(sh)
  return (d <= RISK.nearDays && st < RISK.nearBelow) || (d <= RISK.midDays && st < RISK.midBelow)
}
export const inWindow = (sh: Show) => {
  const d = daysUntil(sh.date)
  return d >= MONTH_WINDOW.from && d <= MONTH_WINDOW.to
}

export const getFans = (s: State): Fan[] => [
  { id: YOU, handle: s.fan.handle.trim() || 'you.demo', cityId: s.fan.cityId, dayOneArtistIds: SEED_DAY_ONE },
  ...baseFans,
]

/** The demo user's own tickets driven, by show: logged shows plus simulated friend buys. */
export function myShowTickets(s: State): Map<string, number> {
  const m = new Map<string, number>()
  for (const l of s.fan.logged) if (l.showId && l.via > 0) m.set(l.showId, (m.get(l.showId) ?? 0) + l.via)
  for (const [id, n] of Object.entries(s.fan.extra)) if (n > 0) m.set(id, (m.get(id) ?? 0) + n)
  return m
}
export const getReferrals = (s: State): Referral[] => [
  ...baseReferrals,
  ...[...myShowTickets(s)].map(([showId, tickets]) => ({ fanId: YOU, showId, tickets })),
]

export function matchArtist(label: string, list: Artist[]): Artist | undefined {
  const n = norm(label)
  return n ? list.find((a) => norm(a.name) === n || norm(a.ig) === n) : undefined
}

export function fanStats(s: State) {
  const arts = getArtists(s)
  const byId = new Map(getShows(s).map((x) => [x.id, x]))
  const f = s.fan
  const W = SCORE_WEIGHTS

  const ticketsDriven = [...myShowTickets(s).values()].reduce((a, b) => a + b, 0)
  const attended = f.logged.length
  const friends = f.logged.reduce((a, l) => a + l.friends, 0)

  const artistKeys = new Set<string>()
  for (const l of f.logged) {
    const sh = l.showId ? byId.get(l.showId) : undefined
    artistKeys.add(sh ? sh.artistId : `x:${norm(l.artistLabel)}`)
  }
  for (const [id, n] of Object.entries(f.extra)) {
    const sh = byId.get(id)
    if (n > 0 && sh) artistKeys.add(sh.artistId)
  }

  // Imported accounts: which platform artists they confirm, and since when.
  const firstSeen = new Map<string, string>()
  for (const sg of f.signals) {
    const a = matchArtist(sg.artist, arts)
    if (!a) continue
    const cur = firstSeen.get(a.id)
    if (!cur || sg.firstSeen < cur) firstSeen.set(a.id, sg.firstSeen)
  }
  const verified = [...firstSeen.keys()]
  const dayOne = new Set<string>(SEED_DAY_ONE)
  for (const [id, d] of firstSeen) {
    const a = arts.find((x) => x.id === id)
    if (a && d < a.earlyCutoff) dayOne.add(id)
  }

  const rows = [
    { label: 'Tickets driven', n: ticketsDriven, pts: ticketsDriven * W.ticketDriven, each: W.ticketDriven },
    { label: 'Shows attended', n: attended, pts: attended * W.showAttended, each: W.showAttended },
    { label: 'Friends brought', n: friends, pts: friends * W.friendBrought, each: W.friendBrought },
    { label: 'Artists supported', n: artistKeys.size, pts: artistKeys.size * W.artistSupported, each: W.artistSupported },
    { label: 'Artists verified by your accounts', n: verified.length, pts: verified.length * W.verifiedArtist, each: W.verifiedArtist },
    { label: 'Day one badges', n: dayOne.size, pts: dayOne.size * W.dayOne, each: W.dayOne },
  ]
  const score = rows.reduce((a, r) => a + r.pts, 0)
  return { rows, score, ticketsDriven, attended, friends, artistCount: artistKeys.size, dayOne: [...dayOne], verified, firstSeen }
}

export function tierFor(score: number) {
  const cur = [...LADDER].reverse().find((t) => score >= t.at)
  const next = LADDER.find((t) => score < t.at)
  return { cur, next }
}

/** Local fans for a city, ranked by lifetime tickets driven. */
export function cityFans(s: State, cityId: string) {
  const agg = new Map<string, { tickets: number; shows: Set<string> }>()
  for (const r of getReferrals(s)) {
    const a = agg.get(r.fanId) ?? { tickets: 0, shows: new Set<string>() }
    a.tickets += r.tickets
    a.shows.add(r.showId)
    agg.set(r.fanId, a)
  }
  return getFans(s)
    .filter((f) => f.cityId === cityId)
    .map((fan) => {
      const a = agg.get(fan.id)
      const tickets = a?.tickets ?? 0
      const shows = a?.shows.size ?? 0
      return { fan, tickets, shows, avg: shows ? tickets / shows : 0 }
    })
    .sort((x, y) => y.tickets - x.tickets)
}

/** Mock model: top five local fans repeat their average per-show result, capped at seats left. */
export const projectedLift = (sh: Show, top: { avg: number }[]) =>
  Math.min(seatsLeft(sh), Math.round(top.slice(0, 5).reduce((a, x) => a + x.avg, 0)))

/** Top fans in a city over the monthly window. "You" counts wherever you drove tickets. */
export function leaderboard(s: State, cityId: string) {
  const ids = new Set(getShows(s).filter((x) => x.cityId === cityId && inWindow(x)).map((x) => x.id))
  const totals = new Map<string, number>()
  for (const r of getReferrals(s)) if (ids.has(r.showId)) totals.set(r.fanId, (totals.get(r.fanId) ?? 0) + r.tickets)
  return getFans(s)
    .filter((f) => f.cityId === cityId || f.id === YOU)
    .map((fan) => ({ fan, tickets: totals.get(fan.id) ?? 0 }))
    .sort((a, b) => b.tickets - a.tickets || a.fan.handle.localeCompare(b.fan.handle))
}
