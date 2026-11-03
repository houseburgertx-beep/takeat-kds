import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  status: string;
  isReadyColumn?: boolean;
  onSimulate?: () => void;
}

export function EmptyState({ status, isReadyColumn = false, onSimulate }: Props) {
  if (status === 'error') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '16px', background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        }}>
          <AlertCircle className="w-6 h-6 text-red-400" />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f87171' }}>
          Falha de sincronização
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4, maxWidth: 280 }}>
          Verifique a conexão com a Takeat. Novas tentativas estão ocorrendo automaticamente.
        </p>
      </div>
    );
  }

  if (isReadyColumn) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '50px 20px', textAlign: 'center',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}>
          <CheckCircle2 className="w-5 h-5 text-slate-500" />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Nenhum pedido aguardando retirada
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4, maxWidth: 260 }}>
          Os pedidos marcados como prontos na produção aparecerão nesta coluna.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '50px 20px', textAlign: 'center',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '16px', background: 'rgba(16, 185, 129, 0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
        Cozinha em dia
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: 4, maxWidth: 300, lineHeight: 1.4 }}>
        Nenhum pedido aberto no momento. Novos pedidos do PDV, delivery ou mesas entrarão automaticamente.
      </p>

      {onSimulate && (
        <button
          type="button"
          onClick={onSimulate}
          style={{
            marginTop: 18,
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Simular pedidos de teste</span>
        </button>
      )}
    </div>
  );
}
