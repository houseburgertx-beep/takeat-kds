import React, { useState } from 'react';
import { LogIn, Key, AlertCircle, ShieldCheck, PlayCircle } from 'lucide-react';
import { loginWithCredentials, exchangeApiKey, type StoredAuth } from '../api/takeatApi';

interface Props {
  onReady: (auth: StoredAuth) => void;
}

export function SetupScreen({ onReady }: Props) {
  const [tab, setTab] = useState<'credentials' | 'api_key'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [restaurantId, setRestaurantId] = useState('92142'); // ID do restaurante House Food Park pré-definido
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

  const handleDemoAccess = () => {
    const demoAuth: StoredAuth = {
      authMethod: 'credentials',
      accessToken: 'demo_token',
      expiresAt: Date.now() + 86400000,
      restaurantId: 92142,
      restaurantName: 'House Food Park (Modo Demo)',
      email: 'demo@housefoodpark.com',
    };
    onReady(demoAuth);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        padding: '24px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header do KDS */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#2563eb',
              color: '#ffffff',
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
              marginBottom: '16px',
            }}
          >
            <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.2} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Takeat KDS
          </h1>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '6px' }}>
            Kitchen Display System • House Food Park
          </p>
        </div>

        {/* Alternador de método de entrada */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('credentials'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: tab === 'credentials' ? '#ffffff' : 'transparent',
              color: tab === 'credentials' ? '#0f172a' : '#64748b',
              boxShadow: tab === 'credentials' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <LogIn className="w-4 h-4 text-blue-600" />
            <span>Login Takeat</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('api_key'); setError(''); }}
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              background: tab === 'api_key' ? '#ffffff' : 'transparent',
              color: tab === 'api_key' ? '#0f172a' : '#64748b',
              boxShadow: tab === 'api_key' ? '0 2px 8px rgba(0, 0, 0, 0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <Key className="w-4 h-4 text-blue-600" />
            <span>Chave de API</span>
          </button>
        </div>

        {/* Tab 1: E-mail e Senha Takeat */}
        {tab === 'credentials' && (
          <form onSubmit={(e) => { void handleCredentialsSubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '6px' }}>
                E-mail do Restaurante
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="gestor@restaurante.com"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sua senha da Takeat"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                transition: 'background-color 0.15s ease',
              }}
            >
              {loading ? 'Entrando no Restaurante...' : 'Entrar no KDS'}
            </button>

            <p style={{ fontSize: '11px', textAlign: 'center', color: '#64748b', margin: '4px 0 0', lineHeight: 1.4 }}>
              Utiliza a mesma conta com permissão de operador ou gestor na Takeat.
            </p>
          </form>
        )}

        {/* Tab 2: Chave de API */}
        {tab === 'api_key' && (
          <form onSubmit={(e) => { void handleApiKeySubmit(e); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '6px' }}>
                Chave de API Takeat
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Insira sua API Key"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#475569', letterSpacing: '0.04em', marginBottom: '6px' }}>
                ID do Restaurante
              </label>
              <input
                type="number"
                value={restaurantId}
                onChange={e => setRestaurantId(e.target.value)}
                placeholder="92142"
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  color: '#0f172a',
                  outline: 'none',
                  background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#2563eb')}
                onBlur={e => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: loading ? '#93c5fd' : '#2563eb',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              }}
            >
              {loading ? 'Conectando...' : 'Conectar via API'}
            </button>
          </form>
        )}

        {/* Separador e Botão de Demonstração Rápida */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <button
            type="button"
            onClick={handleDemoAccess}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              color: '#334155',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
          >
            <PlayCircle className="w-4 h-4 text-emerald-600" />
            <span>Visualizar Demonstração com Pedidos Ativos</span>
          </button>
        </div>
      </div>
    </div>
  );
}
