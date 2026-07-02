'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/compliance-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid credentials')
        return
      }

      localStorage.setItem('compliance_token', data.token)
      localStorage.setItem('compliance_user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
        }}
      >
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ec4899, #be185d)',
              marginBottom: '1rem',
              fontSize: '1.75rem',
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#f5f5f5',
              margin: '0 0 0.5rem',
            }}
          >
            Aura8 Compliance
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.9rem', margin: 0 }}>
            CCBill Audit Review Portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: '#141414',
            border: '1px solid #2a2a2a',
            borderRadius: '16px',
            padding: '2rem',
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#a1a1aa',
                  marginBottom: '0.5rem',
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#1e1e1e',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#f5f5f5',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#ec4899')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: '#a1a1aa',
                  marginBottom: '0.5rem',
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#1e1e1e',
                  border: '1px solid #2a2a2a',
                  borderRadius: '8px',
                  color: '#f5f5f5',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#ec4899')}
                onBlur={(e) => (e.target.style.borderColor = '#2a2a2a')}
              />
            </div>

            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1.25rem',
                  color: '#f87171',
                  fontSize: '0.875rem',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading
                  ? '#6b2146'
                  : 'linear-gradient(135deg, #ec4899, #be185d)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: '#3f3f46',
            fontSize: '0.8rem',
            marginTop: '1.5rem',
          }}
        >
          Authorized personnel only · Aura8 © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
