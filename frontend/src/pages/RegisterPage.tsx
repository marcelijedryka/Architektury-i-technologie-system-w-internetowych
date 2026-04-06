import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { useLang } from '../context/LangContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Hasło musi mieć co najmniej 8 znaków / Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register(email, name, password)
      navigate('/')
    } catch {
      setError(t.registerError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">{t.registerTitle}</h1>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && <p role="alert" className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200">{error}</p>}
        <Input label={t.name} value={name} onChange={e => setName(e.target.value)} required />
        <Input label={t.email} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <Input label={t.password} type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password"
          error={password.length > 0 && password.length < 8 ? 'Minimum 8 znaków' : undefined} />
        <Button type="submit" disabled={loading} className="w-full justify-center">
          {loading ? t.registering : t.register}
        </Button>
      </form>
      <p className="mt-4 text-sm text-center text-[var(--text-muted)]">
        {t.haveAccount} <Link to="/login" className="text-[var(--accent)] hover:underline">{t.login}</Link>
      </p>
    </div>
  )
}
