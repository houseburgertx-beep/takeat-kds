import React, { useState } from 'react';
import { exchangeApiKey, type StoredAuth } from '../api/takeatApi';

interface Props {
  onReady: (auth: StoredAuth) => void;
}

export function SetupScreen({ onReady }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    const rid = parseInt(restaurantId, 10);
    if (!apiKey.trim() || isNaN(rid) || rid <= 0) {
      setError('Preencha a API Key e o ID do restaurante corretamente.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const auth = await exchangeApiKey(apiKey.trim(), rid);
      onReady(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="4" y="8" width="32" height="4" rx="2" fill="white"/>
              <rect x="4" y="18" width="24" height="4" rx="2" fill="white" opacity="0.8"/>
              <rect x="4" y="28" width="28" height="4" rx="2" fill="white" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Takeat KDS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Kitchen Display System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { void handleConnect(e); }} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              API Key da Takeat
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="tk_live_..."
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              ID do Restaurante
            </label>
            <input
              type="number"
              value={restaurantId}
              onChange={e => setRestaurantId(e.target.value)}
              placeholder="Ex: 12345"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-card)',
                border: '1.5px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
              onFocus={e => (e.target.style.borderColor = '#3b82f6')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
            }}
          >
            {loading ? 'Conectando...' : 'Conectar KDS →'}
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
          Configure sua API Key no painel da Takeat em Configurações → Integrações
        </p>
      </div>
    </div>
  );
}
