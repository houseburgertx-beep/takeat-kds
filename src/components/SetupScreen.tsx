import React, { useState } from 'react';
import { LogIn, Key, AlertCircle, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0c0f14' }}>
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            <ShieldCheck className="w-8 h-8 text-blue-500" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Takeat KDS
          </h1>
          <p className="text-xs uppercase tracking-widest mt-1 text-slate-400 font-semibold">
            Kitchen Display System
          </p>
        </div>

        {/* Tab switch */}
        <div
          className="flex p-1 rounded-xl mb-6"
          style={{ background: '#151a23', border: '1px solid rgba(255, 255, 255, 0.08)' }}
        >
          <button
            type="button"
            onClick={() => { setTab('credentials'); setError(''); }}
            className="flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: tab === 'credentials' ? '#2563eb' : 'transparent',
              color: tab === 'credentials' ? '#ffffff' : '#94a3b8',
              boxShadow: tab === 'credentials' ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
            }}
          >
            <LogIn className="w-3.5 h-3.5" /> Login Takeat
          </button>
          <button
            type="button"
            onClick={() => { setTab('api_key'); setError(''); }}
            className="flex-1 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{
              background: tab === 'api_key' ? '#2563eb' : 'transparent',
              color: tab === 'api_key' ? '#ffffff' : '#94a3b8',
              boxShadow: tab === 'api_key' ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
            }}
          >
            <Key className="w-3.5 h-3.5" /> Chave de API
          </button>
        </div>

        {/* Tab 1: E-mail e Senha */}
        {tab === 'credentials' && (
          <form onSubmit={(e) => { void handleCredentialsSubmit(e); }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                E-mail do Restaurante
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="gestor@restaurante.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-slate-500"
                style={{
                  background: '#161c26',
                  border: '1.5px solid rgba(255, 255, 255, 0.08)',
                }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Senha de acesso"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-slate-500"
                style={{
                  background: '#161c26',
                  border: '1.5px solid rgba(255, 255, 255, 0.08)',
                }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2.5"
                style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer text-white"
              style={{
                background: loading ? 'rgba(37, 99, 235, 0.5)' : '#2563eb',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.35)',
              }}
            >
              {loading ? 'Entrando no Restaurante...' : 'Entrar no KDS'}
            </button>

            <p className="text-xs text-center leading-relaxed pt-2 text-slate-500">
              Mesmas credenciais de acesso do Painel Gestor ou PDV Takeat.
            </p>
          </form>
        )}

        {/* Tab 2: API Key */}
        {tab === 'api_key' && (
          <form onSubmit={(e) => { void handleApiKeySubmit(e); }} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                API Key da Takeat
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="tk_live_..."
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-slate-500"
                style={{
                  background: '#161c26',
                  border: '1.5px solid rgba(255, 255, 255, 0.08)',
                }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                ID do Restaurante
              </label>
              <input
                type="number"
                value={restaurantId}
                onChange={e => setRestaurantId(e.target.value)}
                placeholder="Ex: 92142"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all text-white placeholder-slate-500"
                style={{
                  background: '#161c26',
                  border: '1.5px solid rgba(255, 255, 255, 0.08)',
                }}
                onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2.5"
                style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.25)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all cursor-pointer text-white"
              style={{
                background: loading ? 'rgba(37, 99, 235, 0.5)' : '#2563eb',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(37, 99, 235, 0.35)',
              }}
            >
              {loading ? 'Validando Chave...' : 'Conectar com Chave'}
            </button>

            <p className="text-xs text-center leading-relaxed pt-2 text-slate-500">
              Chave disponível no menu Configurações ➔ Integrações do painel.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
