import type { Referral } from './types'
import { shows } from './shows'
import { fans } from './fans'
import { isHomeCity } from './cities'

// Mock attribution. Home-market shows sell out without fans, so they have none.
// Other shows get 18 to 34 percent of sales credited to five local fans, deterministically.
const SHARES = [0.31, 0.24, 0.28, 0.19, 0.34, 0.22, 0.27, 0.3, 0.2, 0.25, 0.33, 0.18]
const WEIGHTS = [0.34, 0.26, 0.19, 0.12, 0.09]

export const referrals: Referral[] = shows
  .filter((s) => !isHomeCity(s.cityId))
  .flatMap((s, i) => {
    const local = fans.filter((f) => f.cityId === s.cityId)
    const total = Math.round(s.sold * SHARES[i % SHARES.length])
    let left = total
    return WEIGHTS.map((w, k): Referral => {
      const tickets = k === WEIGHTS.length - 1 ? left : Math.round(total * w)
      left -= tickets
      return { fanId: local[(i + k) % local.length].id, showId: s.id, tickets: Math.max(0, tickets) }
    }).filter((r) => r.tickets > 0)
  })
