import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function useIsMiraAdmin() {
  const { session, loading: authLoading } = useAuth()
  const [isMiraAdmin, setIsMiraAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!session) {
      setIsMiraAdmin(false)
      setChecking(false)
      return
    }
    supabase
      .from('mira_admins')
      .select('user_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsMiraAdmin(!!data)
        setChecking(false)
      })
  }, [session, authLoading])

  return { isMiraAdmin, checking: checking || authLoading }
}
