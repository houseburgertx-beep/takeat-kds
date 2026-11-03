import { useState, useEffect } from 'react';
import { loadAuth, clearAuth, type StoredAuth } from './api/takeatApi';
import { useOrders } from './hooks/useOrders';
import { SetupScreen } from './components/SetupScreen';
import { OrderCard } from './components/OrderCard';
import { StatusBar } from './components/StatusBar';
import { EmptyState } from './components/EmptyState';

export default function App() {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadAuth());
  const { orders, doneOrders, status, lastUpdate, errorMsg, markDone, markAllDone, retry } = useOrders(auth);

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

  if (!auth) {
    return <SetupScreen onReady={setAuth} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <StatusBar
        status={status}
        lastUpdate={lastUpdate}
        orderCount={orders.length}
        doneCount={doneOrders.length}
        errorMsg={errorMsg}
        onRetry={retry}
        onLogout={handleLogout}
        onMarkAllDone={markAllDone}
      />

      {/* Main grid area */}
      {orders.length === 0 ? (
        <EmptyState status={status} />
      ) : (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gridAutoRows: 'min-content',
          gap: '14px',
          alignContent: 'start',
        }}>
          {orders.map(order => (
            <OrderCard key={String(order.id)} order={order} onDone={markDone} />
          ))}
        </div>
      )}
    </div>
  );
}
