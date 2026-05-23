// ConnectionStatus è ora definito in useSection.ts
export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

const STATUS_MAP = {
  connecting:   { color: '#f59e0b', label: 'Connessione...' },
  connected:    { color: '#22c55e', label: 'Live' },
  disconnected: { color: '#ef4444', label: 'Disconnesso' },
}

export function StatusBadge({ status }: { status: ConnectionStatus }) {
  const { color, label } = STATUS_MAP[status]
  return (
    <div className="status-badge">
      <span className="status-dot" style={{ background: color }} />
      <span style={{ color }}>{label}</span>
    </div>
  )
}
