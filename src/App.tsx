import { useState, useEffect } from 'react';
import { Flame, CheckCircle } from 'lucide-react';
import { loadAuth, clearAuth, type StoredAuth } from './api/takeatApi';
import { useOrders } from './hooks/useOrders';
import { SetupScreen } from './components/SetupScreen';
import { OrderCard } from './components/OrderCard';
import { StatusBar } from './components/StatusBar';
import { EmptyState } from './components/EmptyState';

const THEME_KEY = 'takeat_kds_theme_v2';

export default function App() {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadAuth());
  const [mobileTab, setMobileTab] = useState<'production' | 'ready'>('production');

  // Padrão Fundo Branco (conforme solicitado), com alternância salva no navegador
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const isLight = theme === 'light';

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch { /* ignore */ }
      return next;
    });
  };

  const {
    inProductionOrders,
    readyOrders,
    status,
    lastUpdate,
    errorMsg,
    isDemoMode,
    markReady,
    unmarkReady,
    dispatchOrder,
    dispatchAllReady,
    loadDemoOrders,
    clearDemoOrders,
    retry,
  } = useOrders(auth);

  // Keep-awake (Screen Wake Lock API)
  useEffect(() => {
    if (!auth) return;
    let wakeLock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch { /* ignore */ }
    };
    void acquire();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLock?.release().catch(() => {});
    };
  }, [auth]);

  const handleLogout = () => {
    clearAuth();
    setAuth(null);
  };

  const handleToggleDemo = () => {
    if (isDemoMode) {
      clearDemoOrders();
    } else {
      loadDemoOrders();
    }
  };

  if (!auth) {
    return <SetupScreen onReady={setAuth} />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: isLight ? '#f1f5f9' : '#0a0d12',
      color: isLight ? '#0f172a' : '#f8fafc',
      transition: 'background-color 0.2s ease',
    }}>
      <StatusBar
        status={status}
        lastUpdate={lastUpdate}
        inProductionCount={inProductionOrders.length}
        readyCount={readyOrders.length}
        errorMsg={errorMsg}
        restaurantName={auth.restaurantName}
        isDemoMode={isDemoMode}
        theme={theme}
        onRetry={retry}
        onLogout={handleLogout}
        onDispatchAllReady={dispatchAllReady}
        onToggleDemo={handleToggleDemo}
        onToggleTheme={toggleTheme}
      />

      {/* Mobile Tab Switcher (visível apenas em celulares estreitos) */}
      <div
        className="md:hidden flex p-2"
        style={{
          background: isLight ? '#ffffff' : '#0d1117',
          borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <button
          type="button"
          onClick={() => setMobileTab('production')}
          className="flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2"
          style={{
            background: mobileTab === 'production'
              ? (isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)')
              : 'transparent',
            color: mobileTab === 'production'
              ? (isLight ? '#b45309' : '#fbbf24')
              : (isLight ? '#64748b' : '#64748b'),
            border: mobileTab === 'production'
              ? (isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.3)')
              : '1px solid transparent',
          }}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Em Produção ({inProductionOrders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('ready')}
          className="flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2"
          style={{
            background: mobileTab === 'ready'
              ? (isLight ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)')
              : 'transparent',
            color: mobileTab === 'ready'
              ? (isLight ? '#047857' : '#34d399')
              : (isLight ? '#64748b' : '#64748b'),
            border: mobileTab === 'ready'
              ? (isLight ? '1px solid #a7f3d0' : '1px solid rgba(16, 185, 129, 0.3)')
              : '1px solid transparent',
          }}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Pronto ({readyOrders.length})</span>
        </button>
      </div>

      {/* 2 KANBAN COLUMNS (Layout Principal para Tablets e Monitores) */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 16,
        padding: 16,
        overflow: 'hidden',
      }} className="hidden md:grid">

        {/* ── COLUNA 1: EM PRODUÇÃO ── */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          background: isLight ? '#f8fafc' : '#0d1117',
          border: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: isLight
            ? '0 4px 16px -2px rgba(0, 0, 0, 0.05)'
            : '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}>
          {/* Cabeçalho da Coluna */}
          <div style={{
            padding: '14px 18px',
            borderBottom: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.06)',
            background: isLight ? '#fffbeb' : 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#f59e0b',
                boxShadow: '0 0 8px #f59e0b',
              }} />
              <h2 style={{
                fontSize: '14px',
                fontWeight: 900,
                color: isLight ? '#92400e' : '#f8fafc',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Em Produção
              </h2>
            </div>

            <span style={{
              background: isLight ? '#fef3c7' : 'rgba(245, 158, 11, 0.15)',
              border: isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.3)',
              color: isLight ? '#b45309' : '#fbbf24',
              fontSize: '12px',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: 999,
            }}>
              {inProductionOrders.length} {inProductionOrders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {/* Cards da Produção */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {inProductionOrders.length === 0 ? (
              <EmptyState status={status} isReadyColumn={false} onSimulate={loadDemoOrders} />
            ) : (
              inProductionOrders.map(order => (
                <OrderCard
                  key={String(order.id)}
                  order={order}
                  stage="in_production"
                  theme={theme}
                  onMarkReady={markReady}
                />
              ))
            )}
          </div>
        </section>

        {/* ── COLUNA 2: PRONTO PARA RETIRADA / EXPEDIÇÃO ── */}
        <section style={{
          display: 'flex',
          flexDirection: 'column',
          background: isLight ? '#f8fafc' : '#0d1117',
          border: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 22,
          overflow: 'hidden',
          boxShadow: isLight
            ? '0 4px 16px -2px rgba(0, 0, 0, 0.05)'
            : '0 8px 24px rgba(0, 0, 0, 0.4)',
        }}>
          {/* Cabeçalho da Coluna */}
          <div style={{
            padding: '14px 18px',
            borderBottom: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.06)',
            background: isLight ? '#ecfdf5' : 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', background: '#10b981',
                boxShadow: '0 0 8px #10b981',
              }} />
              <h2 style={{
                fontSize: '14px',
                fontWeight: 900,
                color: isLight ? '#065f46' : '#f8fafc',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Pronto para Entrega
              </h2>
            </div>

            <span style={{
              background: isLight ? '#d1fae5' : 'rgba(16, 185, 129, 0.15)',
              border: isLight ? '1px solid #a7f3d0' : '1px solid rgba(16, 185, 129, 0.3)',
              color: isLight ? '#047857' : '#34d399',
              fontSize: '12px',
              fontWeight: 800,
              padding: '2px 10px',
              borderRadius: 999,
            }}>
              {readyOrders.length} {readyOrders.length === 1 ? 'pronto' : 'prontos'}
            </span>
          </div>

          {/* Cards Prontos */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {readyOrders.length === 0 ? (
              <EmptyState status={status} isReadyColumn={true} />
            ) : (
              readyOrders.map(order => (
                <OrderCard
                  key={String(order.id)}
                  order={order}
                  stage="ready"
                  theme={theme}
                  onUnmarkReady={unmarkReady}
                  onDispatch={dispatchOrder}
                />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Visualização Mobile em Abas (para celulares) */}
      <div className="md:hidden flex-1 overflow-y-auto p-3">
        {mobileTab === 'production' ? (
          inProductionOrders.length === 0 ? (
            <EmptyState status={status} isReadyColumn={false} onSimulate={loadDemoOrders} />
          ) : (
            <div className="flex flex-col gap-3">
              {inProductionOrders.map(order => (
                <OrderCard
                  key={String(order.id)}
                  order={order}
                  stage="in_production"
                  theme={theme}
                  onMarkReady={markReady}
                />
              ))}
            </div>
          )
        ) : (
          readyOrders.length === 0 ? (
            <EmptyState status={status} isReadyColumn={true} />
          ) : (
            <div className="flex flex-col gap-3">
              {readyOrders.map(order => (
                <OrderCard
                  key={String(order.id)}
                  order={order}
                  stage="ready"
                  theme={theme}
                  onUnmarkReady={unmarkReady}
                  onDispatch={dispatchOrder}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
