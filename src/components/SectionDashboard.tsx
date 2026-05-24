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
  const [totals, setTotals] = useState<{ vincenzo: number; cristofaro: number; donato: number } | null>(null)

  useEffect(() => {
    async function loadTotals() {
      try {
        const results = await fetchAggregatedResults()
        
        // Voti lista Vincenzo Caterino: somma voti lista di tutti i candidati eccetto Coppola (18) e Belloro (19)
        const vincenzo = results
          .filter((r) => r.candidate.id !== 18 && r.candidate.id !== 19)
          .reduce((acc, curr) => acc + curr.totalLista, 0)
          
        // Voti lista Cristofaro Coppola: voti lista candidato ID 18
        const cristofaro = results
          .filter((r) => r.candidate.id === 18)
          .reduce((acc, curr) => acc + curr.totalLista, 0)
          
        // Voti lista Donato Belloro: voti lista candidato ID 19
        const donato = results
          .filter((r) => r.candidate.id === 19)
          .reduce((acc, curr) => acc + curr.totalLista, 0)
          
        setTotals({ vincenzo, cristofaro, donato })
      } catch (e) {
        console.error('Errore nel caricamento dei voti di lista:', e)
      }
    }
    loadTotals()
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
        <h2 className="dashboard-title" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Riepilogo Voti di Lista
        </h2>
        
        {/* Griglia Totali per Ciascuna Lista */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', marginTop: '16px' }}>
          {/* Card Vincenzo Caterino */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: '12px', padding: '14px 16px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all var(--transition)' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em', textAlign: 'center' }}>Lista Vincenzo Caterino</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue)', marginTop: '6px', lineHeight: 1 }}>
              {totals === null ? '...' : totals.vincenzo}
            </span>
          </div>

          {/* Card Cristofaro Coppola */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: '12px', padding: '14px 16px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all var(--transition)' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em', textAlign: 'center' }}>Lista Cristofaro Coppola</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', marginTop: '6px', lineHeight: 1 }}>
              {totals === null ? '...' : totals.cristofaro}
            </span>
          </div>

          {/* Card Donato Belloro */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '14px 16px', flex: '1 1 180px', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all var(--transition)' }}>
            <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em', textAlign: 'center' }}>Lista Donato Belloro</span>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--amber)', marginTop: '6px', lineHeight: 1 }}>
              {totals === null ? '...' : totals.donato}
            </span>
          </div>
        </div>

        <p className="dashboard-subtitle" style={{ marginTop: '20px' }}>
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
