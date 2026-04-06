import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import AdminPhotosPage from './AdminPhotosPage'
import AdminUsersPage from './AdminUsersPage'
import AdminNewPage from './AdminNewPage'
import AdminHierarchyPage from './AdminHierarchyPage'
import { useLang } from '../../context/LangContext'

const navClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2.5 text-sm rounded transition-colors ${isActive ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'}`

export default function AdminLayout() {
  const { t } = useLang()
  return (
    <div className="flex gap-0 -mx-4 -mt-6 min-h-[calc(100vh-56px)]">
      <aside className="w-52 shrink-0 bg-zinc-900 flex flex-col" aria-label={t.adminTitle}>
        <div className="px-4 py-4 border-b border-zinc-700">
          <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Admin</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <NavLink to="/admin/photos" className={navClass}>{t.adminPhotos}</NavLink>
          <NavLink to="/admin/users" className={navClass}>{t.adminUsers}</NavLink>
          <NavLink to="/admin/hierarchy" className={navClass}>{t.adminHierarchy}</NavLink>
          <NavLink to="/admin/new" className={navClass}>{t.adminNew}</NavLink>
        </nav>
        <div className="p-4 border-t border-zinc-700">
          <NavLink to="/" className="text-xs text-zinc-500 hover:text-zinc-300">← {t.breadcrumbHome}</NavLink>
        </div>
      </aside>

      <div className="flex-1 p-6 bg-[var(--bg)]">
        <Routes>
          <Route index element={<Navigate to="photos" replace />} />
          <Route path="photos" element={<AdminPhotosPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="hierarchy" element={<AdminHierarchyPage />} />
          <Route path="new" element={<AdminNewPage />} />
        </Routes>
      </div>
    </div>
  )
}
