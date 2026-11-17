import type { Show } from './types'
import { addDays } from '../lib/format'

// Dates are relative to today so the demo never goes stale. Ticket price is $25 throughout.
const s = (
  id: string, artistId: string, cityId: string, venue: string,
  days: number, capacity: number, sold: number,
): Show => ({ id, artistId, cityId, venue, date: addDays(days), capacity, sold, price: 25 })

export const shows: Show[] = [
  // Samba Jean-Baptiste
  s('ms-nyc', 'samba-jean-baptiste', 'nyc', 'The Understudy', 6, 350, 350),
  s('ms-athens', 'samba-jean-baptiste', 'athens', 'Foxglove Social', 9, 300, 128),
  s('ms-columbus', 'samba-jean-baptiste', 'columbus', 'Brick & Reed', 17, 400, 190),
  s('ms-austin', 'samba-jean-baptiste', 'austin', 'Pale Door', 31, 450, 110),
  s('ms-burlington', 'samba-jean-baptiste', 'burlington', 'Halfmoon Room', 44, 200, 40),
  s('ms-athens-p', 'samba-jean-baptiste', 'athens', 'Cinder Hall', -20, 300, 292),
  s('ms-columbus-p', 'samba-jean-baptiste', 'columbus', 'Brick & Reed', -45, 400, 351),
  // Greg Freeman
  s('lb-la', 'greg-freeman', 'la', 'Lantern Yard', 12, 500, 500),
  s('lb-austin', 'greg-freeman', 'austin', 'Pale Door', 5, 450, 232),
  s('lb-richmond', 'greg-freeman', 'richmond', 'The Annex', 19, 350, 120),
  s('lb-annarbor', 'greg-freeman', 'annarbor', 'Sunken Garden Club', 26, 250, 140),
  s('lb-athens', 'greg-freeman', 'athens', 'Cinder Hall', 38, 300, 60),
  s('lb-austin-p', 'greg-freeman', 'austin', 'Pale Door', -14, 450, 410),
  // Westside Cowboy
  s('co-nyc', 'westside-cowboy', 'nyc', 'Warehouse Nine', 21, 600, 600),
  s('co-annarbor', 'westside-cowboy', 'annarbor', 'Sunken Garden Club', 8, 250, 241),
  s('co-burlington', 'westside-cowboy', 'burlington', 'Halfmoon Room', 13, 200, 70),
  s('co-columbus', 'westside-cowboy', 'columbus', 'Brick & Reed', 24, 400, 230),
  s('co-richmond', 'westside-cowboy', 'richmond', 'The Annex', 40, 350, 80),
  s('co-annarbor-p', 'westside-cowboy', 'annarbor', 'Sunken Garden Club', -9, 250, 250),
  // Telescreens
  s('tc-columbus', 'telescreens', 'columbus', 'Brick & Reed', 3, 400, 215),
  s('tc-richmond', 'telescreens', 'richmond', 'The Annex', 11, 350, 160),
  s('tc-athens', 'telescreens', 'athens', 'Foxglove Social', 23, 300, 130),
  s('tc-burlington', 'telescreens', 'burlington', 'Halfmoon Room', 29, 200, 95),
  s('tc-la', 'telescreens', 'la', 'Lantern Yard', 33, 500, 470),
  s('tc-richmond-p', 'telescreens', 'richmond', 'The Annex', -30, 350, 339),
]
