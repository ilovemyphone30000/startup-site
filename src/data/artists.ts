import type { Artist } from './types'
import { addDays } from '../lib/format'

// All artists are fictional. The agent is fictional too.
export const AGENCY = 'Demo Agency (fictional)'

export const artists: Artist[] = [
  { id: 'marigold-static', name: 'Marigold Static', genre: 'Dream pop, four piece', ig: 'marigold.static.demo',
    blurb: 'Hazy guitars, big choruses. Sells out at home, quiet on the road.', earlyCutoff: addDays(-120) },
  { id: 'late-bus-home', name: 'Late Bus Home', genre: 'Indie rock', ig: 'latebushome.demo',
    blurb: 'Loud and sweet. Strong with students.', earlyCutoff: addDays(-200) },
  { id: 'cousin-orbit', name: 'Cousin Orbit', genre: 'Electronic duo', ig: 'cousin.orbit.demo',
    blurb: 'Live drums over synth loops. Great late sets.', earlyCutoff: addDays(-90) },
  { id: 'tin-cathedral-choir', name: 'Tin Cathedral Choir', genre: 'Chamber folk punk', ig: 'tincathedral.demo',
    blurb: 'Eight people, one stage, no amps.', earlyCutoff: addDays(-150) },
]
