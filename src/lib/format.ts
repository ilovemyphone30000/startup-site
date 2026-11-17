export const money = (n: number, digits = 2) =>
  `$${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
export const pct = (n: number) => `${Math.round(n * 100)}%`
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x'
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

const noon = (d: Date) => { d.setHours(12, 0, 0, 0); return d }
const isoLocal = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** ISO date string n days from today (negative = past). */
export const addDays = (n: number) => { const d = noon(new Date()); d.setDate(d.getDate() + n); return isoLocal(d) }
export const todayISO = () => isoLocal(new Date())
export const daysUntil = (iso: string) =>
  Math.round((noon(new Date(iso + 'T12:00:00')).getTime() - noon(new Date()).getTime()) / 864e5)
export const fmtDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
export const fmtDateLong = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
export const uid = (p = 'id') => `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
