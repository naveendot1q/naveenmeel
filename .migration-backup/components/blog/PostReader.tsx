'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getCategoryMeta } from '@/lib/categories';

type Post = {
  id: string; title: string; slug: string;
  excerpt: string | null; content: string; category: string;
  tags: string[] | null; cover_emoji: string | null;
  created_at: string; updated_at: string;
  read_time: number | null; word_count: number | null;
};

export default function PostReader({ post }: { post: Post }) {
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState('');
  const cat = getCategoryMeta(post.category);
  const dateStr = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const readTime = post.read_time ?? Math.max(1, Math.ceil((post.word_count ?? 500) / 200));

  // Render markdown client-side (also applies hljs)
  useEffect(() => {
    import('marked').then(async ({ marked }) => {
      marked.setOptions({ gfm: true, breaks: true });
      const rendered = await marked.parse(post.content);
      setHtml(rendered);
    });
  }, [post.content]);

  // Syntax highlight after HTML renders
  useEffect(() => {
    if (!html) return;
    import('highlight.js').then(({ default: hljs }) => {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block as HTMLElement);
      });
    });
  }, [html]);

  // Reading progress
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight) * 100;
      setProgress(Math.min(100, pct));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Progress bar */}
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      {/* Sticky nav */}
      <nav className="nav-glass sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/"
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: '#8b949e', fontFamily: 'DM Sans, sans-serif' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Blog
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-mono"
              style={{ color: '#8b949e' }}>
              {progress.toFixed(0)}% read
            </span>
            <button
              onClick={() => navigator.share?.({ title: post.title, url: window.location.href })}
              className="btn btn-outline text-xs py-1.5 px-3"
            >
              Share ↗
            </button>
          </div>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-24">
        {/* Header */}
        <header className="mb-10">
          {/* Cover emoji */}
          <div className="text-6xl mb-6">{post.cover_emoji || cat.emoji}</div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <span
              className="badge"
              style={{
                background: `${cat.color}18`, color: cat.color,
                border: `1px solid ${cat.color}40`, padding: '4px 12px', borderRadius: 20,
                fontSize: '0.75rem', fontWeight: 700,
              }}
            >
              {cat.emoji} {cat.label}
            </span>
            <span className="text-sm font-mono" style={{ color: '#8b949e' }}>{dateStr}</span>
            <span className="text-sm font-mono" style={{ color: '#8b949e' }}>· {readTime} min read</span>
            {post.word_count && (
              <span className="text-sm font-mono" style={{ color: '#8b949e' }}>· {post.word_count} words</span>
            )}
          </div>

          {/* Title */}
          <h1
            className="font-display font-bold leading-tight mb-4"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', color: '#e6edf3', letterSpacing: '-0.02em' }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-lg leading-relaxed mb-6" style={{ color: '#8b949e' }}>
              {post.excerpt}
            </p>
          )}

          {/* Author bar */}
          <div className="flex items-center gap-3 py-4 border-y"
            style={{ borderColor: '#21262d' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF6B1A, #00D4FF)', color: '#0d1117' }}>
              NM
            </div>
            <div>
              <p className="font-display font-bold text-sm" style={{ color: '#e6edf3' }}>Naveen Meel</p>
              <p className="text-xs" style={{ color: '#8b949e' }}>Network Engineer @ Airtel · {dateStr}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: html || `<p style="color:#8b949e">Loading...</p>` }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t" style={{ borderColor: '#21262d' }}>
            <span className="text-xs font-mono" style={{ color: '#8b949e' }}>Tags:</span>
            {post.tags.map(t => (
              <Link key={t} href={`/?search=${t}`}
                className="text-xs font-mono px-2 py-1 rounded transition-colors"
                style={{ background: '#21262d', color: '#8b949e' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#FF6B1A')}
                onMouseLeave={e => (e.currentTarget.style.color = '#8b949e')}>
                #{t}
              </Link>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-12 pt-8 border-t" style={{ borderColor: '#21262d' }}>
          <Link href="/"
            className="btn btn-outline"
            style={{ display: 'inline-flex' }}>
            ← Back to all posts
          </Link>
        </div>
      </article>
    </div>
  );
}
