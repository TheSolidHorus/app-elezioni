import { useState } from 'react'
import { BarChart2, Vote, Home } from 'lucide-react'
import type { Section } from './lib/supabase'
import { SectionDashboard } from './components/SectionDashboard'
import { SectionVotePanel } from './components/SectionVotePanel'
import { ResultsView } from './components/ResultsView'

type Tab = 'vote' | 'results'

export default function App() {
  const [tab, setTab] = useState<Tab>('vote')
  const [activeSection, setActiveSection] = useState<Section | null>(null)

  const handleOpenSection = (section: Section) => {
    setActiveSection(section)
  }

  const handleBackToDashboard = () => {
    setActiveSection(null)
  }

  return (
    <div className="app">
      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="header-inner">
          <div className="header-top">
            <div>
              <h1 className="app-title">🗳️ Elezioni Comunali</h1>
              <p className="app-subtitle">San Cipriano d'Aversa</p>
            </div>
            {/* Breadcrumb quando una sezione è aperta */}
            {activeSection && tab === 'vote' && (
              <div className="breadcrumb">
                <button
                  className="breadcrumb-home"
                  onClick={handleBackToDashboard}
                  aria-label="Torna alla dashboard"
                >
                  <Home size={14} />
                </button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">{activeSection.name}</span>
              </div>
            )}
          </div>

          {/* Tab navigation */}
          <nav className="tab-nav">
            <button
              id="tab-conteggio"
              className={`tab-btn ${tab === 'vote' ? 'tab-active' : ''}`}
              onClick={() => setTab('vote')}
            >
              <Vote size={16} />
              Conteggio
            </button>
            <button
              id="tab-risultati"
              className={`tab-btn ${tab === 'results' ? 'tab-active' : ''}`}
              onClick={() => {
                setTab('results')
                setActiveSection(null)
              }}
            >
              <BarChart2 size={16} />
              Risultati
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {/* ===== TAB CONTEGGIO ===== */}
        {tab === 'vote' && (
          activeSection ? (
            <SectionVotePanel
              section={activeSection}
              onBack={handleBackToDashboard}
            />
          ) : (
            <SectionDashboard onOpenSection={handleOpenSection} />
          )
        )}

        {/* ===== TAB RISULTATI ===== */}
        {tab === 'results' && <ResultsView />}
      </main>
    </div>
  )
}
