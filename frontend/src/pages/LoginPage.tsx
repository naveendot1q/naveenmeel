import { useState, FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/lib/theme';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setLocation] = useLocation();
  const { theme, toggle } = useTheme();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }
      setLocation('/blog');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'var(--bg)', position: 'relative' }}>
      {/* Theme toggle */}
      <button onClick={toggle} className="theme-toggle" style={{ position: 'absolute', top: 20, right: 20 }} title="Toggle theme">
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/">
            <img src="/naveen.jpg" alt="Naveen Meel" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', margin: '0 auto 16px' }} />
          </Link>
          <h1 style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--fg)', letterSpacing: '-0.02em' }}>Admin Login</h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 4 }}>Sign in to manage your blog</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="your@email.com" required autoComplete="email" autoFocus />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="form-input" placeholder="••••••••" required autoComplete="current-password" />
            </div>
            {error && (
              <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', fontSize: '0.82rem' }}>{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--muted)' }}>
          <Link href="/blog" style={{ color: 'var(--muted)' }}>← Back to blog</Link>
        </p>
      </div>
    </div>
  );
}
