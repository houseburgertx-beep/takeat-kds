import { useState, useEffect } from 'react';
import { Columns, Layers, Flame, CheckCircle2 } from 'lucide-react';
import { loadAuth, clearAuth, type StoredAuth } from './api/takeatApi';
import { useOrders } from './hooks/useOrders';
import { SetupScreen } from './components/SetupScreen';
import { OrderCard } from './components/OrderCard';
import { StatusBar } from './components/StatusBar';
import { EmptyState } from './components/EmptyState';

const THEME_KEY = 'takeat_kds_theme_v2';
const VIEW_MODE_KEY = 'takeat_kds_view_mode';

export default function App() {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadAuth());

  // Fundo Branco como padrão oficial (solicitado pelo usuário)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  // Alternância entre Visão 2 Kanban (Em Produção / Pronto) e Visão em Abas Takeat Oficial (Novos / Finalizados / Cancelados)
  const [viewMode, setViewMode] = useState<'kanban' | 'tabs'>(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_KEY);
      return saved === 'tabs' ? 'tabs' : 'kanban';
    } catch {
      return 'kanban';
    }
  });

  const [activeTab, setActiveTab] = useState<'novos' | 'finalizados' | 'cancelados'>('novos');

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

  const toggleViewMode = () => {
    setViewMode(prev => {
      const next = prev === 'kanban' ? 'tabs' : 'kanban';
      try {
        localStorage.setItem(VIEW_MODE_KEY, next);
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

  // Keep-awake (Screen Wake Lock API para manter o tablet sempre ligado)
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: isLight ? '#f1f5f9' : '#0a0d12',
        color: isLight ? '#0f172a' : '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Barra superior de status e controles */}
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

      {/* Sub-header com as Abas Oficiais Takeat da foto física (Novos, Finalizados, Cancelados) + Seletor de Modo */}
      <div
        style={{
          background: isLight ? '#ffffff' : '#11151c',
          borderBottom: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.08)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        {/* Abas idênticas à foto do tablet Takeat KDS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Aba Novos com barra vermelha inferior */}
          <button
            type="button"
            onClick={() => setActiveTab('novos')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              color: activeTab === 'novos' ? (isLight ? '#0f172a' : '#ffffff') : '#64748b',
              // Barra vermelha na aba ativa como na foto da Takeat
              borderBottom: activeTab === 'novos' ? '4px solid #b91c1c' : '4px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Novos</span>
            <span style={{ fontSize: '13px', color: activeTab === 'novos' ? '#b91c1c' : '#94a3b8' }}>
              [ {inProductionOrders.length} ]
            </span>
          </button>

          {/* Aba Finalizados */}
          <button
            type="button"
            onClick={() => setActiveTab('finalizados')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              color: activeTab === 'finalizados' ? (isLight ? '#0f172a' : '#ffffff') : '#64748b',
              borderBottom: activeTab === 'finalizados' ? '4px solid #10b981' : '4px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Finalizados</span>
            <span style={{ fontSize: '13px', color: activeTab === 'finalizados' ? '#10b981' : '#94a3b8' }}>
              [ {readyOrders.length} ]
            </span>
          </button>

          {/* Aba Cancelados */}
          <button
            type="button"
            onClick={() => setActiveTab('cancelados')}
            style={{
              padding: '14px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              color: activeTab === 'cancelados' ? (isLight ? '#0f172a' : '#ffffff') : '#64748b',
              borderBottom: activeTab === 'cancelados' ? '4px solid #ef4444' : '4px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Cancelados</span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>[ 0 ]</span>
          </button>
        </div>

        {/* Botão de Alternância: 2 Colunas Kanban vs Visão em Aba Única */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleViewMode}
            title={viewMode === 'kanban' ? 'Mudar para visualização em abas' : 'Mudar para 2 colunas Kanban'}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255, 255, 255, 0.12)',
              background: isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)',
              color: isLight ? '#334155' : '#e2e8f0',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {viewMode === 'kanban' ? (
              <>
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Visualização: 2 Kanban</span>
              </>
            ) : (
              <>
                <Columns className="w-3.5 h-3.5 text-blue-600" />
                <span>Visualização: Abas</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL DOS CARDS */}
      <main style={{ flex: 1, overflow: 'hidden', padding: '16px' }}>
        {viewMode === 'kanban' ? (
          /* ── MODO 2 COLUNAS KANBAN: "EM PRODUÇÃO" E "PRONTO" LADO A LADO ── */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '16px',
              height: '100%',
            }}
          >
            {/* Coluna 1: Em Produção */}
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isLight ? '#f8fafc' : '#0d1117',
                border: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isLight ? '0 4px 16px rgba(0, 0, 0, 0.04)' : 'none',
              }}
            >
              {/* Header da Coluna */}
              <div
                style={{
                  padding: '12px 18px',
                  background: isLight ? '#ffffff' : '#151b26',
                  borderBottom: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Em Produção
                  </h2>
                </div>
                <span
                  style={{
                    background: isLight ? '#fffbeb' : 'rgba(245, 158, 11, 0.15)',
                    border: isLight ? '1px solid #fde68a' : '1px solid rgba(245, 158, 11, 0.3)',
                    color: isLight ? '#b45309' : '#fbbf24',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {inProductionOrders.length} {inProductionOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
              </div>

              {/* Lista com scroll dos cards */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
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

            {/* Coluna 2: Pronto */}
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: isLight ? '#f8fafc' : '#0d1117',
                border: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: isLight ? '0 4px 16px rgba(0, 0, 0, 0.04)' : 'none',
              }}
            >
              {/* Header da Coluna */}
              <div
                style={{
                  padding: '12px 18px',
                  background: isLight ? '#ffffff' : '#151b26',
                  borderBottom: isLight ? '1.5px solid #e2e8f0' : '1.5px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h2 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>
                    Pronto para Entrega
                  </h2>
                </div>
                <span
                  style={{
                    background: isLight ? '#ecfdf5' : 'rgba(16, 185, 129, 0.15)',
                    border: isLight ? '1px solid #a7f3d0' : '1px solid rgba(16, 185, 129, 0.3)',
                    color: isLight ? '#047857' : '#34d399',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 10px',
                    borderRadius: '999px',
                  }}
                >
                  {readyOrders.length} {readyOrders.length === 1 ? 'pronto' : 'prontos'}
                </span>
              </div>

              {/* Lista com scroll dos cards */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
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
          </div>
        ) : (
          /* ── MODO ABAS: EXIBE OS CARDS DA ABA SELECIONADA EM GRADE ── */
          <div style={{ height: '100%', overflowY: 'auto', padding: '4px' }}>
            {activeTab === 'novos' && (
              inProductionOrders.length === 0 ? (
                <EmptyState status={status} isReadyColumn={false} onSimulate={loadDemoOrders} />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '16px',
                  }}
                >
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
            )}

            {activeTab === 'finalizados' && (
              readyOrders.length === 0 ? (
                <EmptyState status={status} isReadyColumn={true} />
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                    gap: '16px',
                  }}
                >
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

            {activeTab === 'cancelados' && (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <p style={{ fontSize: '14px', fontWeight: 600 }}>Nenhum pedido cancelado no turno atual.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
