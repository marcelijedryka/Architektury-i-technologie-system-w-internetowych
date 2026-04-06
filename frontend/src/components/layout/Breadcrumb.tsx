import { Link } from 'react-router-dom'

interface Crumb { label: string; to?: string }

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span aria-hidden="true">›</span>}
          {crumb.to
            ? <Link to={crumb.to} className="hover:text-[var(--accent)] hover:underline">{crumb.label}</Link>
            : <span className="text-[var(--text)] font-medium" aria-current="page">{crumb.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}
