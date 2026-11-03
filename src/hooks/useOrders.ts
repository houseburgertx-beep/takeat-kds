import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchOrders, refreshToken, type StoredAuth, type KDSOrder } from '../api/takeatApi';
import { createDemoOrders } from '../api/demoOrders';

const POLL_INTERVAL = 15_000; // 15s
const NEW_BADGE_DURATION = 8_000; // 8s

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'idle';

const READY_KEY = 'takeat_kds_ready_ids_v2';
const DISPATCHED_KEY = 'takeat_kds_dispatched_ids_v2';

function loadStoredSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr.map(String)) : new Set();
  } catch {
    return new Set();
  }
}

function saveStoredSet(key: string, set: Set<string>): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set).slice(-100)));
  } catch { /* ignore */ }
}

interface UseOrdersResult {
  inProductionOrders: KDSOrder[];
  readyOrders: KDSOrder[];
  allActiveOrdersCount: number;
  status: ConnectionStatus;
  lastUpdate: Date | null;
  errorMsg: string;
  isDemoMode: boolean;
  markReady: (id: string | number) => void;
  unmarkReady: (id: string | number) => void;
  dispatchOrder: (id: string | number) => void;
  dispatchAllReady: () => void;
  loadDemoOrders: () => void;
  clearDemoOrders: () => void;
  retry: () => void;
}

export function useOrders(auth: StoredAuth | null): UseOrdersResult {
  const [apiOrders, setApiOrders] = useState<KDSOrder[]>([]);
  const [demoOrders, setDemoOrders] = useState<KDSOrder[]>([]);
  const [readyIds, setReadyIds] = useState<Set<string>>(() => loadStoredSet(READY_KEY));
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(() => loadStoredSet(DISPATCHED_KEY));
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const authRef = useRef<StoredAuth | null>(auth);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    authRef.current = auth;
  }, [auth]);

  // Persist ready and dispatched states
  useEffect(() => {
    saveStoredSet(READY_KEY, readyIds);
  }, [readyIds]);

  useEffect(() => {
    saveStoredSet(DISPATCHED_KEY, dispatchedIds);
  }, [dispatchedIds]);

  const poll = useCallback(async () => {
    const currentAuth = authRef.current;
    if (!currentAuth) return;

    let usedAuth = currentAuth;
    if (Date.now() > currentAuth.expiresAt) {
      const refreshed = await refreshToken(currentAuth);
      if (!refreshed) {
        setStatus('error');
        setErrorMsg('Sessão expirada. Faça login novamente.');
        return;
      }
      usedAuth = refreshed;
      authRef.current = usedAuth;
    }

    try {
      setStatus('connecting');
      const fetched = await fetchOrders(usedAuth);

      setApiOrders(prev => {
        const newOrders = fetched.map(o => ({
          ...o,
          isNew: !knownIdsRef.current.has(String(o.id)),
        }));

        newOrders.forEach(o => {
          if (o.isNew) {
            knownIdsRef.current.add(String(o.id));
            setTimeout(() => {
              setApiOrders(cur => cur.map(c => c.id === o.id ? { ...c, isNew: false } : c));
            }, NEW_BADGE_DURATION);
          }
        });

        // Som para novos pedidos
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
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Erro de conexão');
    }
  }, []);

  const retry = useCallback(() => {
    void poll();
  }, [poll]);

  // Mover pedido para PRONTO
  const markReady = useCallback((id: string | number) => {
    const strId = String(id);
    setReadyIds(prev => new Set(prev).add(strId));
    playReadySound();
  }, []);

  // Retornar pedido para EM PRODUÇÃO
  const unmarkReady = useCallback((id: string | number) => {
    const strId = String(id);
    setReadyIds(prev => {
      const copy = new Set(prev);
      copy.delete(strId);
      return copy;
    });
  }, []);

  // Despachar / Entregar pedido (remove da tela)
  const dispatchOrder = useCallback((id: string | number) => {
    const strId = String(id);
    setDispatchedIds(prev => new Set(prev).add(strId));
    setReadyIds(prev => {
      const copy = new Set(prev);
      copy.delete(strId);
      return copy;
    });
    // Se for demo, remover também da lista de demo
    setDemoOrders(cur => cur.filter(o => String(o.id) !== strId));
  }, []);

  // Despachar todos os prontos
  const dispatchAllReady = useCallback(() => {
    setDispatchedIds(prev => {
      const next = new Set(prev);
      readyIds.forEach(id => next.add(id));
      return next;
    });
    setReadyIds(new Set());
    setDemoOrders([]);
  }, [readyIds]);

  // Carregar pedidos demonstrativos
  const loadDemoOrders = useCallback(() => {
    const demos = createDemoOrders();
    setDemoOrders(demos);
    playNotification();
  }, []);

  const clearDemoOrders = useCallback(() => {
    setDemoOrders([]);
  }, []);

  useEffect(() => {
    if (!auth) {
      setStatus('idle');
      return;
    }
    void poll();
    timerRef.current = setInterval(() => void poll(), POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [auth, poll]);

  // Merge de pedidos reais + demos
  const allCombinedOrders = [...demoOrders, ...apiOrders];

  // Filtra em "Em Produção" e "Pronto"
  const inProductionOrders = allCombinedOrders.filter(
    o => !readyIds.has(String(o.id)) && !dispatchedIds.has(String(o.id))
  );

  const readyOrders = allCombinedOrders.filter(
    o => readyIds.has(String(o.id)) && !dispatchedIds.has(String(o.id))
  );

  return {
    inProductionOrders,
    readyOrders,
    allActiveOrdersCount: inProductionOrders.length + readyOrders.length,
    status,
    lastUpdate,
    errorMsg,
    isDemoMode: demoOrders.length > 0,
    markReady,
    unmarkReady,
    dispatchOrder,
    dispatchAllReady,
    loadDemoOrders,
    clearDemoOrders,
    retry,
  };
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
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      osc2.connect(g2);
      g2.connect(ctx.destination);
      osc2.frequency.value = 1174; // D6
      g2.gain.setValueAtTime(0.18, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }, 180);
  } catch { /* ignore */ }
}

function playReadySound() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1046.5; // C6
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch { /* ignore */ }
}
