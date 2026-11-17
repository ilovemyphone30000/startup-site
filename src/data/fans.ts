import type { Fan, LoggedShow } from './types'

// Fictional handles, six per city. None are real accounts.
const byCity: Record<string, string[]> = {
  athens: ['gutter.glow', 'basement.bee', 'porchlight.pj', 'kudzu.kid', 'twelve.inch', 'slowdance.sam'],
  annarbor: ['diag.dreamer', 'mitten.mixtape', 'quad.ghost', 'northcampus.nia', 'vinyl.vera', 'oldwest.owen'],
  burlington: ['lakeeffect.lou', 'maple.static', 'church.st.cass', 'ferry.fern', 'greenmtn.gig', 'cold.open.cleo'],
  columbus: ['highst.hazel', 'buckeye.bass', 'shortnorth.sol', 'oval.ollie', 'capcity.cat', 'clintonville.cy'],
  austin: ['sixth.sixty', 'batbridge.bo', 'eastside.ez', 'barton.beat', 'queso.quinn', 'southlamar.lu'],
  richmond: ['fan.district.fi', 'carytown.cal', 'rivercity.rue', 'belleisle.bea', 'jacksonward.jo', 'museum.mo'],
}

export const fans: Fan[] = Object.entries(byCity).flatMap(([cityId, handles]) =>
  handles.map((handle, i): Fan => ({
    id: `f-${cityId}-${i}`,
    handle,
    cityId,
    dayOneArtistIds: i === 0 ? ['samba-jean-baptiste'] : i === 3 ? ['westside-cowboy'] : [],
  })),
)

/** The demo user starts with three shows already logged (183 points of history lives here). */
export const SEED_LOGGED: LoggedShow[] = [
  { id: 'seed-1', showId: 'ms-athens-p', artistLabel: '', cityLabel: '', friends: 4, via: 3 },
  { id: 'seed-2', showId: 'ms-columbus-p', artistLabel: '', cityLabel: '', friends: 3, via: 2 },
  { id: 'seed-3', showId: 'lb-austin-p', artistLabel: '', cityLabel: '', friends: 2, via: 2 },
]
/** Day one badges the demo user starts with, from platform data. */
export const SEED_DAY_ONE = ['samba-jean-baptiste', 'geese']
/** Sample dates for the demo Day one badges: when the fan first followed, and first went to a show. */
export const SEED_DAY_ONE_DETAILS: Record<string, { followed: string; firstShow: string }> = {
  'samba-jean-baptiste': { followed: '2025-01-09', firstShow: '2025-03-22' },
  geese: { followed: '2024-08-03', firstShow: '2024-10-19' },
}
