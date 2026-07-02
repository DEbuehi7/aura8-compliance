'use client';

import { useState, FormEvent, CSSProperties } from 'react';
import { useRouter } from 'next/navigation';

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
    padding: '1rem',
  } as CSSProperties,
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#121214',
    border: '1px solid #2a2a2e',
    borderRadius: '8px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  } as CSSProperties,
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as CSSProperties,
  logo: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#ec4899',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  } as CSSProperties,
  title: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  } as CSSProperties,
  subtitle: {
    fontSize: '0.875rem',
    color: '#999999',
    margin: 0,
  } as CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  } as CSSProperties,
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  } as CSSProperties,
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#cccccc',
  } as CSSProperties,
  input: {
    padding: '0.5rem 1rem',
    background: '#1a1a1d',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  } as CSSProperties,
  error: {
    padding: '0.75rem',
    background: 'rgba(255, 0, 0, 0.1)',
    border: '1px solid rgba(255, 0, 0, 0.3)',
    borderRadius: '4px',
    color: '#ff6b6b',
    fontSize: '0.875rem',
  } as CSSProperties,
  button: {
    padding: '0.5rem 1rem',
    background: '#ec4899',
    color: '#ffffff',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontSize: '1rem',
  } as CSSProperties,
  footer: {
    paddingTop: '1rem',
    borderTop: '1px solid #2a2a2e',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: '#808080',
  } as CSSProperties,
  footerP: {
    margin: '0.25rem 0',
  } as CSSProperties,
};

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('compliance_session', data.token);
      localStorage.setItem('compliance_user', JSON.stringify(data.user));

      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>Aura8 Compliance</div>
          <h1 style={styles.title}>Review Login</h1>
          <p style={styles.subtitle}>Authorized personnel only</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ccbill_auditor"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerP}>Authorized Visa/Mastercard compliance personnel only.</p>
          <p style={styles.footerP}>All access is logged and audited.</p>
        </div>
      </div>
    </div>
  );
}
