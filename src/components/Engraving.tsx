/**
 * Original engraved moose (front view, palmate antlers), repeated edge to edge as the page border.
 * OJAS repeats one engraved object here; this is our own art, drawn for Plus 1.
 */
export function Engraving({ height = 96 }: { height?: number }) {
  const w = height * (58 / 90)
  return (
    <svg aria-hidden="true" focusable="false" width="100%" height={height} className="block text-ink">
      <defs>
        <pattern id="moose" width={w} height={height} patternUnits="userSpaceOnUse" viewBox="-2 0 58 90">
          <g fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeLinecap="round">
            {/* left half: antler palm with tines, hatching, and ear. The right half is a mirror. */}
            <g id="moose-half">
              <path d="M22 35L14 34L8 31L3.5 27L6 24L2 20.5L6.5 19L4 13L9.5 16.5L10 9L14.5 15L18 10.5L19 20L22.5 27Z" />
              <path d="M21 33L8 28M20.5 30L7 22M20 27L9 17M20 24L12 13.5" strokeWidth=".6" />
              <path d="M21 40L13.5 38.5Q12.5 43 18.5 45.5Z" />
              <path d="M19 42L15 41" strokeWidth=".6" />
            </g>
            <use href="#moose-half" transform="translate(54 0) scale(-1 1)" />
            {/* head */}
            <path d="M22 36C20 44 21 52 22 58C20 62 20 68 23 72C25 75 29 75 31 72C34 68 34 62 32 58C33 52 34 44 32 36Z" />
            <path d="M24 39H30M23.5 41H30.5M22.7 52V58M31.3 52V58M24.5 56H29.5" strokeWidth=".6" />
            <circle cx="23" cy="45" r=".9" fill="currentColor" />
            <circle cx="31" cy="45" r=".9" fill="currentColor" />
            <path d="M24.3 70.5q.9 1.4 1.7 0M28 70.5q.9 1.4 1.7 0M25 74Q27 75.5 29 74" />
            {/* dewlap (the bell) */}
            <path d="M25 74C23.5 80 25 85 27 88C29 85 30.5 80 29 74" />
            <path d="M26 77V84M28 77V84" strokeWidth=".6" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#moose)" />
    </svg>
  )
}
