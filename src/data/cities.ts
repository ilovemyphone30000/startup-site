import type { City } from './types'

// Mock markets. Home markets sell out on their own; the rest are where tickets sit.
export const cities: City[] = [
  { id: 'nyc', name: 'New York, NY', kind: 'home', note: 'Home market' },
  { id: 'la', name: 'Los Angeles, CA', kind: 'home', note: 'Home market' },
  { id: 'athens', name: 'Athens, GA', kind: 'college', note: 'College town' },
  { id: 'annarbor', name: 'Ann Arbor, MI', kind: 'college', note: 'College town' },
  { id: 'burlington', name: 'Burlington, VT', kind: 'b-market', note: 'B-market' },
  { id: 'columbus', name: 'Columbus, OH', kind: 'college', note: 'College town' },
  { id: 'austin', name: 'Austin, TX', kind: 'b-market', note: 'Secondary market' },
  { id: 'richmond', name: 'Richmond, VA', kind: 'b-market', note: 'Secondary market' },
]
export const cityById = (id: string) => cities.find((c) => c.id === id)
export const cityName = (id: string) => cityById(id)?.name ?? id
export const isHomeCity = (id: string) => cityById(id)?.kind === 'home'
/** Cities the fan app and leaderboards cover. */
export const fanCities = cities.filter((c) => c.kind !== 'home')
