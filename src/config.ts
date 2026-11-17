// One place to rename the company. Change NAME and every page updates.
export const NAME = 'Plus 1'

export const CLASS_FOOTER =
  'NYU Entrepreneurship for the Music Industry, Fall 2026 class project. Team: Jonah, Daniel, Ronnie and Dylan.'

// Pricing from the channel deck. Assumes a $25 ticket.
export const TICKET_PRICE = 25
export const PRICING = {
  directMonthly: 100,
  directRate: 0.05, // 5% of ticket price per referred ticket
  resellerMonthly: 100,
  resellerPerTicket: 1.0, // reseller pays us
  resellerCharge: 1.25, // reseller charges the artist
}
export const directPerTicket = (price = TICKET_PRICE) => price * PRICING.directRate

// Fake link host. example.com is reserved, so these links never resolve to anything real.
export const REF_HOST = 'ref.example.com'

// Fan Score: how many points each action is worth.
export const SCORE_WEIGHTS = {
  ticketDriven: 10,
  showAttended: 5,
  friendBrought: 2,
  artistSupported: 3,
  verifiedArtist: 4, // artist confirmed by an imported account (Spotify, Instagram, ...)
  dayOne: 15,
}

// Fans can only pass the torch (hand their campus to a younger fan) from this Fan Score up.
export const TORCH_MIN_SCORE = 500

// "At risk" rule: low sell-through close to show date.
export const RISK = {
  nearDays: 14,
  nearBelow: 0.6,
  midDays: 30,
  midBelow: 0.35,
}

// Leaderboards and monthly numbers look at shows in this window (days from today).
export const MONTH_WINDOW = { from: -30, to: 30 }

export const STORE_KEY = 'demo.v1'
