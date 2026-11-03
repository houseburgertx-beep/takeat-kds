import { RefreshCw, LogOut, CheckCheck, Sparkles, Sun, Moon } from 'lucide-react';
import type { ConnectionStatus } from '../hooks/useOrders';

interface Props {
  status: ConnectionStatus;
  lastUpdate: Date | null;
  inProductionCount: number;
  readyCount: number;
  errorMsg: string;
  restaurantName?: string;
  isDemoMode: boolean;
  theme: 'light' | 'dark';
  onRetry: () => void;
  onLogout: () => void;
  onDispatchAllReady: () => void;
  onToggleDemo: () => void;
  onToggleTheme: () => void;
}

const STATUS_CONFIG = {
  idle: { dot: '#64748b', label: 'Aguardando' },
  connecting: { dot: '#f59e0b', label: 'Sincronizando' },
  connected: { dot: '#10b981', label: 'Operação ativa' },
  error: { dot: '#ef4444', label: 'Desconectado' },
} as const;

export function StatusBar({
  status,
  lastUpdate,
  inProductionCount,
  readyCount,
  errorMsg,
  restaurantName,
  isDemoMode,
  theme,
  onRetry,
  onLogout,
  onDispatchAllReady,
  onToggleDemo,
  onToggleTheme,
}: Props) {
  const isLight = theme === 'light';
  const cfg = STATUS_CONFIG[status];
  const timeStr = lastUpdate
    ? lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <header style={{
      height: 56,
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      background: isLight ? '#ffffff' : '#0d1117',
      borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: isLight ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none',
      flexShrink: 0,
      zIndex: 20,
    }}>
      {/* Brand & Store */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          height: 30,
          padding: '0 10px',
          borderRadius: '8px',
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 900,
          letterSpacing: '0.05em',
          color: '#ffffff',
        }}>
          KDS
        </div>

        {restaurantName && (
          <div style={{
            fontSize: '12px',
            color: isLight ? '#1e293b' : '#e2e8f0',
            fontWeight: 700,
            background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.05)',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
            padding: '4px 10px',
            borderRadius: '8px',
            maxWidth: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {restaurantName}
          </div>
        )}
      </div>

      <div style={{ width: 1, height: 22, background: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)' }} />

      {/* Online Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', background: cfg.dot,
          boxShadow: status === 'connected' ? `0 0 8px ${cfg.dot}` : 'none',
        }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: isLight ? '#475569' : '#94a3b8' }}>
          {cfg.label}
        </span>
      </div>

      {/* Kanban counters summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 6 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.1)',
          border: isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.25)',
          padding: '3px 9px', borderRadius: '8px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#b45309' : '#fbbf24' }}>Em Produção:</span>
          <span style={{ fontSize: '12px', fontWeight: 900, color: isLight ? '#92400e' : '#fef3c7' }}>{inProductionCount}</span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.1)',
          border: isLight ? '1px solid #a7f3d0' : '1px solid rgba(16, 185, 129, 0.25)',
          padding: '3px 9px', borderRadius: '8px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? '#047857' : '#34d399' }}>Prontos:</span>
          <span style={{ fontSize: '12px', fontWeight: 900, color: isLight ? '#065f46' : '#ecfdf5' }}>{readyCount}</span>
        </div>
      </div>

      {status === 'error' && errorMsg && (
        <span style={{
          fontSize: '11px', color: '#dc2626', background: isLight ? '#fee2e2' : 'rgba(239, 68, 68, 0.1)',
          padding: '2px 8px', borderRadius: '6px', maxWidth: 220, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600,
        }}>
          {errorMsg}
        </span>
      )}

      <div style={{ flex: 1 }} />

      {/* Clock */}
      <div style={{ fontSize: '12px', fontWeight: 700, color: isLight ? '#475569' : '#94a3b8', fontFamily: 'monospace' }}>
        {timeStr}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Theme Toggle Button (Fundo Branco vs Fundo Escuro) */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isLight ? 'Alternar para fundo escuro' : 'Alternar para fundo branco'}
          style={{
            padding: '6px 11px',
            borderRadius: '8px',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
            background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)',
            color: isLight ? '#0f172a' : '#f8fafc',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isLight ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isLight ? 'Fundo Escuro' : 'Fundo Branco'}</span>
        </button>

        <button
          type="button"
          onClick={onRetry}
          title="Atualizar pedidos agora"
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
            background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.04)',
            color: isLight ? '#334155' : '#cbd5e1',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${status === 'connecting' ? 'animate-spin text-blue-500' : ''}`} />
          <span>Sincronizar</span>
        </button>

        {readyCount > 0 && (
          <button
            type="button"
            onClick={onDispatchAllReady}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(37, 99, 235, 0.4)',
              background: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)',
              color: isLight ? '#1d4ed8' : '#60a5fa',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Despachar Prontos</span>
          </button>
        )}

        {/* Demo mode button */}
        <button
          type="button"
          onClick={onToggleDemo}
          title={isDemoMode ? 'Remover pedidos demonstrativos' : 'Carregar pedidos demonstrativos'}
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: isDemoMode ? '1px solid rgba(245, 158, 11, 0.5)' : isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.08)',
            background: isDemoMode ? (isLight ? '#fef3c7' : 'rgba(234, 179, 8, 0.15)') : (isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)'),
            color: isDemoMode ? '#b45309' : isLight ? '#64748b' : '#64748b',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{isDemoMode ? 'Limpar Testes' : 'Teste'}</span>
        </button>

        <button
          type="button"
          onClick={onLogout}
          title="Encerrar sessão no KDS"
          style={{
            padding: '6px 10px',
            borderRadius: '8px',
            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.06)',
            background: 'transparent',
            color: isLight ? '#64748b' : '#64748b',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}
