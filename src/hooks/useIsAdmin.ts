import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// "Admin" here means: this signed-in user owns a store on MIRA.
export function useIsAdmin() {
  const { session, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!session) {
      setIsAdmin(false)
      setChecking(false)
      return
    }
    supabase
      .from('businesses')
      .select('id')
      .eq('owner_user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsAdmin(!!data)
        setChecking(false)
      })
  }, [session, authLoading])

  return { isAdmin, checking: checking || authLoading }
}
