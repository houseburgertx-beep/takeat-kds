import { useRef, useEffect } from 'react';
import {
  Clock,
  Check,
  RotateCcw,
  PackageCheck,
  AlertCircle,
  ShoppingBag,
  Store,
  Utensils,
  User,
  Plus,
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

export function OrderCard({ order, stage, theme, onMarkReady, onUnmarkReady, onDispatch }: Props) {
  const timer = useTimer(order.createdAt);
  const cardRef = useRef<HTMLDivElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (order.isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [order.isNew]);

  const isIfood = order.channel.toUpperCase() === 'IFOOD';
  const isDelivery = order.type === 'delivery';
  const isBalcao = order.type === 'balcao';

  // Configuração visual do canal / tipo de pedido (sem emojis)
  let channelConfig = {
    label: 'MESA',
    badgeBg: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.12)',
    badgeBorder: isLight ? '#bfdbfe' : 'rgba(59, 130, 246, 0.3)',
    badgeText: isLight ? '#1d4ed8' : '#60a5fa',
    topAccent: '#2563eb',
    Icon: Utensils,
  };

  if (isIfood) {
    channelConfig = {
      label: 'iFood',
      badgeBg: isLight ? '#fff1f2' : 'rgba(234, 29, 44, 0.14)',
      badgeBorder: isLight ? '#fecdd3' : 'rgba(234, 29, 44, 0.35)',
      badgeText: isLight ? '#be123c' : '#fb7185',
      topAccent: '#e11d48',
      Icon: ShoppingBag,
    };
  } else if (isDelivery) {
    channelConfig = {
      label: 'DELIVERY',
      badgeBg: isLight ? '#fff7ed' : 'rgba(249, 115, 22, 0.14)',
      badgeBorder: isLight ? '#fed7aa' : 'rgba(249, 115, 22, 0.35)',
      badgeText: isLight ? '#c2410c' : '#fb923c',
      topAccent: '#ea580c',
      Icon: ShoppingBag,
    };
  } else if (isBalcao) {
    channelConfig = {
      label: 'BALCÃO',
      badgeBg: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.14)',
      badgeBorder: isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.35)',
      badgeText: isLight ? '#047857' : '#34d399',
      topAccent: '#059669',
      Icon: Store,
    };
  }

  // Estilos cromáticos de SLA / Timer
  const timerConfig = {
    ok: {
      bg: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.12)',
      border: isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.3)',
      text: isLight ? '#047857' : '#34d399',
    },
    warn: {
      bg: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.14)',
      border: isLight ? '#fde68a' : 'rgba(245, 158, 11, 0.35)',
      text: isLight ? '#b45309' : '#fbbf24',
    },
    danger: {
      bg: isLight ? '#fef2f2' : 'rgba(239, 68, 68, 0.16)',
      border: isLight ? '#fecaca' : 'rgba(239, 68, 68, 0.45)',
      text: isLight ? '#b91c1c' : '#f87171',
    },
  }[timer.urgency];

  const ChannelIcon = channelConfig.Icon;

  return (
    <article
      ref={cardRef}
      className={order.isNew ? 'card-new' : 'card-enter'}
      style={{
        background: isLight ? '#ffffff' : 'linear-gradient(180deg, #181d26 0%, #11151c 100%)',
        border: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '22px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: isLight
          ? '0 10px 25px -4px rgba(0, 0, 0, 0.07), 0 4px 10px -2px rgba(0, 0, 0, 0.03)'
          : '0 12px 28px -4px rgba(0, 0, 0, 0.6), 0 4px 10px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
    >
      {/* Linha de destaque no topo */}
      <div style={{ height: 3.5, background: channelConfig.topAccent }} />

      {/* Selo NOVO para pedidos recentes */}
      {order.isNew && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          background: '#ef4444', color: '#ffffff', fontSize: '9px',
          fontWeight: 900, padding: '2px 8px', borderRadius: '999px',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          NOVO
        </div>
      )}

      {/* Cabeçalho do Card */}
      <header style={{
        padding: '14px 16px 12px',
        borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        {/* Linha superior: Canal / Tipo e Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: channelConfig.badgeBg,
              border: `1px solid ${channelConfig.badgeBorder}`,
              color: channelConfig.badgeText,
              fontSize: '11px', fontWeight: 800, padding: '3px 8px',
              borderRadius: '8px', letterSpacing: '0.04em',
            }}>
              <ChannelIcon className="w-3.5 h-3.5" strokeWidth={2.4} />
              <span>{channelConfig.label}</span>
            </span>

            {order.brandName && (
              <span style={{
                fontSize: '11px',
                color: isLight ? '#64748b' : '#94a3b8',
                padding: '2px 6px',
                borderRadius: '6px',
                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.04)',
                fontWeight: 600,
              }}>
                {order.brandName}
              </span>
            )}
          </div>

          {/* Timer em cápsula */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: timerConfig.bg,
            border: `1px solid ${timerConfig.border}`,
            padding: '3px 8px', borderRadius: '8px',
          }}>
            <Clock className="w-3 h-3" style={{ color: timerConfig.text }} />
            <span style={{
              fontSize: '12px', fontWeight: 700,
              color: timerConfig.text, fontFamily: 'monospace',
            }}>
              {timer.label}
            </span>
          </div>
        </div>

        {/* Identificação Principal do Pedido (NÚMERO DO PEDIDO BEM DESTACADO) */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h2 style={{
              fontSize: isDelivery ? '22px' : '20px',
              fontWeight: 900,
              color: isLight ? '#0f172a' : '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}>
              {order.orderNumber || order.tableLabel}
            </h2>

            {/* Nome do Cliente */}
            {order.clientName && (
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isLight ? '#475569' : '#94a3b8',
                marginTop: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <User className="w-3.5 h-3.5" style={{ color: isLight ? '#64748b' : '#94a3b8' }} />
                <span>{order.clientName}</span>
              </div>
            )}
          </div>

          {order.totalPrice && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: isLight ? '#64748b' : '#64748b' }}>
              R$ {parseFloat(order.totalPrice).toFixed(2)}
            </span>
          )}
        </div>
      </header>

      {/* Lista de Itens do Pedido */}
      <div style={{
        flex: 1,
        padding: '12px 16px',
        overflowY: 'auto',
        maxHeight: 320,
      }}>
        {order.items.length === 0 ? (
          <p style={{ color: isLight ? '#94a3b8' : '#64748b', fontSize: '13px', textAlign: 'center', padding: '16px 0' }}>
            Nenhum item informado
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {order.items.map((item, idx) => (
              <div
                key={item.id ?? idx}
                style={{
                  padding: '8px 10px',
                  borderRadius: '12px',
                  background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.025)',
                  border: isLight ? '1px solid #eef2f6' : '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* Badge de Quantidade */}
                  <div style={{
                    minWidth: 26, height: 26, borderRadius: '8px',
                    background: isLight ? '#0f172a' : 'rgba(255, 255, 255, 0.08)',
                    border: isLight ? 'none' : '1px solid rgba(255, 255, 255, 0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 900,
                    color: '#ffffff', flexShrink: 0,
                  }}>
                    {item.qty}x
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: isLight ? '#0f172a' : '#f8fafc',
                      lineHeight: 1.3,
                    }}>
                      {item.name}
                    </p>

                    {/* Observação / Detalhe (alerta limpo sem emoji) */}
                    {item.obs && (
                      <div style={{
                        marginTop: 5, padding: '4px 8px', borderRadius: '8px',
                        background: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.12)',
                        border: isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.25)',
                        color: isLight ? '#b45309' : '#fbbf24',
                        fontSize: '11px', fontWeight: 600,
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                      }}>
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: isLight ? '#b45309' : '#fbbf24' }} />
                        <span>{item.obs}</span>
                      </div>
                    )}

                    {/* Complementos e adicionais */}
                    {item.complements.length > 0 && (
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {item.complements.map((c, ci) => (
                          <div key={ci} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <Plus className="w-3 h-3 text-sky-500 shrink-0" />
                            <span style={{
                              fontSize: '12px',
                              color: isLight ? '#334155' : '#cbd5e1',
                              fontWeight: 500,
                            }}>
                              {c.qty > 1 ? `${c.qty}x ` : ''}{c.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações no Rodapé do Card */}
      <footer style={{
        padding: '12px 16px',
        borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.06)',
        background: isLight ? '#fafafa' : 'rgba(0, 0, 0, 0.15)',
      }}>
        {stage === 'in_production' ? (
          <button
            type="button"
            onClick={() => onMarkReady?.(order.id)}
            style={{
              width: '100%', padding: '12px', borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
              letterSpacing: '0.04em', textTransform: 'uppercase',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Marcar como Pronto</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => onUnmarkReady?.(order.id)}
              style={{
                padding: '10px 12px', borderRadius: '10px',
                border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                color: isLight ? '#475569' : '#94a3b8',
                fontSize: '12px', fontWeight: 700,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
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
                flex: 1, padding: '10px 14px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                color: '#ffffff', fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                letterSpacing: '0.03em', textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Despachar / Entregue</span>
            </button>
          </div>
        )}
      </footer>
    </article>
  );
}
