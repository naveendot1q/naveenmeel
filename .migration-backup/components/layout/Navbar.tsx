'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Props = {
  isAdmin: boolean;
  onNewPost: () => void;
  onAuthChange: (v: boolean) => void;
};

export default function Navbar({ isAdmin, onNewPost, onAuthChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    onAuthChange(false);
    router.refresh();
  }

  return (
    <nav className="nav-glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display font-bold text-xl" style={{ color: '#FF6B1A', letterSpacing: '-0.02em' }}>
            NM<span style={{ color: '#00D4FF' }}>.</span>DEV
          </span>
          <span className="hidden sm:block text-xs font-mono px-2 py-0.5 rounded"
            style={{ background: 'rgba(255,107,26,.12)', color: '#FF6B1A', border: '1px solid rgba(255,107,26,.25)' }}>
            Blog
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/"
            className="text-sm transition-colors hover:text-white"
            style={{ color: '#8b949e', fontFamily: 'DM Sans, sans-serif' }}>
            ← Portfolio
          </Link>
          {isAdmin ? (
            <>
              <button onClick={onNewPost} className="btn btn-primary text-sm py-2 px-4">
                ✍️ Write Post
              </button>
              <button onClick={handleLogout} className="btn btn-outline text-sm py-2 px-4">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-outline text-sm py-2 px-4">
              Admin
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ background: '#21262d', color: '#8b949e' }}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen
              ? <path d="M18 6L6 18M6 6l12 12"/>
              : <><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-4 flex flex-col gap-3"
          style={{ background: '#161b22', borderColor: '#21262d' }}>
          <Link href="/"
            className="text-sm py-2" style={{ color: '#8b949e' }}
            onClick={() => setMenuOpen(false)}>
            ← Portfolio
          </Link>
          {isAdmin ? (
            <>
              <button onClick={() => { onNewPost(); setMenuOpen(false); }}
                className="btn btn-primary justify-center">✍️ Write Post</button>
              <button onClick={handleLogout} className="btn btn-outline justify-center">Sign Out</button>
            </>
          ) : (
            <Link href="/login" className="btn btn-outline justify-center" onClick={() => setMenuOpen(false)}>
              Admin Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
