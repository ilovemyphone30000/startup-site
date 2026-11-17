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
export function Section({ id, title, note, children, open = false }: {
  id?: string; title: string; note?: ReactNode; children: ReactNode; open?: boolean
}) {
  return (
    <details id={id} open={open} className="group border-t-2 border-ink first:border-t-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 hover:bg-ink hover:text-paper md:px-6 [&::-webkit-details-marker]:hidden">
        <span>
          <h2 className="m-0 text-base font-bold">{title}</h2>
          {note && <span className="block text-sm opacity-70">{note}</span>}
        </span>
        <span aria-hidden="true" className="font-bold group-open:hidden">+</span>
        <span aria-hidden="true" className="hidden font-bold group-open:inline">-</span>
      </summary>
      <div className="min-w-0 px-4 pb-6 pt-2 md:px-6">{children}</div>
    </details>
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
