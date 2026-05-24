import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, AlertCircle, RefreshCw } from 'lucide-react'
import { useSection } from '../hooks/useSection'

export function VotePage() {
  const { sectionId, candidateId } = useParams()
  
  const sId = Number(sectionId)
  const cId = Number(candidateId)

  const {
    candidates,
    votes,
    loading,
    error,
    handleIncrement,
    handleDecrement,
    reload,
    clearError,
  } = useSection(sId)

  const [pending, setPending] = useState(false)

  if (loading) {
    return (
      <div className="vote-page-shell">
        <div className="state-loading">
          <div className="spinner" />
          <span>Caricamento dati di voto...</span>
        </div>
      </div>
    )
  }

  const candidate = candidates.find((c) => c.id === cId)
  const voteRow = votes.find((v) => v.candidate_id === cId)

  if (error || !candidate || !voteRow) {
    return (
      <div className="vote-page-shell">
        <div className="vote-page-card">
          <div className="alert alert-error global-error">
            <AlertCircle size={18} />
            <span>
              {error || (!candidate ? 'Candidato non trovato.' : 'Voti non trovati per questa sezione.')}
            </span>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => {
              clearError()
              reload()
            }}
          >
            <RefreshCw size={14} /> Riprova
          </button>
          <Link to={sId ? `/sezione/${sId}` : '/'} className="vp-back-link">
            <ArrowLeft size={14} /> Torna alla sezione
          </Link>
        </div>
      </div>
    )
  }

  const currentVotes = voteRow.lista

  const onAdd = async () => {
    if (pending) return
    setPending(true)
    try {
      await handleIncrement(voteRow.id, 'lista', currentVotes)
    } finally {
      setPending(false)
    }
  }

  const onRemove = async () => {
    if (pending || currentVotes <= 0) return
    setPending(true)
    try {
      await handleDecrement(voteRow.id, 'lista', currentVotes)
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="vote-page-shell">
      <div className="vote-page-card">
        {/* Intestazione */}
        <div className="vp-header">
          <span className="vp-label">Voto di Lista</span>
          <span className="vp-city">San Cipriano d'Aversa</span>
        </div>

        {/* Nome del Candidato / Sindaco */}
        <h2 className="vp-name">{candidate.name}</h2>

        {/* Visualizzazione dei Voti */}
        <div className="vp-votes-wrap">
          <span className="vp-votes-label">Voti Attuali</span>
          <span className="vp-votes-count">{currentVotes}</span>
        </div>

        {/* Pulsanti per votare */}
        <div className="vp-btn-row">
          <button
            className="vp-remove-btn"
            onClick={onRemove}
            disabled={currentVotes <= 0 || pending}
            aria-label="Rimuovi un voto"
            title="Rimuovi un voto"
          >
            <Minus size={24} strokeWidth={3} />
          </button>
          <button
            className="vp-vote-btn"
            onClick={onAdd}
            disabled={pending}
            aria-label="Aggiungi un voto"
            title="Aggiungi un voto"
          >
            <Plus size={28} strokeWidth={3} className="vp-plus" />
            <span>Vota</span>
          </button>
        </div>

        {/* Link per tornare indietro */}
        <Link to={`/sezione/${sId}`} className="vp-back-link">
          <ArrowLeft size={14} /> Torna alla Sezione {sId}
        </Link>
      </div>
    </div>
  )
}
