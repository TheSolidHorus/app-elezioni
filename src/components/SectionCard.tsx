import { useState } from 'react'
import { ChevronRight, MapPin, Share2, Check } from 'lucide-react'
import type { Section } from '../lib/supabase'

interface Props {
  section: Section
  onOpen: (section: Section) => void
}

export function SectionCard({ section, onOpen }: Props) {
  const [copied, setCopied] = useState(false)
  const sectionUrl = `${window.location.origin}/sezione/${section.id}`

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(sectionUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Errore copia link:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onOpen(section)
    }
  }

  return (
    <div
      id={`section-card-${section.id}`}
      className="section-card"
      onClick={() => onOpen(section)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Apri ${section.name}`}
    >
      <div className="section-card-icon">
        <MapPin size={20} />
      </div>
      <div className="section-card-body">
        <span className="section-card-name">{section.name}</span>
        <span className="section-card-hint">Tocca per aprire il conteggio</span>
        
        {/* URL box per condivisione/copia link */}
        <div className="section-card-url-box" onClick={(e) => e.stopPropagation()}>
          <a
            href={`/sezione/${section.id}`}
            className="section-card-url-link"
            onClick={(e) => {
              e.preventDefault()
              onOpen(section)
            }}
          >
            {sectionUrl}
          </a>
          <button
            className={`section-card-copy-icon-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            title="Copia link della sezione"
            aria-label="Copia link della sezione"
          >
            {copied ? <Check size={12} /> : <Share2 size={12} />}
          </button>
        </div>
      </div>
      <ChevronRight size={18} className="section-card-arrow" />
    </div>
  )
}
