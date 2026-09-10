import { Navigate } from 'react-router-dom'
import { useIsAdmin } from '@/hooks/useIsAdmin'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, checking } = useIsAdmin()

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-stone">Loading...</div>
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
