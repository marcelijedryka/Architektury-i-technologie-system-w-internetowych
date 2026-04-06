import { useState, useEffect } from 'react'
import client from '../../api/client'
import { Button } from '../../components/ui/Button'

interface User {
  email: string; name: string; role: string;
  isBlocked: boolean; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => { client.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false)) }, [])

  const toggleBlock = async (email: string, isBlocked: boolean) => {
    setProcessing(email)
    const action = isBlocked ? 'unblock' : 'block'
    await client.post(`/users/${encodeURIComponent(email)}/${action}`)
    setUsers(prev => prev.map(u => u.email === email ? { ...u, isBlocked: !isBlocked } : u))
    setProcessing(null)
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-4">Użytkownicy ({users.length})</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th scope="col" className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">Nazwa</th>
              <th scope="col" className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">Email</th>
              <th scope="col" className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">Rola</th>
              <th scope="col" className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">Status</th>
              <th scope="col" className="text-left py-2 px-3 text-[var(--text-muted)] font-medium">Akcja</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.email} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="py-2 px-3">{u.name}</td>
                <td className="py-2 px-3 text-[var(--text-muted)]">{u.email}</td>
                <td className="py-2 px-3">{u.role}</td>
                <td className="py-2 px-3">
                  {u.isBlocked
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">Zablokowany</span>
                    : <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Aktywny</span>
                  }
                </td>
                <td className="py-2 px-3">
                  <Button
                    size="sm"
                    variant={u.isBlocked ? 'secondary' : 'danger'}
                    onClick={() => toggleBlock(u.email, u.isBlocked)}
                    disabled={processing === u.email}
                  >
                    {processing === u.email ? '...' : u.isBlocked ? 'Odblokuj' : 'Zablokuj'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
