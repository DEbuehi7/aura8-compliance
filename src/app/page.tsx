'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

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

      // Store session token
      localStorage.setItem('compliance_session', data.token);
      localStorage.setItem('compliance_user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-[#ec4899] tracking-widest uppercase">
              Aura8 Compliance
            </div>
            <h1 className="text-2xl font-bold text-white">Review Login</h1>
            <p className="text-sm text-gray-400">
              Authorized personnel only
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ccbill_auditor"
                className="w-full px-4 py-2 bg-[#1a1a1d] border border-[#3f3f46] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 bg-[#1a1a1d] border border-[#3f3f46] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899]"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#ec4899] text-white font-semibold rounded-lg hover:bg-[#ec4899]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a2e] text-center text-xs text-gray-500">
            <p>Authorized Visa/Mastercard compliance personnel only.</p>
            <p className="mt-1">All access is logged and audited.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
