import { useCallback, useEffect, useState } from 'react'
import { type Section } from '../lib/supabase'
import { fetchSections } from '../lib/api'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

export function useSections() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchSections()
      setSections(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento sezioni')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { sections, loading, error, reload: load }
}
