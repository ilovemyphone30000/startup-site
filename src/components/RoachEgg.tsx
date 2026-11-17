import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { EGG_ROACH_KEY } from '../config'

// Easter egg: the first time someone opens the agent backend, an original line drawing of an
// angry cockroach (index finger up) draws itself for one second, then fades out.

const seen = () => { try { return localStorage.getItem(EGG_ROACH_KEY) === '1' } catch { return false } }
const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

const circle = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0`

const BODY: string[] = [
  // antennae and their bulbs
  'M122 38C90 8 44 30 20 92', circle(20, 92, 4),
  'M178 38C210 8 256 30 280 92', circle(280, 92, 4),
  // head, angry brows, eyes
  'M112 62C112 30 188 30 188 62C198 92 194 112 180 126L120 126C106 112 102 92 112 62Z',
  'M116 68L142 80', 'M184 68L158 80', circle(131, 88, 6), circle(169, 88, 6),
  // open mouth with teeth
  'M122 110C134 102 166 102 178 110C184 134 170 152 150 152C130 152 116 134 122 110Z',
  'M127 112l6 11l6-11l6 11l6-11l6 11l6-11l6 11l6-11', 'M130 148l5-9l5 9l5-9l5 9l5-9l5 9l5-9',
  // collar and segmented belly
  'M120 152C108 166 110 182 128 190L172 190C190 182 192 166 180 152',
  'M112 190L102 215L97 245L96 275L102 305L114 333L130 352Q150 360 170 352L186 333L198 305L204 275L203 245L198 215L188 190',
  'M102 215Q150 238 198 215', 'M97 245Q150 268 203 245', 'M96 275Q150 298 204 275',
  'M102 305Q150 326 198 305', 'M114 333Q150 350 186 333',
  // folded wing behind the raised arm
  'M108 204C58 238 46 330 80 402C90 412 104 406 102 390', 'M98 236C74 290 74 342 90 388',
  // raised arm: upper arm, forearm, fist, index finger up
  'M114 200C92 214 76 236 70 264', 'M122 216C106 230 94 246 92 264',
  'M70 264L58 226', 'M92 264L82 232',
  'M58 226C48 212 52 196 68 196C82 196 90 210 82 232', 'M62 197L60 158Q64 150 69 158L72 197',
  'M74 205v12', 'M80 210v10',
  // hanging arm and hand
  'M186 200C214 216 232 252 240 300', 'M178 216C198 234 212 262 218 300',
  'M240 300C250 316 252 330 246 340', 'M218 300C220 318 226 332 234 342', 'M246 340L234 342',
  'M232 318L236 342', 'M241 312L247 338',
]

const LEG: string[] = [
  'M126 352C112 392 110 432 102 476', 'M148 358C134 398 130 438 122 476',
  'M102 476L100 516C76 520 48 526 34 546L96 548L122 520L122 476',
  'M36 544l-10 12l22-4', 'M104 432q8-6 16 0',
]

/** The same drawing, shrunk to a mouse pointer. The raised index finger is the click point. */
function cursorUrl() {
  const paths = (list: string[]) => list.map((d) => `<path d="${d}"/>`).join('')
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="38" height="72" viewBox="0 0 300 570" fill="none" ` +
    `stroke="#272727" stroke-width="15" stroke-linejoin="round" stroke-linecap="round">` +
    `${paths(BODY)}${paths(LEG)}<g transform="translate(300 0) scale(-1 1)">${paths(LEG)}</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** While mounted (the agent backend), the mouse pointer is the roach. Text fields keep the I-beam. */
export function RoachCursor() {
  useEffect(() => {
    document.documentElement.classList.add('roach-cursor')
    return () => document.documentElement.classList.remove('roach-cursor')
  }, [])
  return (
    <style>{`.roach-cursor, .roach-cursor * { cursor: url("${cursorUrl()}") 8 19, auto !important; }
.roach-cursor input, .roach-cursor textarea { cursor: text !important; }`}</style>
  )
}

export function RoachEgg() {
  const [show, setShow] = useState(() => !seen() && !reducedMotion())
  const svgRef = useRef<SVGSVGElement>(null)

  // Give every stroke its real length so it can draw itself in.
  useLayoutEffect(() => {
    svgRef.current?.querySelectorAll('path').forEach((p) => {
      p.style.setProperty('--len', String(Math.ceil(p.getTotalLength()) + 2))
    })
  }, [show])

  useEffect(() => {
    try { localStorage.setItem(EGG_ROACH_KEY, '1') } catch { /* storage blocked: it may play again */ }
    if (!show) return
    const t = window.setTimeout(() => setShow(false), 1000)
    return () => window.clearTimeout(t)
  }, [show])

  if (!show) return null
  return (
    <div aria-hidden="true" className="roach-overlay fixed inset-0 z-50 grid place-items-center bg-paper">
      <svg ref={svgRef} viewBox="0 0 300 570" className="roach h-[82vh] w-auto text-ink" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinejoin="round">
        {BODY.map((d, i) => <path key={`b${i}`} d={d} />)}
        {LEG.map((d, i) => <path key={`l${i}`} d={d} />)}
        <g transform="translate(300 0) scale(-1 1)">
          {LEG.map((d, i) => <path key={`r${i}`} d={d} />)}
        </g>
      </svg>
    </div>
  )
}
