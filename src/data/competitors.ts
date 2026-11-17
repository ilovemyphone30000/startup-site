import { NAME } from '../config'

// Qualitative comparison from our own read of public descriptions and interviews.
// Not verified feature by feature. Check before presenting.
export interface Competitor { name: string; what: string; tracksAcross: string; perSold: string; us?: boolean }

export const competitors: Competitor[] = [
  { name: NAME, what: 'Fan-powered ticket promotion', tracksAcross: 'Yes. One score across every show, artist and city', perSold: 'Yes', us: true },
  { name: 'Tixr Rewards', what: 'Referral rewards inside one ticketing platform', tracksAcross: 'No. Single event', perSold: 'No' },
  { name: 'Posh Kickback', what: 'Referral rewards inside one ticketing platform', tracksAcross: 'No. Single event', perSold: 'No' },
  { name: 'Laylo', what: 'Fan messaging and drops for artists', tracksAcross: 'Not their focus', perSold: 'Not their model' },
  { name: 'Bandsintown', what: 'Concert discovery and alerts', tracksAcross: 'Not their focus', perSold: 'Not their model' },
  { name: 'DICE', what: 'Ticketing and discovery app', tracksAcross: 'Not their focus', perSold: 'Not their model' },
  { name: 'Street teams', what: 'Local volunteers who post and hand out flyers', tracksAcross: 'Manual, rarely tracked', perSold: 'Usually perks or cash up front' },
]
