import { CheckCircle2, AlertCircle, PlayCircle } from 'lucide-react';

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
          width: 52, height: 52, borderRadius: '16px', background: '#fee2e2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        }}>
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#b91c1c' }}>
          Falha de sincronização
        </h3>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: 4, maxWidth: 280 }}>
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
          width: 48, height: 48, borderRadius: '16px', background: '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
        }}>
          <CheckCircle2 className="w-5 h-5 text-slate-400" />
        </div>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#334155' }}>
          Nenhum pedido aguardando retirada
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginTop: 4, maxWidth: 260 }}>
          Os pedidos finalizados na produção aparecerão nesta coluna.
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
        width: 52, height: 52, borderRadius: '16px', background: '#ecfdf5',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      }}>
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
      </div>
      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
        Cozinha em dia
      </h3>
      <p style={{ fontSize: '13px', color: '#64748b', marginTop: 4, maxWidth: 300, lineHeight: 1.4 }}>
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
            border: '1.5px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          <PlayCircle className="w-4 h-4 text-blue-600" />
          <span>Carregar pedidos de demonstração</span>
        </button>
      )}
    </div>
  );
}
