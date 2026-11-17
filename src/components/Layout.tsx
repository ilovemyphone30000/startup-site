import type { ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { CLASS_FOOTER, NAME } from '../config'
import { Engraving } from './Engraving'

const LINKS = [
  ['/', 'Home', true],
  ['/fan', 'Fan app demo', false],
  ['/agent', 'Agent/Artist Backend', false],
  ['/partner', 'Partner view', false],
] as const

/** Engraved border, a block of mono prose on the left, stacked links and a fat wordmark on the right. */
export function SiteHeader({ children, art = 96 }: { children: ReactNode; art?: number }) {
  return (
    <header>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-ink focus:px-3 focus:py-1 focus:text-paper">
        Skip to content
      </a>
      <div className="px-4 pt-4 md:px-6"><Engraving height={art} /></div>
      <div className="grid gap-4 px-4 py-5 md:grid-cols-[1fr_auto] md:gap-10 md:px-6">
        <div className="order-last max-w-3xl md:order-first">{children}</div>
        <div className="flex items-start justify-between gap-4 md:justify-end">
          <nav aria-label="Main" className="font-sans text-lg leading-snug md:text-right">
            <ul className="m-0 list-none p-0">
              {LINKS.map(([to, label, end]) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={({ isActive }) => `hover:underline ${isActive ? 'underline underline-offset-4' : ''}`}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <Link to="/" aria-label={`${NAME} home`} className="font-display text-6xl uppercase leading-[0.9] no-underline md:text-8xl">
            {NAME}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink px-4 py-6 text-sm md:px-6">
      <p className="m-0 max-w-3xl">{CLASS_FOOTER}</p>
    </footer>
  )
}

export function Page({ hero, art, children }: { hero: ReactNode; art?: number; children: ReactNode }) {
  return (
    <>
      <SiteHeader art={art}>{hero}</SiteHeader>
      <main id="main" className="border-t-2 border-ink">{children}</main>
      <SiteFooter />
    </>
  )
}
