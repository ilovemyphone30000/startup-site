import type { Tier } from './types'
import { NAME } from '../config'

// Tiers run on Fan Score, which is shared across every artist on the platform.
export const LADDER: Tier[] = [
  { id: 'guest', name: 'Guest list', at: 50, perk: `Name on the door list at any show on ${NAME}.` },
  { id: 'soundcheck', name: 'Soundcheck or meet-and-greet', at: 150, perk: 'Early entry and a few minutes with the artist.' },
  { id: 'commission', name: 'Paid commission', at: 300, perk: 'A cut of ticket sales you drive at partner shows.' },
  { id: 'intro', name: 'Intro to an agent or promoter', at: 600, perk: 'A warm introduction. Your score is your resume.' },
]
