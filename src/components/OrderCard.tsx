import { useState } from 'react';
import {
  Clock,
  RotateCcw,
  Check,
  AlertCircle,
  Plus,
  Truck,
  Store,
  Utensils,
} from 'lucide-react';
import { useTimer } from '../hooks/useTimer';
import type { KDSOrder } from '../api/takeatApi';

interface Props {
  order: KDSOrder;
  stage: 'in_production' | 'ready';
  theme: 'light' | 'dark';
  onMarkReady?: (id: string | number) => void;
  onUnmarkReady?: (id: string | number) => void;
  onDispatch?: (id: string | number) => void;
}

export function OrderCard({
  order,
  stage,
  theme,
  onMarkReady,
  onUnmarkReady,
  onDispatch,
}: Props) {
  const timer = useTimer(order.createdAt);
  const isLight = theme === 'light';

  // Controle interno de "Iniciar Preparo" -> "Finalizar Preparo"
  const [isPreparing, setIsPreparing] = useState(false);

  const isDelivery = order.type === 'delivery';
  const isBalcao = order.type === 'balcao';

  // Ícone discreto para o avatar (sem emojis de IA)
  const TypeIcon = isDelivery ? Truck : isBalcao ? Store : Utensils;

  const handleActionClick = () => {
    if (stage === 'in_production') {
      if (!isPreparing) {
        // Primeiro clique: Inicia o preparo
        setIsPreparing(true);
      } else {
        // Segundo clique: Finaliza o preparo e move para a coluna Pronto
        onMarkReady?.(order.id);
      }
    }
  };

  return (
    <article
      style={{
        background: isLight ? '#ffffff' : '#151b26',
        // Borda azul oficial da Takeat visível na foto do tablet
        border: isLight ? '2px solid #2563eb' : '2px solid #3b82f6',
        borderRadius: '18px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px',
        // Sombra suave com profundidade real solicitada
        boxShadow: isLight
          ? '0 10px 25px -4px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)'
          : '0 12px 28px -4px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.35)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minHeight: '260px',
      }}
    >
      {/* ── TOPO DO CARD: Avatar circular + Número do Pedido + Timer + Código Takeat ── */}
      <div>
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            paddingBottom: '12px',
            borderBottom: isLight ? '1.5px solid #f1f5f9' : '1.5px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '12px',
          }}
        >
          {/* Lado Esquerdo: Avatar Preto circular + Número do Pedido grande + Tipo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              }}
            >
              <TypeIcon className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>

            <div>
              {/* Número do Pedido (#70) em fonte extra negrito como no KDS físico */}
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: isLight ? '#0f172a' : '#ffffff',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}
              >
                {order.orderNumber || `#${String(order.id).slice(-4)}`}
              </div>

              {/* Rótulo do tipo (Retirada, Delivery, Mesa) */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isLight ? '#334155' : '#94a3b8',
                  marginTop: '2px',
                }}
              >
                {order.typeLabel || (isDelivery ? 'Delivery' : isBalcao ? 'Retirada' : order.tableLabel)}
                {order.clientName && order.type === 'delivery' && (
                  <span style={{ fontWeight: 500, marginLeft: 6, fontSize: '13px', color: isLight ? '#64748b' : '#94a3b8' }}>
                    • {order.clientName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Lado Direito: Timer cápsula cyan/verde + Código do Pedido (Nº #494-5812) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {/* Cápsula do Timer exatamente como na foto (fundo ciano suave) */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: isLight ? '#e6f7f5' : 'rgba(13, 148, 136, 0.18)',
                border: isLight ? '1px solid #99e6df' : '1px solid rgba(13, 148, 136, 0.4)',
                padding: '3px 9px',
                borderRadius: '8px',
              }}
            >
              <Clock className="w-3.5 h-3.5 text-teal-700" strokeWidth={2.5} />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: isLight ? '#0d7377' : '#2dd4bf',
                  fontFamily: 'monospace',
                }}
              >
                {timer.label}
              </span>
            </div>

            {/* Código externo oficial do pedido (ex: Nº #494-5812) */}
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isLight ? '#64748b' : '#94a3b8',
                letterSpacing: '0.02em',
              }}
            >
              {order.externalNumber || `Nº #${String(order.sessionId ?? order.id).slice(-6)}`}
            </div>
          </div>
        </header>

        {/* ── ITENS DO PEDIDO: Nome do item na esquerda + SLA (20 min) na direita ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          {order.items.length === 0 ? (
            <p style={{ color: isLight ? '#94a3b8' : '#64748b', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>
              Nenhum item informado
            </p>
          ) : (
            order.items.map((item, idx) => (
              <div
                key={item.id ?? idx}
                style={{
                  paddingBottom: '8px',
                  borderBottom: idx < order.items.length - 1
                    ? (isLight ? '1px dashed #e2e8f0' : '1px dashed rgba(255, 255, 255, 0.08)')
                    : 'none',
                }}
              >
                {/* Linha principal: 1x Item + 20 min */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                  <div
                    style={{
                      fontSize: '15px',
                      fontWeight: 800,
                      color: isLight ? '#0f172a' : '#ffffff',
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    <span style={{ color: isLight ? '#0f172a' : '#ffffff', marginRight: '6px' }}>
                      {item.qty}x
                    </span>
                    <span>{item.name}</span>
                  </div>

                  {/* Tempo SLA (ex: 20 min) */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: isLight ? '#334155' : '#cbd5e1',
                      background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.06)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.prepTimeMinutes ?? 20} min
                  </span>
                </div>

                {/* Observação (se houver) */}
                {item.obs && (
                  <div
                    style={{
                      marginTop: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.12)',
                      border: isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.25)',
                      color: isLight ? '#b45309' : '#fbbf24',
                      fontSize: '11px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{item.obs}</span>
                  </div>
                )}

                {/* Complementos e adicionais */}
                {item.complements && item.complements.length > 0 && (
                  <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '8px' }}>
                    {item.complements.map((c, ci) => (
                      <div key={ci} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Plus className="w-3 h-3 text-blue-500 shrink-0" />
                        <span style={{ fontSize: '12px', color: isLight ? '#475569' : '#94a3b8', fontWeight: 500 }}>
                          {c.qty > 1 ? `${c.qty}x ` : ''}{c.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── BOTÃO DE AÇÃO: Iniciar Preparo -> Finalizar Preparo -> Pronto ── */}
      <div>
        {stage === 'in_production' ? (
          <button
            type="button"
            onClick={handleActionClick}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              // Azul vibrante (#2563eb) para Iniciar; Verde (#10b981) para Finalizar
              background: !isPreparing ? '#2563eb' : '#10b981',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: !isPreparing
                ? '0 4px 14px rgba(37, 99, 235, 0.35)'
                : '0 4px 14px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.15s ease, transform 0.1s ease',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{!isPreparing ? 'Iniciar Preparo' : 'Finalizar Preparo'}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onUnmarkReady?.(order.id)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255, 255, 255, 0.12)',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.05)',
                color: isLight ? '#475569' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
              title="Retornar para Em Produção"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Voltar</span>
            </button>

            <button
              type="button"
              onClick={() => onDispatch?.(order.id)}
              style={{
                flex: 1,
                padding: '12px 14px',
                borderRadius: '10px',
                border: 'none',
                background: '#059669',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Despachar / Entregue</span>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
