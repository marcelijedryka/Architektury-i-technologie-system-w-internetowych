import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useLang } from '../context/LangContext'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? ''
      setError(msg === 'Account is blocked' ? t.loginBlocked : t.loginError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{t.login}</h1>

      <a href="http://localhost:3000/auth/google"
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded border border-[var(--border)] bg-[var(--surface)] text-sm hover:border-[var(--accent)] mb-6">
        <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" aria-hidden="true" />
        {t.loginGoogle}
      </a>

      <div className="flex items-center gap-3 mb-6">
        <hr className="flex-1 border-[var(--border)]" />
        <span className="text-xs text-[var(--text-muted)]">{t.loginOrEmail}</span>
        <hr className="flex-1 border-[var(--border)]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</p>}
        <Input label={t.email} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <Input label={t.password} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        <Button type="submit" disabled={loading} className="w-full justify-center">
          {loading ? t.logging : t.login}
        </Button>
      </form>

      <p className="mt-4 text-sm text-center text-[var(--text-muted)]">
        {t.noAccount} <Link to="/register" className="text-[var(--accent)] hover:underline">{t.register}</Link>
      </p>
    </div>
  )
}
