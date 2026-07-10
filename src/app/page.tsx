'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/compliance-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        return;
      }

      localStorage.setItem('compliance_session', data.token);
      localStorage.setItem('compliance_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          background: '#121214',
          border: '1px solid #2a2a2e',
          borderRadius: '12px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '380px',
        }}
      >
        <h1
          style={{
            color: '#ffffff',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            margin: '0 0 0.25rem 0',
          }}
        >
          Aura8 Compliance
        </h1>
        <p style={{ color: '#808080', fontSize: '0.875rem', margin: '0 0 2rem 0' }}>
          CCBill Review Portal
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label
              htmlFor="username"
              style={{ display: 'block', color: '#cccccc', fontSize: '0.875rem', marginBottom: '0.5rem' }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                background: '#1e1e21',
                border: '1px solid #2a2a2e',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', color: '#cccccc', fontSize: '0.875rem', marginBottom: '0.5rem' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.625rem 0.75rem',
                background: '#1e1e21',
                border: '1px solid #2a2a2e',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                padding: '0.5rem 0.75rem',
                background: '#1f1010',
                borderRadius: '6px',
                border: '1px solid #3a1010',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.625rem',
              background: loading ? '#2a2a2e' : '#ec4899',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
