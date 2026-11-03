import { useRef, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import type { KDSOrder } from '../api/takeatApi';

interface Props {
  order: KDSOrder;
  onDone: (id: string | number) => void;
}

const TYPE_CONFIG = {
  table: { label: 'Mesa', bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', icon: '🍽️', timerBg: '#3b82f6' },
  delivery: { label: 'Delivery', bg: 'rgba(249,115,22,0.12)', border: '#f97316', icon: '🛵', timerBg: '#f97316' },
  balcao: { label: 'Balcão', bg: 'rgba(34,197,94,0.12)', border: '#22c55e', icon: '🏪', timerBg: '#22c55e' },
} as const;

const URGENCY_COLORS = {
  ok: '#22c55e',
  warn: '#eab308',
  danger: '#ef4444',
} as const;

export function OrderCard({ order, onDone }: Props) {
  const timer = useTimer(order.createdAt);
  const cfg = TYPE_CONFIG[order.type] ?? TYPE_CONFIG.table;
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll into view when new
  useEffect(() => {
    if (order.isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [order.isNew]);

  const timerColor = URGENCY_COLORS[timer.urgency];

  return (
    <div
      ref={cardRef}
      className={order.isNew ? 'card-new' : 'card-enter'}
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${cfg.border}`,
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        boxShadow: `0 0 0 1px ${cfg.border}22, 0 4px 24px rgba(0,0,0,0.3)`,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 2px ${cfg.border}44, 0 8px 32px rgba(0,0,0,0.4)`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 1px ${cfg.border}22, 0 4px 24px rgba(0,0,0,0.3)`;
      }}
    >
      {/* NEW badge */}
      {order.isNew && (
        <div style={{
          position: 'absolute', top: 10, right: 10, zIndex: 10,
          background: '#ef4444', color: 'white', fontSize: '10px',
          fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
          letterSpacing: '0.05em', animation: 'pulse-ring 1.5s ease infinite',
        }}>
          NOVO
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        background: cfg.bg,
        borderBottom: `1px solid ${cfg.border}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          {/* Type badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: cfg.border, color: 'white',
            fontSize: '11px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}>
            {cfg.icon} {cfg.label}
          </span>

          {/* Table / Order number */}
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {order.tableLabel}
          </span>

          {/* Order ID */}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'monospace' }}>
            #{String(order.orderKey ?? order.id).slice(-6)}
          </span>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%', background: timerColor,
              boxShadow: `0 0 6px ${timerColor}`,
              animation: timer.urgency === 'danger' ? 'pulse-ring 1s ease infinite' : undefined,
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: timerColor, fontFamily: 'monospace' }}>
              {timer.label}
            </span>
            {timer.urgency === 'danger' && (
              <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>⚠ ATRASADO</span>
            )}
          </div>
          {order.brandName && (
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.04)' }}>
              {order.brandName}
            </span>
          )}
        </div>
      </div>

      {/* Timer progress bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.04)' }}>
        <div
          className="timer-bar"
          style={{
            width: `${timer.progress}%`,
            background: `linear-gradient(90deg, ${timerColor}88, ${timerColor})`,
          }}
        />
      </div>

      {/* Items list */}
      <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto', maxHeight: 340 }}>
        {order.items.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>
            Carregando itens...
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.items.map((item, idx) => (
              <div key={item.id ?? idx}>
                {/* Main item */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {/* Qty badge */}
                  <div style={{
                    minWidth: 28, height: 28, borderRadius: '8px',
                    background: `${cfg.border}20`, border: `1px solid ${cfg.border}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: 700, color: cfg.border,
                  }}>
                    {item.qty}x
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {item.name}
                    </p>
                    {/* Observation */}
                    {item.obs && (
                      <p style={{
                        fontSize: '11px', color: '#eab308', marginTop: 3,
                        padding: '2px 6px', borderRadius: '4px',
                        background: 'rgba(234,179,8,0.1)', display: 'inline-block',
                      }}>
                        ⚡ {item.obs}
                      </p>
                    )}
                    {/* Complements */}
                    {item.complements.length > 0 && (
                      <div style={{ marginTop: 6, paddingLeft: 2 }}>
                        {item.complements.map((c, ci) => (
                          <div key={ci} style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                              + {c.qty > 1 ? `${c.qty}x ` : ''}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {c.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Divider between items */}
                {idx < order.items.length - 1 && (
                  <div style={{ height: 1, background: 'var(--border-default)', marginTop: 10 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer — Done button */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-default)' }}>
        <button
          onClick={() => onDone(order.id)}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
            background: `linear-gradient(135deg, ${cfg.border}, ${cfg.border}cc)`,
            color: 'white', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.04em', textTransform: 'uppercase',
            boxShadow: `0 2px 12px ${cfg.border}44`,
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          ✓ Pronto
        </button>
      </div>
    </div>
  );
}
