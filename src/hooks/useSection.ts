import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase, type Candidate, type VoteRow, type SectionTotal, type VoteField, type TotalField } from '../lib/supabase'
import type { ConnectionStatus } from '../components/StatusBadge'
import {
  fetchCandidates,
  fetchVotes,
  fetchSectionTotal,
  incrementVoteField,
  decrementVoteField,
  incrementTotalField,
  decrementTotalField,
  resetSectionVotes,
  resetSectionTotals,
} from '../lib/api'

export function useSection(sectionId: number) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [votes, setVotes] = useState<VoteRow[]>([])
  const [total, setTotal] = useState<SectionTotal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>('connecting')

  // Mappa optimistic per evitare flickering su votes
  const optimisticVotes = useRef<Map<string, Partial<VoteRow>>>(new Map())
  const optimisticTotal = useRef<Partial<SectionTotal> | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const [cands, voteRows, tot] = await Promise.all([
        fetchCandidates(),
        fetchVotes(sectionId),
        fetchSectionTotal(sectionId),
      ])
      setCandidates(cands)
      setVotes(voteRows)
      setTotal(tot)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore di caricamento')
    } finally {
      setLoading(false)
    }
  }, [sectionId])

  useEffect(() => {
    setLoading(true)
    load()

    // Realtime su votes per questa sezione
    const channelVotes = supabase
      .channel(`votes-section-${sectionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'votes', filter: `section_id=eq.${sectionId}` },
        (payload) => {
          const updated = payload.new as VoteRow
          // Ignora se aggiornamento ottimistico ancora in volo
          const opt = optimisticVotes.current.get(updated.id)
          if (opt) {
            const sameList = opt.lista === undefined || opt.lista === updated.lista
            const samePrefs = opt.preferenze === undefined || opt.preferenze === updated.preferenze
            if (sameList && samePrefs) {
              optimisticVotes.current.delete(updated.id)
            }
          }
          setVotes((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
        }
      )
      .subscribe((s) => {
        if (s === 'SUBSCRIBED') setStatus('connected')
        else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
          setStatus('disconnected')
        }
      })

    // Realtime su section_totals per questa sezione
    const channelTotals = supabase
      .channel(`totals-section-${sectionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'section_totals', filter: `section_id=eq.${sectionId}` },
        (payload) => {
          const updated = payload.new as SectionTotal
          setTotal(updated)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channelVotes)
      supabase.removeChannel(channelTotals)
    }
  }, [sectionId, load])

  // =============================================
  // Handlers voti candidato
  // =============================================

  const handleIncrement = useCallback(
    async (voteId: string, field: VoteField, current: number) => {
      // Ottimistico
      optimisticVotes.current.set(voteId, { [field]: current + 1 })
      setVotes((prev) =>
        prev.map((v) => (v.id === voteId ? { ...v, [field]: current + 1 } : v))
      )
      try {
        await incrementVoteField(voteId, field, current)
      } catch {
        // Rollback
        setVotes((prev) =>
          prev.map((v) => (v.id === voteId ? { ...v, [field]: current } : v))
        )
        optimisticVotes.current.delete(voteId)
        setError('Errore nel salvataggio. Riprova.')
      }
    },
    []
  )

  const handleDecrement = useCallback(
    async (voteId: string, field: VoteField, current: number) => {
      if (current <= 0) return
      optimisticVotes.current.set(voteId, { [field]: current - 1 })
      setVotes((prev) =>
        prev.map((v) => (v.id === voteId ? { ...v, [field]: current - 1 } : v))
      )
      try {
        await decrementVoteField(voteId, field, current)
      } catch {
        setVotes((prev) =>
          prev.map((v) => (v.id === voteId ? { ...v, [field]: current } : v))
        )
        optimisticVotes.current.delete(voteId)
        setError('Errore nel salvataggio. Riprova.')
      }
    },
    []
  )

  // =============================================
  // Handlers totali sezione
  // =============================================

  const handleIncrementTotal = useCallback(
    async (field: TotalField, current: number) => {
      optimisticTotal.current = { [field]: current + 1 }
      setTotal((prev) => (prev ? { ...prev, [field]: current + 1 } : prev))
      try {
        await incrementTotalField(sectionId, field, current)
      } catch {
        setTotal((prev) => (prev ? { ...prev, [field]: current } : prev))
        setError('Errore nel salvataggio. Riprova.')
      }
    },
    [sectionId]
  )

  const handleDecrementTotal = useCallback(
    async (field: TotalField, current: number) => {
      if (current <= 0) return
      setTotal((prev) => (prev ? { ...prev, [field]: current - 1 } : prev))
      try {
        await decrementTotalField(sectionId, field, current)
      } catch {
        setTotal((prev) => (prev ? { ...prev, [field]: current } : prev))
        setError('Errore nel salvataggio. Riprova.')
      }
    },
    [sectionId]
  )

  // =============================================
  // Reset sezione
  // =============================================

  const handleReset = useCallback(async () => {
    await Promise.all([resetSectionVotes(sectionId), resetSectionTotals(sectionId)])
    await load()
  }, [sectionId, load])

  return {
    candidates,
    votes,
    total,
    loading,
    error,
    status,
    handleIncrement,
    handleDecrement,
    handleIncrementTotal,
    handleDecrementTotal,
    handleReset,
    reload: load,
    clearError: () => setError(null),
  }
}
