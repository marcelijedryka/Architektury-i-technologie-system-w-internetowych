import { useAuth } from '../context/AuthContext'
import { Breadcrumb } from '../components/layout/Breadcrumb'
import { Link } from 'react-router-dom'

const ROLE_LABELS: Record<string, string> = { VIEWER: 'Przeglądający', CREATOR: 'Twórca', ADMIN: 'Administrator' }

export default function AccountPage() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <>
      <Breadcrumb crumbs={[{ label: 'Strona główna', to: '/' }, { label: 'Moje konto' }]} />
      <div className="max-w-lg mt-6">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Moje konto</h1>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-2xl font-bold">
              {user.name[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg text-[var(--text)]">{user.name}</p>
              <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
            </div>
          </div>
          <dl className="divide-y divide-[var(--border)]">
            <div className="py-2 flex justify-between text-sm">
              <dt className="text-[var(--text-muted)]">Rola</dt>
              <dd className="font-medium">{ROLE_LABELS[user.role]}</dd>
            </div>
          </dl>
          <Link to="/my-posts" className="block text-center px-4 py-2 rounded bg-[var(--accent)] text-white text-sm hover:opacity-90">
            Moje zdjęcia
          </Link>
        </div>
      </div>
    </>
  )
}
