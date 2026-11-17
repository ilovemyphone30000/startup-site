import { useSyncExternalStore } from 'react'
import { STORE_KEY } from '../config'
import { SEED_LOGGED } from '../data/fans'
import type { AgentState, FanState, State } from '../data/types'

// One small store shared by the fan site and the agent backend, so data entered on one
// side shows up on the other. Everything lives in localStorage on this device only.
const init = (): State => ({
  fan: { handle: 'you.demo', cityId: 'athens', logged: SEED_LOGGED, extra: {}, torch: null, signals: [], sources: {} },
  agent: { customArtists: [], customShows: [], soldOverride: {}, activated: {}, adCpt: 14 },
  waitlist: [],
})

function load(): State {
  const d = init()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return d
    const p = JSON.parse(raw)
    return {
      fan: { ...d.fan, ...(p?.fan ?? {}) },
      agent: { ...d.agent, ...(p?.agent ?? {}) },
      waitlist: Array.isArray(p?.waitlist) ? p.waitlist : [],
    }
  } catch {
    return d
  }
}
function save(s: State) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(s)) } catch { /* private mode or blocked: keep in memory */ }
}

let state: State = load()
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === STORE_KEY) { state = load(); emit() } })
}

export const useStore = (): State => useSyncExternalStore(subscribe, () => state, () => state)
export const getState = () => state
export function update(fn: (s: State) => State) { state = fn(state); save(state); emit() }
export const patchFan = (p: Partial<FanState> | ((f: FanState) => Partial<FanState>)) =>
  update((s) => ({ ...s, fan: { ...s.fan, ...(typeof p === 'function' ? p(s.fan) : p) } }))
export const patchAgent = (p: Partial<AgentState> | ((a: AgentState) => Partial<AgentState>)) =>
  update((s) => ({ ...s, agent: { ...s.agent, ...(typeof p === 'function' ? p(s.agent) : p) } }))
export function resetAll() { state = init(); save(state); emit() }
