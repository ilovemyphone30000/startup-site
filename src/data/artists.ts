import type { Artist } from './types'
import { addDays } from '../lib/format'

// The four names are placeholders for the class demo. Every date, venue, sales figure and
// fan below is made up. Nothing here describes these artists' real shows or sales.
export const AGENCY = 'Demo Agency (fictional)'

const demo = (id: string, name: string, ig: string, early: number): Artist =>
  ({ id, name, genre: 'Demo data', blurb: '', ig, earlyCutoff: addDays(early) })

export const artists: Artist[] = [
  demo('samba-jean-baptiste', 'Samba Jean-Baptiste', 'sambajb.demo', -120),
  demo('greg-freeman', 'Greg Freeman', 'gregfreeman.demo', -200),
  demo('westside-cowboy', 'Westside Cowboy', 'westsidecowboy.demo', -90),
  demo('telescreens', 'Telescreens', 'telescreens.demo', -150),
  demo('geese', 'Geese', 'geese.demo', -200),
]
