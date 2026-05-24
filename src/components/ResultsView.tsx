import { useEffect, useState } from 'react'
import { BarChart2, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchAggregatedResults, fetchGlobalTotals, type AggregatedResult } from '../lib/api'

type GlobalTotals = { nulli: number; bianchi: number; solo_sindaco: number }

export function ResultsView() {
  const [results, setResults] = useState<AggregatedResult[]>([])
  const [globalTotals, setGlobalTotals] = useState<GlobalTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      setLoading(true)
      const [res, totals] = await Promise.all([
        fetchAggregatedResults(),
        fetchGlobalTotals(),
      ])
      // Ordina per voti lista decrescenti
      setResults(res.sort((a, b) => b.totalLista - a.totalLista))
      setGlobalTotals(totals)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Errore caricamento risultati')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredResults = results.filter((r) => r.candidate.is_sindaco)
  const totalLista = filteredResults.reduce((s, r) => s + r.totalLista, 0)
  const totalSchede = totalLista
    + (globalTotals ? globalTotals.nulli + globalTotals.bianchi : 0)

  const exportCSV = () => {
    const rows = [
      ['Elezioni Comunali - San Cipriano d\'Aversa'],
      [`Data: ${new Date().toLocaleDateString('it-IT')}`],
      [`Totale schede: ${totalSchede}`],
      [''],
      ['#', 'Sindaco', 'Voti Lista'],
      ...filteredResults.map((r, i) => [
        i + 1,
        `"${r.candidate.name}"`,
        r.totalLista,
      ]),
      [''],
      ['Voti Nulli', globalTotals?.nulli ?? 0],
      ['Schede Bianche', globalTotals?.bianchi ?? 0],
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `risultati-elezioni-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = async () => {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable'),
    ])
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text("Elezioni Comunali — San Cipriano d'Aversa", 14, 18)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Data: ${new Date().toLocaleDateString('it-IT')}`, 14, 26)
    doc.text(`Totale schede: ${totalSchede}`, 14, 32)

    autoTable(doc, {
      startY: 40,
      head: [['#', 'Sindaco', 'Voti Lista']],
      body: filteredResults.map((r, i) => [
        i + 1,
        r.candidate.name,
        r.totalLista,
      ]),
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 64, 175], textColor: 255 },
      alternateRowStyles: { fillColor: [241, 245, 249] },
    })

    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFont('helvetica', 'bold')
    doc.text('Riepilogo sezioni', 14, finalY)
    autoTable(doc, {
      startY: finalY + 4,
      head: [['Tipo', 'Totale']],
      body: [
        ['Voti Nulli', globalTotals?.nulli ?? 0],
        ['Schede Bianche', globalTotals?.bianchi ?? 0],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [71, 85, 105], textColor: 255 },
    })

    doc.save(`risultati-elezioni-${new Date().toISOString().slice(0, 10)}.pdf`)
  }

  if (loading) {
    return (
      <div className="state-loading">
        <div className="spinner" />
        <span>Caricamento risultati...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error global-error">
        <AlertCircle size={16} />
        {error}
        <button className="btn-retry" onClick={load}>
          <RefreshCw size={14} /> Riprova
        </button>
      </div>
    )
  }

  return (
    <section className="results-section">
      <div className="results-header">
        <h2 className="results-title">
          <BarChart2 size={20} /> Risultati Aggregati — Tutte le Sezioni
        </h2>
        <button className="btn-retry" onClick={load} style={{ alignSelf: 'flex-start' }}>
          <RefreshCw size={13} /> Aggiorna
        </button>
      </div>

      {/* Banner totali globali */}
      <div className="results-totals-bar">
        <div className="results-total-chip">
          <span className="rtc-label">Totale Schede</span>
          <span className="rtc-value">{totalSchede}</span>
        </div>
        <div className="results-total-chip chip-red">
          <span className="rtc-label">🚫 Nulli</span>
          <span className="rtc-value">{globalTotals?.nulli ?? 0}</span>
        </div>
        <div className="results-total-chip chip-amber">
          <span className="rtc-label">⬜ Bianchi</span>
          <span className="rtc-value">{globalTotals?.bianchi ?? 0}</span>
        </div>

      </div>

      {/* Tabella candidati */}
      <div className="results-table-wrap">
        <table className="results-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Sindaco</th>
              <th>Voti Lista</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((r, i) => {
              const tot = r.totalLista
              const pct = totalLista > 0
                ? ((r.totalLista / totalLista) * 100).toFixed(1)
                : '0.0'
              return (
                <tr key={r.candidate.id} className={i === 0 ? 'row-first' : ''}>
                  <td className="td-rank">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td className="td-name">
                    {r.candidate.name}
                    {r.candidate.is_sindaco && (
                      <span className="sindaco-tag">Sindaco</span>
                    )}
                  </td>
                  <td className="td-votes td-total">
                    {tot}
                    <span className="td-pct">{pct}%</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Export */}
      <div className="export-buttons">
        <button className="btn-export btn-csv" onClick={exportCSV}>
          <Download size={16} /> CSV
        </button>
        <button className="btn-export btn-pdf" onClick={exportPDF}>
          <FileText size={16} /> PDF
        </button>
      </div>
    </section>
  )
}
