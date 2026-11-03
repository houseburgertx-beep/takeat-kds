import { useState, useEffect } from 'react';

export interface TimerState {
  elapsedMs: number;
  label: string;
  urgency: 'ok' | 'warn' | 'danger';
  progress: number; // 0-100
}

const WARN_MS = 8 * 60 * 1000;    // 8 minutos
const DANGER_MS = 15 * 60 * 1000; // 15 minutos

export function useTimer(createdAt: string): TimerState {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const start = new Date(createdAt).getTime();
  const elapsedMs = now - start;
  const mins = Math.floor(elapsedMs / 60_000);
  const secs = Math.floor((elapsedMs % 60_000) / 1000);
  const label = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  let urgency: TimerState['urgency'] = 'ok';
  if (elapsedMs >= DANGER_MS) urgency = 'danger';
  else if (elapsedMs >= WARN_MS) urgency = 'warn';

  const progress = Math.min(100, (elapsedMs / DANGER_MS) * 100);

  return { elapsedMs, label, urgency, progress };
}
