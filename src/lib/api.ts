import { supabase, type Section, type Candidate, type VoteRow, type SectionTotal, type VoteField, type TotalField } from './supabase'

// =============================================
// Sezioni
// =============================================

/** Carica tutte le 13 sezioni ordinate per id */
export async function fetchSections(): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return data ?? []
}

// =============================================
// Candidati
// =============================================

/** Carica tutti i 17 candidati ordinati per id */
export async function fetchCandidates(): Promise<Candidate[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw error
  return data ?? []
}

// =============================================
// Voti per candidato (tabella votes)
// =============================================

/** Carica tutti i voti di una sezione (17 righe) */
export async function fetchVotes(sectionId: number): Promise<VoteRow[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('section_id', sectionId)
    .order('candidate_id', { ascending: true })
  if (error) throw error
  return data ?? []
}

/** Incrementa di 1 un campo voto (lista o preferenze) */
export async function incrementVoteField(
  voteId: string,
  field: VoteField,
  current: number
): Promise<void> {
  const { error } = await supabase
    .from('votes')
    .update({ [field]: current + 1 })
    .eq('id', voteId)
  if (error) throw error
}

/** Decrementa di 1 un campo voto (minimo 0) */
export async function decrementVoteField(
  voteId: string,
  field: VoteField,
  current: number
): Promise<void> {
  if (current <= 0) return
  const { error } = await supabase
    .from('votes')
    .update({ [field]: current - 1 })
    .eq('id', voteId)
  if (error) throw error
}

// =============================================
// Totali per sezione (tabella section_totals)
// =============================================

/** Carica i totali aggregati di una sezione (nulli, bianchi, solo_sindaco) */
export async function fetchSectionTotal(sectionId: number): Promise<SectionTotal> {
  const { data, error } = await supabase
    .from('section_totals')
    .select('*')
    .eq('section_id', sectionId)
    .single()
  if (error) throw error
  return data
}

/** Incrementa di 1 un campo totale della sezione */
export async function incrementTotalField(
  sectionId: number,
  field: TotalField,
  current: number
): Promise<void> {
  const { error } = await supabase
    .from('section_totals')
    .update({ [field]: current + 1 })
    .eq('section_id', sectionId)
  if (error) throw error
}

/** Decrementa di 1 un campo totale della sezione (minimo 0) */
export async function decrementTotalField(
  sectionId: number,
  field: TotalField,
  current: number
): Promise<void> {
  if (current <= 0) return
  const { error } = await supabase
    .from('section_totals')
    .update({ [field]: current - 1 })
    .eq('section_id', sectionId)
  if (error) throw error
}

// =============================================
// Reset
// =============================================

/** Azzera tutti i voti (lista + preferenze) di una sezione */
export async function resetSectionVotes(sectionId: number): Promise<void> {
  const { error } = await supabase
    .from('votes')
    .update({ lista: 0, preferenze: 0 })
    .eq('section_id', sectionId)
  if (error) throw error
}

/** Azzera i totali aggregati di una sezione */
export async function resetSectionTotals(sectionId: number): Promise<void> {
  const { error } = await supabase
    .from('section_totals')
    .update({ nulli: 0, bianchi: 0, solo_sindaco: 0 })
    .eq('section_id', sectionId)
  if (error) throw error
}

/** Azzera tutti i voti di tutte le sezioni */
export async function resetAllVotes(): Promise<void> {
  const { error: e1 } = await supabase
    .from('votes')
    .update({ lista: 0, preferenze: 0 })
    .gte('lista', 0)
  if (e1) throw e1

  const { error: e2 } = await supabase
    .from('section_totals')
    .update({ nulli: 0, bianchi: 0, solo_sindaco: 0 })
    .gte('nulli', 0)
  if (e2) throw e2
}

// =============================================
// Risultati aggregati (per la tab Risultati)
// =============================================

export type AggregatedResult = {
  candidate: Candidate
  totalLista: number
  totalPreferenze: number
}

/** Calcola i totali aggregati per ogni candidato su tutte le sezioni */
export async function fetchAggregatedResults(): Promise<AggregatedResult[]> {
  const [candidates, votes] = await Promise.all([
    fetchCandidates(),
    supabase.from('votes').select('candidate_id, lista, preferenze').then(({ data, error }) => {
      if (error) throw error
      return data ?? []
    }),
  ])

  return candidates.map((candidate) => {
    const candidateVotes = votes.filter((v) => v.candidate_id === candidate.id)
    return {
      candidate,
      totalLista: candidateVotes.reduce((s, v) => s + v.lista, 0),
      totalPreferenze: candidateVotes.reduce((s, v) => s + v.preferenze, 0),
    }
  })
}

/** Calcola i totali aggregati su tutte le sezioni (nulli, bianchi, solo sindaco) */
export async function fetchGlobalTotals(): Promise<{
  nulli: number
  bianchi: number
  solo_sindaco: number
}> {
  const { data, error } = await supabase.from('section_totals').select('nulli, bianchi, solo_sindaco')
  if (error) throw error
  const rows = data ?? []
  return {
    nulli: rows.reduce((s, r) => s + r.nulli, 0),
    bianchi: rows.reduce((s, r) => s + r.bianchi, 0),
    solo_sindaco: rows.reduce((s, r) => s + r.solo_sindaco, 0),
  }
}
