import { ChevronRight, MapPin } from 'lucide-react'
import type { Section } from '../lib/supabase'

interface Props {
  section: Section
  onOpen: (section: Section) => void
}

export function SectionCard({ section, onOpen }: Props) {
  return (
    <button
      id={`section-card-${section.id}`}
      className="section-card"
      onClick={() => onOpen(section)}
      aria-label={`Apri ${section.name}`}
    >
      <div className="section-card-icon">
        <MapPin size={20} />
      </div>
      <div className="section-card-body">
        <span className="section-card-name">{section.name}</span>
        <span className="section-card-hint">Tocca per aprire il conteggio</span>
      </div>
      <ChevronRight size={18} className="section-card-arrow" />
    </button>
  )
}
