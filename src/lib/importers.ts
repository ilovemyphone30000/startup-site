import type { Signal } from '../data/types'

const day = (d: Date) => d.toISOString().slice(0, 10)

/**
 * Instagram "Download your information" (JSON) -> following.json.
 * Each entry holds a username and the unix timestamp of when you followed.
 * Everything is parsed in the browser. Nothing is uploaded.
 */
export function parseInstagram(text: string): Signal[] {
  const j = JSON.parse(text)
  const list: any[] = Array.isArray(j) ? j : (j.relationships_following ?? j.relationships_followers ?? [])
  const out: Signal[] = []
  for (const item of list) {
    for (const e of item?.string_list_data ?? []) {
      const artist = String(e?.value ?? item?.title ?? '').trim()
      const ts = Number(e?.timestamp)
      if (artist && ts) out.push({ source: 'instagram', artist, firstSeen: day(new Date(ts * 1000)), count: 1 })
    }
  }
  return out
}

/**
 * Spotify "Extended streaming history" (privacy data request) -> Streaming_History_Audio_*.json.
 * Handles the newer (ts, master_metadata_*) and older (endTime, artistName) layouts.
 * Collapses to one row per artist: first play date and play count.
 */
export function parseSpotify(text: string): Signal[] {
  const rows: any[] = JSON.parse(text)
  const byArtist = new Map<string, Signal>()
  for (const r of Array.isArray(rows) ? rows : []) {
    const artist = r?.master_metadata_album_artist_name ?? r?.artistName
    const when = r?.ts ?? r?.endTime
    const ms = r?.ms_played ?? r?.msPlayed ?? 60000
    if (!artist || !when || ms < 30000) continue // skip skips
    const d = String(when).slice(0, 10)
    const cur = byArtist.get(artist)
    if (!cur) byArtist.set(artist, { source: 'spotify', artist, firstSeen: d, count: 1 })
    else { cur.count++; if (d < cur.firstSeen) cur.firstSeen = d }
  }
  return [...byArtist.values()]
}

/** Parse several files of the same kind and merge the results. */
export function mergeSignals(all: Signal[]): Signal[] {
  const m = new Map<string, Signal>()
  for (const s of all) {
    const k = `${s.source}|${s.artist.toLowerCase()}`
    const cur = m.get(k)
    if (!cur) m.set(k, { ...s })
    else { cur.count += s.count; if (s.firstSeen < cur.firstSeen) cur.firstSeen = s.firstSeen }
  }
  return [...m.values()]
}
