import type { ReactNode } from 'react'

export const DemoTag = ({ children = 'Demo data' }: { children?: ReactNode }) => (
  <span className="inline-block border border-ink px-1.5 text-xs uppercase tracking-wide">{children}</span>
)

export const RiskFlag = () => (
  <span className="inline-block bg-risk px-1.5 text-xs font-bold uppercase tracking-wide text-paper">At risk</span>
)

export function Bar({ value, max, label, risk }: { value: number; max: number; label: string; risk?: boolean }) {
  const w = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}
      className={`h-3 w-full border ${risk ? 'border-risk' : 'border-ink'}`}>
      <div className={`h-full ${risk ? 'bg-risk' : 'bg-ink'}`} style={{ width: `${w}%` }} />
    </div>
  )
}

/** A heavy-ruled block: title and note on the left, content on the right. */
export function Section({ id, title, note, children }: { id?: string; title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-h` : undefined} className="border-t-2 border-ink first:border-t-0">
      <div className="grid gap-4 px-4 py-6 md:grid-cols-[minmax(0,300px)_1fr] md:gap-8 md:px-6">
        <div>
          <h2 id={id ? `${id}-h` : undefined} className="m-0 text-base font-bold">{title}</h2>
          {note && <p className="mt-2 text-sm text-mute">{note}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  )
}

export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="block">
    <span className="label">{label}</span>
    {children}
  </label>
)

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto"><table className="tbl">{children}</table></div>
)
