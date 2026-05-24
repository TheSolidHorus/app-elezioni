import { useState } from 'react'
import { useLocation, useNavigate, useParams, Routes, Route } from 'react-router-dom'
import { BarChart2, Vote, Home, Share2, Check, AlertCircle, RefreshCw } from 'lucide-react'
import { SectionDashboard } from './components/SectionDashboard'
import { SectionVotePanel } from './components/SectionVotePanel'
import { ResultsView } from './components/ResultsView'
import { useSections } from './hooks/useSections'
import { VotePage } from './components/VotePage'

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sections } = useSections()
  const [copied, setCopied] = useState(false)

  // Calcola se siamo su risultati o voto e se una sezione è attiva
  const tab = location.pathname === '/risultati' ? 'results' : 'vote'
  const sectionMatch = location.pathname.match(/\/sezione\/(\d+)/)
  const activeSectionId = sectionMatch ? Number(sectionMatch[1]) : null
  const activeSection = sections.find((s) => s.id === activeSectionId)

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
            {activeSectionId && tab === 'vote' && (
              <div className="breadcrumb">
                <button
                  className="breadcrumb-home"
                  onClick={() => navigate('/')}
                  aria-label="Torna alla dashboard"
                  title="Torna alla dashboard"
                >
                  <Home size={14} />
                </button>

                {/* BOTTONE CONDIVIDI/COPIA LINK SEZIONE */}
                <button
                  className={`copy-link-btn ${copied ? 'copied' : ''}`}
                  onClick={async () => {
                    if (!activeSectionId) return
                    const url = `${window.location.origin}/sezione/${activeSectionId}`
                    try {
                      await navigator.clipboard.writeText(url)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch (e) {
                      console.error('Errore copia:', e)
                    }
                  }}
                  title="Copia link della sezione negli appunti"
                  aria-label="Copia link della sezione"
                >
                  {copied ? <Check size={11} /> : <Share2 size={11} />}
                  <span className="copy-link-text">{copied ? 'Copiato!' : 'Condividi'}</span>
                </button>

                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-current">
                  {activeSection ? activeSection.name : `Sezione ${activeSectionId}`}
                </span>
              </div>
            )}
          </div>

          {/* Tab navigation */}
          <nav className="tab-nav">
            <button
              id="tab-conteggio"
              className={`tab-btn ${tab === 'vote' ? 'tab-active' : ''}`}
              onClick={() => navigate('/')}
            >
              <Vote size={16} />
              Conteggio
            </button>
            <button
              id="tab-risultati"
              className={`tab-btn ${tab === 'results' ? 'tab-active' : ''}`}
              onClick={() => navigate('/risultati')}
            >
              <BarChart2 size={16} />
              Risultati
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route
            path="/"
            element={
              <SectionDashboard
                onOpenSection={(section) => navigate(`/sezione/${section.id}`)}
              />
            }
          />
          <Route path="/sezione/:id" element={<SectionVotePanelWrapper />} />
          <Route path="/sezione/:sectionId/vota/:candidateId" element={<VotePage />} />
          <Route path="/risultati" element={<ResultsView />} />
        </Routes>
      </main>
    </div>
  )
}

function SectionVotePanelWrapper() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { sections, loading, error, reload } = useSections()

  if (loading) {
    return (
      <div className="state-loading">
        <div className="spinner" />
        <span>Caricamento sezione...</span>
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

  const section = sections.find((s) => s.id === Number(id))

  if (!section) {
    return (
      <div className="alert alert-error global-error">
        <AlertCircle size={16} />
        Sezione non trovata.
        <button className="btn-retry" onClick={() => navigate('/')}>
          Torna alla dashboard
        </button>
      </div>
    )
  }

  return <SectionVotePanel section={section} onBack={() => navigate('/')} />
}
