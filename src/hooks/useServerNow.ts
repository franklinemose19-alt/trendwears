import { useEffect, useState } from 'react'
import { fetchServerOffsetMs } from '@/services/trial'

// "Now" according to the MIRA server (falls back to this device's clock if the server cannot be reached).
export function useServerNow(tickMs = 30000): number {
  const [offset, setOffset] = useState(0)
  const [tick, setTick] = useState(() => Date.now())

  useEffect(() => {
    let alive = true
    fetchServerOffsetMs().then((o) => { if (alive) setOffset(o) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), tickMs)
    return () => clearInterval(id)
  }, [tickMs])

  return tick + offset
}
