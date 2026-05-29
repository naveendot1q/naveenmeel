import { useState } from 'react';
import { Link } from 'wouter';
import { useTheme } from '@/lib/theme';

type Props = {
  isAdmin: boolean;
  onNewPost: () => void;
  onAuthChange: (v: boolean) => void;
};

export default function Navbar({ isAdmin, onNewPost, onAuthChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggle } = useTheme();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    onAuthChange(false);
  }

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', color: 'var(--fg)' }}>
            Naveen<span style={{ color: 'var(--accent)' }}>.</span>dev
          </span>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)', padding: '2px 8px', borderRadius: 20 }}>
            Blog
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/" style={{ display: 'none', fontSize: '0.82rem', color: 'var(--muted)', padding: '5px 10px', borderRadius: 6, transition: 'color 0.15s' }} className="desktop-only">
            ← Portfolio
          </Link>
          <button onClick={toggle} className="theme-toggle" title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {isAdmin ? (
            <>
              <button onClick={onNewPost} className="btn btn-primary" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>✍️ New Post</button>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: '0.8rem', padding: '7px 14px' }}>Admin</Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--fg2)', cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center' }}
            className="mobile-menu-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ background: 'var(--bg2)', borderTop: '1px solid var(--border)', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/" style={{ fontSize: '0.9rem', color: 'var(--fg2)', padding: '8px 0' }} onClick={() => setMenuOpen(false)}>← Portfolio</Link>
          {isAdmin ? (
            <>
              <button onClick={() => { onNewPost(); setMenuOpen(false); }} className="btn btn-primary" style={{ justifyContent: 'center' }}>✍️ New Post</button>
              <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: 'center' }}>Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Admin Login</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-only { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 641px) {
          .desktop-only { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
