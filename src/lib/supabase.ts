import { createClient } from '@supabase/supabase-js'

// Chiave pubblica Supabase — è sicuro includerla nel codice frontend.
// La chiave "anon" è progettata per essere pubblica e le RLS limitano gli accessi.
const supabaseUrl = 'https://jzuqtwxngnpsavfivuqh.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6dXF0d3huZ25wc2F2Zml2dXFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODA1NTksImV4cCI6MjA5NTA1NjU1OX0.LE4P27K6GimQ5oSORVOxyFEvoE_XHKHwxrwtYPLbwdA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =============================================
// Tipi del dominio — allineati al nuovo schema
// =============================================

export type Section = {
  id: number
  name: string
}

export type Candidate = {
  id: number
  name: string
  is_sindaco: boolean
}

/** Riga voti per candidato in una sezione (lista + preferenze) */
export type VoteRow = {
  id: string
  section_id: number
  candidate_id: number
  lista: number
  preferenze: number
  updated_at: string
}

/** Totali aggregati per sezione (nulli, bianchi, solo sindaco) */
export type SectionTotal = {
  section_id: number
  nulli: number
  bianchi: number
  solo_sindaco: number
  updated_at: string
}

/** Tipo di campo voto per candidato */
export type VoteField = 'lista' | 'preferenze'

/** Tipo di campo totale per sezione */
export type TotalField = 'nulli' | 'bianchi' | 'solo_sindaco'
