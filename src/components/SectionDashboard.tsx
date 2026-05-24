import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import type { Section } from '../lib/supabase'
import { SectionCard } from './SectionCard'
import { useSections } from '../hooks/useSections'
import { fetchAggregatedResults } from '../lib/api'

interface Props {
  onOpenSection: (section: Section) => void
}

export function SectionDashboard({ onOpenSection }: Props) {
  const { sections, loading, error, reload } = useSections()
  const [totalVotiLista, setTotalVotiLista] = useState<number | null>(null)

  useEffect(() => {
    async function loadTotal() {
      try {
        const results = await fetchAggregatedResults()
        const total = results.reduce((acc, curr) => acc + curr.totalLista, 0)
        setTotalVotiLista(total)
      } catch (e) {
        console.error('Errore nel caricamento dei voti di lista:', e)
      }
    }
    loadTotal()
  }, [])

  if (loading) {
    return (
      <div className="state-loading">
        <div className="spinner" />
        <span>Caricamento sezioni...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error global-error">
        <AlertCircle size={16} />
        {error}
        <button className="btn-retry" onClick={reload}>
          <RefreshCw size={14} /> Riprova
        </button>
      </div>
    )
  }

  return (
    <div className="section-dashboard">
      <div className="dashboard-intro">
        <h2 className="dashboard-title">
          Totale Voti di Lista: {totalVotiLista === null ? '...' : totalVotiLista}
        </h2>
        <p className="dashboard-subtitle">
          Scegli la sezione da aprire per iniziare il conteggio dei voti
        </p>
      </div>
      <div className="sections-grid">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            onOpen={onOpenSection}
          />
        ))}
      </div>
    </div>
  )
}
