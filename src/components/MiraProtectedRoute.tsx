import { Navigate } from 'react-router-dom'
import { useIsMiraAdmin } from '@/hooks/useIsMiraAdmin'

export default function MiraProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isMiraAdmin, checking } = useIsMiraAdmin()

  if (checking) {
    return <div className="flex min-h-screen items-center justify-center text-stone">Loading...</div>
  }

  if (!isMiraAdmin) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
