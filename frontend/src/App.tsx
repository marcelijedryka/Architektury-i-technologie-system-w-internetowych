import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './context/LangContext'
import { Header } from './components/layout/Header'
import { useAuth } from './context/AuthContext'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const AccountPage = lazy(() => import('./pages/AccountPage'))
const UploadPage = lazy(() => import('./pages/UploadPage'))
const MyPostsPage = lazy(() => import('./pages/MyPostsPage'))
const EditPostPage = lazy(() => import('./pages/EditPostPage'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="p-8 text-center">Ładowanie...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header />
      <main id="main-content" role="main" className="max-w-6xl mx-auto px-4 py-6">
        <Suspense fallback={<div className="p-8 text-center">Ładowanie...</div>}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute roles={['CREATOR', 'ADMIN']}><UploadPage /></ProtectedRoute>} />
            <Route path="/my-posts" element={<ProtectedRoute><MyPostsPage /></ProtectedRoute>} />
            <Route path="/my-posts/:id/edit" element={<ProtectedRoute><EditPostPage /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LangProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </LangProvider>
    </ThemeProvider>
  )
}
