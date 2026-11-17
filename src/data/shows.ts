import type { Show } from './types'
import { addDays } from '../lib/format'

// Dates are relative to today so the demo never goes stale. Ticket price is $25 throughout.
const s = (
  id: string, artistId: string, cityId: string, venue: string,
  days: number, capacity: number, sold: number,
): Show => ({ id, artistId, cityId, venue, date: addDays(days), capacity, sold, price: 25 })

export const shows: Show[] = [
  // Marigold Static
  s('ms-nyc', 'marigold-static', 'nyc', 'The Understudy', 6, 350, 350),
  s('ms-athens', 'marigold-static', 'athens', 'Foxglove Social', 9, 300, 128),
  s('ms-columbus', 'marigold-static', 'columbus', 'Brick & Reed', 17, 400, 190),
  s('ms-austin', 'marigold-static', 'austin', 'Pale Door', 31, 450, 110),
  s('ms-burlington', 'marigold-static', 'burlington', 'Halfmoon Room', 44, 200, 40),
  s('ms-athens-p', 'marigold-static', 'athens', 'Cinder Hall', -20, 300, 292),
  s('ms-columbus-p', 'marigold-static', 'columbus', 'Brick & Reed', -45, 400, 351),
  // Late Bus Home
  s('lb-la', 'late-bus-home', 'la', 'Lantern Yard', 12, 500, 500),
  s('lb-austin', 'late-bus-home', 'austin', 'Pale Door', 5, 450, 232),
  s('lb-richmond', 'late-bus-home', 'richmond', 'The Annex', 19, 350, 120),
  s('lb-annarbor', 'late-bus-home', 'annarbor', 'Sunken Garden Club', 26, 250, 140),
  s('lb-athens', 'late-bus-home', 'athens', 'Cinder Hall', 38, 300, 60),
  s('lb-austin-p', 'late-bus-home', 'austin', 'Pale Door', -14, 450, 410),
  // Cousin Orbit
  s('co-nyc', 'cousin-orbit', 'nyc', 'Warehouse Nine', 21, 600, 600),
  s('co-annarbor', 'cousin-orbit', 'annarbor', 'Sunken Garden Club', 8, 250, 241),
  s('co-burlington', 'cousin-orbit', 'burlington', 'Halfmoon Room', 13, 200, 70),
  s('co-columbus', 'cousin-orbit', 'columbus', 'Brick & Reed', 24, 400, 230),
  s('co-richmond', 'cousin-orbit', 'richmond', 'The Annex', 40, 350, 80),
  s('co-annarbor-p', 'cousin-orbit', 'annarbor', 'Sunken Garden Club', -9, 250, 250),
  // Tin Cathedral Choir
  s('tc-columbus', 'tin-cathedral-choir', 'columbus', 'Brick & Reed', 3, 400, 215),
  s('tc-richmond', 'tin-cathedral-choir', 'richmond', 'The Annex', 11, 350, 160),
  s('tc-athens', 'tin-cathedral-choir', 'athens', 'Foxglove Social', 23, 300, 130),
  s('tc-burlington', 'tin-cathedral-choir', 'burlington', 'Halfmoon Room', 29, 200, 95),
  s('tc-la', 'tin-cathedral-choir', 'la', 'Lantern Yard', 33, 500, 470),
  s('tc-richmond-p', 'tin-cathedral-choir', 'richmond', 'The Annex', -30, 350, 339),
]
