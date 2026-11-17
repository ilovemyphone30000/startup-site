import type { Signal } from './types'
import { addDays } from '../lib/format'

// Sample "exports" for the Sources tab. They mimic the real file formats so the same
// parsers run on them. Artists are the fictional demo artists.
const secs = (days: number) => Math.floor((Date.now() + days * 864e5) / 1000)
const iso = (days: number) => new Date(Date.now() + days * 864e5).toISOString()

/** Shape of following.json from Instagram's "Download your information" export. */
export const sampleInstagramJson = () =>
  JSON.stringify({
    relationships_following: [
      ['marigold.static.demo', -300], ['latebushome.demo', -90], ['cousin.orbit.demo', -40],
      ['tincathedral.demo', -400], ['some.other.account', -50],
    ].map(([value, d]) => ({
      title: '', media_list_data: [],
      string_list_data: [{ href: `https://www.instagram.com/${value}`, value, timestamp: secs(d as number) }],
    })),
  })

/** Shape of Streaming_History_Audio_*.json from Spotify's extended streaming history. */
export const sampleSpotifyJson = () => {
  const rows: object[] = []
  for (const [artist, first, plays] of [
    ['Marigold Static', -310, 30], ['Late Bus Home', -250, 40], ['Cousin Orbit', -30, 12],
    ['Tin Cathedral Choir', -100, 8], ['Some Other Band', -500, 20],
  ] as const) {
    for (let i = 0; i < plays; i++) {
      rows.push({
        ts: iso(first + Math.min(i, -first - 1)), ms_played: 180000,
        master_metadata_track_name: `Track ${i + 1}`, master_metadata_album_artist_name: artist,
      })
    }
  }
  return JSON.stringify(rows)
}

const sig = (source: Signal['source'], artist: string, days: number, count: number): Signal =>
  ({ source, artist, firstSeen: addDays(days), count })

/** Mock connectors. No network calls happen anywhere. */
export const sampleSignals: Record<'lastfm' | 'discogs' | 'dice', Signal[]> = {
  lastfm: [sig('lastfm', 'Tin Cathedral Choir', -420, 300), sig('lastfm', 'Cousin Orbit', -35, 120)],
  discogs: [sig('discogs', 'Cousin Orbit', -60, 2), sig('discogs', 'Marigold Static', -200, 1)],
  dice: [sig('dice', 'Late Bus Home', -14, 1), sig('dice', 'Tin Cathedral Choir', -30, 1)],
}
