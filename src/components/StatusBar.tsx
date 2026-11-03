import type { ConnectionStatus } from '../hooks/useOrders';

interface Props {
  status: ConnectionStatus;
  lastUpdate: Date | null;
  orderCount: number;
  doneCount: number;
  errorMsg: string;
  restaurantName?: string;
  onRetry: () => void;
  onLogout: () => void;
  onMarkAllDone: () => void;
}

const STATUS_CONFIG = {
  idle: { dot: '#6b7280', label: 'Aguardando' },
  connecting: { dot: '#eab308', label: 'Sincronizando...' },
  connected: { dot: '#22c55e', label: 'Conectado' },
  error: { dot: '#ef4444', label: 'Erro' },
} as const;

export function StatusBar({ status, lastUpdate, orderCount, doneCount, errorMsg, restaurantName, onRetry, onLogout, onMarkAllDone }: Props) {
  const cfg = STATUS_CONFIG[status];
  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <div style={{
      height: 52, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 16,
      background: 'rgba(13,15,18,0.95)', borderBottom: '1px solid var(--border-default)',
      backdropFilter: 'blur(12px)', flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '8px',
          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0,
        }}>🍳</div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>KDS</span>
        {restaurantName && (
          <span style={{
            fontSize: '11px',
            color: '#3b82f6',
            background: 'rgba(59,130,246,0.12)',
            padding: '2px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            maxWidth: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {restaurantName}
          </span>
        )}
      </div>

      <div style={{ width: 1, height: 20, background: 'var(--border-default)' }} />

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', background: cfg.dot,
          boxShadow: status === 'connected' ? `0 0 6px ${cfg.dot}` : 'none',
        }} />
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{cfg.label}</span>
      </div>

      {/* Counters */}
      <div style={{ display: 'flex', gap: 12, marginLeft: 4 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <b style={{ color: 'var(--text-primary)' }}>{orderCount}</b> pendente{orderCount !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          <b style={{ color: '#22c55e' }}>{doneCount}</b> prontos hoje
        </span>
      </div>

      {/* Error message */}
      {status === 'error' && errorMsg && (
        <span style={{ fontSize: '11px', color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {errorMsg}
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* Last update */}
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        {timeStr}
      </span>

      {/* Retry button */}
      {status === 'error' && (
        <button onClick={onRetry} style={{
          padding: '4px 12px', borderRadius: '6px', border: '1px solid #ef4444',
          background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '11px',
          cursor: 'pointer', fontWeight: 600,
        }}>
          Reconectar
        </button>
      )}

      {/* Mark all done */}
      {orderCount > 0 && (
        <button onClick={onMarkAllDone} style={{
          padding: '4px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontSize: '11px',
          cursor: 'pointer', fontWeight: 600,
        }}>
          Limpar todos
        </button>
      )}

      {/* Logout */}
      <button onClick={onLogout} style={{
        padding: '4px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)',
        background: 'transparent', color: 'var(--text-muted)', fontSize: '11px',
        cursor: 'pointer',
      }}>
        Sair
      </button>
    </div>
  );
}
