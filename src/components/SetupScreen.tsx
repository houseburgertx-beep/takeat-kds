import React, { useState } from 'react';
import { loginWithCredentials, exchangeApiKey, type StoredAuth } from '../api/takeatApi';

interface Props {
  onReady: (auth: StoredAuth) => void;
}

export function SetupScreen({ onReady }: Props) {
  const [tab, setTab] = useState<'credentials' | 'api_key'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Preencha seu e-mail e senha da Takeat.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const auth = await loginWithCredentials(email.trim(), password);
      onReady(auth);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-xl shadow-blue-500/20"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}
          >
            <span style={{ fontSize: 36 }}>🍳</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Takeat KDS
          </h1>
          <p className="text-xs uppercase tracking-widest mt-1.5 font-semibold" style={{ color: 'var(--text-muted)' }}>
            Kitchen Display System
          </p>
        </div>

        {/* Tab switch */}
        <div
          className="flex p-1 rounded-2xl mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
        >
          <button
            type="button"
            onClick={() => { setTab('credentials'); setError(''); }}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: tab === 'credentials' ? '#3b82f6' : 'transparent',
              color: tab === 'credentials' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: tab === 'credentials' ? '0 2px 10px rgba(59,130,246,0.3)' : 'none',
            }}
          >
            <span>🔐</span> Login Takeat
          </button>
          <button
            type="button"
            onClick={() => { setTab('api_key'); setError(''); }}
            className="flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: tab === 'api_key' ? '#3b82f6' : 'transparent',
              color: tab === 'api_key' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: tab === 'api_key' ? '0 2px 10px rgba(59,130,246,0.3)' : 'none',
            }}
          >
            <span>⚡</span> API Key
          </button>
        </div>

        {/* Tab 1: E-mail e Senha */}
        {tab === 'credentials' && (
          <form onSubmit={(e) => { void handleCredentialsSubmit(e); }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                E-mail da Conta Takeat
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="gestor@restaurante.com"
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha da Takeat"
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-card)',
                  border: '1.5px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-medium leading-relaxed"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer"
              style={{
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              }}
            >
              {loading ? 'Entrando no Restaurante...' : 'Entrar no KDS →'}
            </button>

            <p className="text-xs text-center leading-relaxed pt-2" style={{ color: 'var(--text-muted)' }}>
              Use os mesmos dados de acesso que você usa para entrar no <b>Painel Gestor</b> ou no <b>PDV Takeat</b>.
            </p>
          </form>
        )}

        {/* Tab 2: API Key */}
        {tab === 'api_key' && (
          <form onSubmit={(e) => { void handleApiKeySubmit(e); }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                API Key da Takeat
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="tk_live_..."
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
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
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                ID do Restaurante
              </label>
              <input
                type="number"
                value={restaurantId}
                onChange={e => setRestaurantId(e.target.value)}
                placeholder="Ex: 92142"
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
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
              <div
                className="px-4 py-3 rounded-xl text-xs font-medium leading-relaxed"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
              >
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer"
              style={{
                background: loading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              }}
            >
              {loading ? 'Validando Chave...' : 'Conectar com API Key →'}
            </button>

            <p className="text-xs text-center leading-relaxed pt-2" style={{ color: 'var(--text-muted)' }}>
              Configure sua API Key no painel em <b>Configurações → Integrações</b>.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
