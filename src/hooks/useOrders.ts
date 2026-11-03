import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchOrders, refreshToken, type StoredAuth, type KDSOrder } from '../api/takeatApi';

const POLL_INTERVAL = 20_000; // 20s
const NEW_BADGE_DURATION = 5_000; // 5s

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'idle';

interface UseOrdersResult {
  orders: KDSOrder[];
  doneOrders: KDSOrder[];
  status: ConnectionStatus;
  lastUpdate: Date | null;
  errorMsg: string;
  markDone: (id: string | number) => void;
  markAllDone: () => void;
  retry: () => void;
}

export function useOrders(auth: StoredAuth | null): UseOrdersResult {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [doneOrders, setDoneOrders] = useState<KDSOrder[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const authRef = useRef<StoredAuth | null>(auth);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const retryCount = useRef(0);

  useEffect(() => { authRef.current = auth; }, [auth]);

  const poll = useCallback(async () => {
    const currentAuth = authRef.current;
    if (!currentAuth) return;

    let usedAuth = currentAuth;
    if (Date.now() > currentAuth.expiresAt) {
      const refreshed = await refreshToken(currentAuth);
      if (!refreshed) {
        setStatus('error');
        setErrorMsg('Token expirado. Faça login novamente.');
        return;
      }
      usedAuth = refreshed;
      authRef.current = usedAuth;
    }

    try {
      setStatus('connecting');
      const fetched = await fetchOrders(usedAuth);
      retryCount.current = 0;

      setOrders(prev => {
        const newOrders = fetched.map(o => ({
          ...o,
          isNew: !knownIdsRef.current.has(String(o.id)),
        }));
        newOrders.forEach(o => {
          if (o.isNew) {
            knownIdsRef.current.add(String(o.id));
            // Auto-clear isNew badge
            setTimeout(() => {
              setOrders(cur => cur.map(c => c.id === o.id ? { ...c, isNew: false } : c));
            }, NEW_BADGE_DURATION);
          }
        });
        // Play notification sound for new orders
        const hasNew = newOrders.some(o => o.isNew);
        if (hasNew && prev.length > 0) {
          playNotification();
        }
        return newOrders;
      });

      setStatus('connected');
      setLastUpdate(new Date());
      setErrorMsg('');
    } catch (err) {
      retryCount.current++;
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro de conexão');
    }
  }, []);

  const retry = useCallback(() => { void poll(); }, [poll]);

  const markDone = useCallback((id: string | number) => {
    setOrders(prev => {
      const order = prev.find(o => o.id === id);
      if (order) setDoneOrders(d => [{ ...order, status: 'done' }, ...d].slice(0, 20));
      return prev.filter(o => o.id !== id);
    });
  }, []);

  const markAllDone = useCallback(() => {
    setOrders(prev => {
      setDoneOrders(d => [...prev.map(o => ({ ...o, status: 'done' })), ...d].slice(0, 20));
      return [];
    });
  }, []);

  useEffect(() => {
    if (!auth) { setStatus('idle'); return; }
    void poll();
    timerRef.current = setInterval(() => void poll(), POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [auth, poll]);

  return { orders, doneOrders, status, lastUpdate, errorMsg, markDone, markAllDone, retry };
}

function playNotification() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.frequency.value = 1100;
      osc2.type = 'sine';
      g2.gain.setValueAtTime(0.12, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }, 200);
  } catch { /* ignore */ }
}
