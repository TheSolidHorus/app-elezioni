import { useState } from 'react'
import { ArrowLeft, RefreshCw, AlertCircle, Minus, Plus, Crown } from 'lucide-react'
import type { Section, VoteField, TotalField } from '../lib/supabase'
import { useSection } from '../hooks/useSection'
import { StatusBadge } from './StatusBadge'

interface Props {
  section: Section
  onBack: () => void
}

const VOTE_FIELDS: { field: VoteField; label: string; color: string }[] = [
  { field: 'lista',     label: 'Voti Lista',   color: 'blue'  },
  { field: 'preferenze',label: 'Preferenze',   color: 'green' },
]

const TOTAL_FIELDS: { field: TotalField; label: string; color: string; emoji: string }[] = [
  { field: 'nulli',        label: 'Voti Nulli',      color: 'red',    emoji: '🚫' },
  { field: 'bianchi',      label: 'Schede Bianche',  color: 'amber',  emoji: '⬜' },
  { field: 'solo_sindaco', label: 'Solo Sindaco',     color: 'purple', emoji: '👤' },
]

export function SectionVotePanel({ section, onBack }: Props) {
  const {
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
    reload,
    clearError,
  } = useSection(section.id)

  const [resetConfirm, setResetConfirm] = useState(false)
  const [pending, setPending] = useState<string | null>(null)  // "voteId-field" or "total-field"

  // Calcola totale schede per la sezione
  const totalSchede = votes.reduce((s, v) => s + v.lista + v.preferenze, 0)
    + (total ? total.nulli + total.bianchi + total.solo_sindaco : 0)

  const makeVoteKey = (voteId: string, field: VoteField) => `${voteId}-${field}`
  const makeTotalKey = (field: TotalField) => `total-${field}`

  const onInc = async (voteId: string, field: VoteField, current: number) => {
    const key = makeVoteKey(voteId, field)
    if (pending === key) return
    setPending(key)
    try { await handleIncrement(voteId, field, current) } finally { setPending(null) }
  }

  const onDec = async (voteId: string, field: VoteField, current: number) => {
    const key = makeVoteKey(voteId, field)
    if (pending === key || current <= 0) return
    setPending(key)
    try { await handleDecrement(voteId, field, current) } finally { setPending(null) }
  }

  const onIncTotal = async (field: TotalField, current: number) => {
    const key = makeTotalKey(field)
    if (pending === key) return
    setPending(key)
    try { await handleIncrementTotal(field, current) } finally { setPending(null) }
  }

  const onDecTotal = async (field: TotalField, current: number) => {
    const key = makeTotalKey(field)
    if (pending === key || current <= 0) return
    setPending(key)
    try { await handleDecrementTotal(field, current) } finally { setPending(null) }
  }

  return (
    <div className="section-panel">
      {/* Header sezione */}
      <div className="section-panel-header">
        <button className="back-btn" onClick={onBack} aria-label="Torna alla dashboard">
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>
        <div className="section-panel-title-wrap">
          <h2 className="section-panel-title">{section.name}</h2>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Totale schede banner */}
      <div className="total-banner">
        <span className="total-banner-label">Totale schede sezione</span>
        <span className="total-banner-number">{totalSchede}</span>
      </div>

      {/* Errore */}
      {error && (
        <div className="alert alert-error global-error">
          <AlertCircle size={16} />
          {error}
          <button className="btn-retry" onClick={() => { clearError(); reload() }}>
            <RefreshCw size={14} /> Riprova
          </button>
        </div>
      )}

      {loading ? (
        <div className="state-loading">
          <div className="spinner" />
          <span>Caricamento...</span>
        </div>
      ) : (
        <>
          {/* ====== TOTALI SEZIONE (Nulli, Bianchi, Solo Sindaco) ====== */}
          {total && (
            <div className="totals-block">
              <h3 className="block-title">Totali Sezione</h3>
              <div className="totals-grid">
                {TOTAL_FIELDS.map(({ field, label, color, emoji }) => {
                  const current = total[field]
                  const key = makeTotalKey(field)
                  return (
                    <div key={field} className={`total-field-card total-field-${color}`}>
                      <div className="total-field-label">
                        <span>{emoji}</span>
                        <span>{label}</span>
                      </div>
                      <div className="total-field-controls">
                        <button
                          className="small-vote-btn small-btn-dec"
                          onClick={() => onDecTotal(field, current)}
                          disabled={current <= 0 || pending === key}
                          aria-label={`Riduci ${label}`}
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="total-field-count">{current}</span>
                        <button
                          className="small-vote-btn small-btn-inc"
                          onClick={() => onIncTotal(field, current)}
                          disabled={pending === key}
                          aria-label={`Aggiungi ${label}`}
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ====== CANDIDATI ====== */}
          <div className="candidates-block">
            <h3 className="block-title">Candidati ({candidates.length})</h3>
            <div className="candidates-vote-list">
              {candidates.map((candidate, idx) => {
                const voteRow = votes.find((v) => v.candidate_id === candidate.id)
                if (!voteRow) return null

                return (
                  <div key={candidate.id} className="candidate-vote-card">
                    {/* Nome candidato */}
                    <div className="cvcard-header">
                      <div className="cvcard-rank">{idx + 1}</div>
                      <div className="cvcard-name-wrap">
                        <span className="cvcard-name">{candidate.name}</span>
                        {candidate.is_sindaco && (
                          <span className="cvcard-sindaco">
                            <Crown size={12} /> Sindaco
                          </span>
                        )}
                      </div>
                      <div className="cvcard-subtotal">
                        Totale: <strong>{voteRow.lista + voteRow.preferenze}</strong>
                      </div>
                    </div>

                    {/* Righe voto: Lista + Preferenze */}
                    <div className="cvcard-fields">
                      {VOTE_FIELDS.map(({ field, label, color }) => {
                        const current = voteRow[field]
                        const key = makeVoteKey(voteRow.id, field)
                        return (
                          <div key={field} className={`cvcard-field cvcard-field-${color}`}>
                            <span className="cvcard-field-label">{label}</span>
                            <div className="cvcard-field-controls">
                              <button
                                className="small-vote-btn small-btn-dec"
                                onClick={() => onDec(voteRow.id, field, current)}
                                disabled={current <= 0 || pending === key}
                                aria-label={`Riduci ${label} per ${candidate.name}`}
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className="cvcard-field-count">{current}</span>
                              <button
                                className="small-vote-btn small-btn-inc"
                                onClick={() => onInc(voteRow.id, field, current)}
                                disabled={pending === key}
                                aria-label={`Aggiungi ${label} per ${candidate.name}`}
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ====== RESET SEZIONE ====== */}
          <div className="reset-zone">
            {resetConfirm ? (
              <div className="reset-confirm">
                <span>Azzerare tutti i voti di <strong>{section.name}</strong>?</span>
                <div className="reset-confirm-btns">
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      await handleReset()
                      setResetConfirm(false)
                    }}
                  >
                    Azzera sezione
                  </button>
                  <button className="btn btn-ghost" onClick={() => setResetConfirm(false)}>
                    Annulla
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-ghost" onClick={() => setResetConfirm(true)}>
                <RefreshCw size={14} />
                Azzera voti sezione
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
