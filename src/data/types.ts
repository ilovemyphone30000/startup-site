export interface City { id: string; name: string; kind: 'home' | 'college' | 'b-market'; note: string }
export interface Artist {
  id: string; name: string; genre: string; blurb: string
  ig: string          // fictional Instagram handle, used to match imported follows
  earlyCutoff: string // following or listening before this date counts as "Day one"
  custom?: boolean
}
export interface Show {
  id: string; artistId: string; cityId: string; venue: string
  date: string; capacity: number; sold: number; price: number; custom?: boolean
}
export interface Fan { id: string; handle: string; cityId: string; dayOneArtistIds: string[] }
export interface Referral { fanId: string; showId: string; tickets: number }
export interface Tier { id: string; name: string; at: number; perk: string }

export type SourceId = 'spotify' | 'lastfm' | 'instagram' | 'discogs' | 'dice' | 'setlistfm'
export interface Signal { source: SourceId; artist: string; firstSeen: string; count: number }
export interface SourceStatus { at: string; mode: 'sample' | 'file'; rows: number; fileName?: string }

export interface LoggedShow {
  id: string; showId?: string; artistLabel: string; cityLabel: string
  friends: number // friends I brought
  via: number     // of those, how many bought through my link
}
export interface Torch { to: string; cityId: string; note: string; at: string }
export interface FanState {
  handle: string; cityId: string; logged: LoggedShow[]
  extra: Record<string, number> // simulated friend purchases by show id
  torch: Torch | null
  signals: Signal[]
  sources: Partial<Record<SourceId, SourceStatus>>
}
export interface AgentState {
  customArtists: Artist[]; customShows: Show[]
  soldOverride: Record<string, number>
  activated: Record<string, number> // show id -> projected lift at activation
  adCpt: number
}
export interface WaitlistEntry { kind: 'fan' | 'agent'; email: string; a: string; b: string; at: string }
export interface State { fan: FanState; agent: AgentState; waitlist: WaitlistEntry[] }
