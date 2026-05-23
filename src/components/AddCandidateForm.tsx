import { useState } from 'react'
import { UserPlus, AlertCircle } from 'lucide-react'

const MAX_CANDIDATES = 30

interface Props {
  count: number
  onAdd: (name: string) => Promise<void>
}

export function AddCandidateForm({ count, onAdd }: Props) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFull = count >= MAX_CANDIDATES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isFull) return
    setLoading(true)
    setError(null)
    try {
      await onAdd(name.trim())
      setName('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiunta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-form-container">
      <div className="candidate-count-bar">
        <span>Candidati</span>
        <span className={count >= MAX_CANDIDATES ? 'count-full' : 'count-ok'}>
          {count} / {MAX_CANDIDATES}
        </span>
      </div>

      {isFull ? (
        <div className="alert alert-warning">
          <AlertCircle size={16} />
          Limite massimo di {MAX_CANDIDATES} candidati raggiunto.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="add-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome candidato..."
            className="add-input"
            maxLength={80}
            disabled={loading}
            autoComplete="off"
          />
          <button
            type="submit"
            className="btn btn-add"
            disabled={loading || !name.trim()}
          >
            <UserPlus size={18} />
            {loading ? 'Aggiunta...' : 'Aggiungi'}
          </button>
        </form>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  )
}
