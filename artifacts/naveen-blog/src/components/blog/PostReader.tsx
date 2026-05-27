import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { getCategoryMeta } from '@/lib/categories';
import { useTheme } from '@/lib/theme';

type Post = {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; category: string; tags: string[] | null;
  cover_emoji: string | null; created_at: string; updated_at: string;
  read_time: number | null; word_count: number | null;
};

export default function PostReader({ post }: { post: Post }) {
  const [progress, setProgress] = useState(0);
  const [html, setHtml] = useState('');
  const { theme, toggle } = useTheme();
  const cat = getCategoryMeta(post.category);
  const dateStr = new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const readTime = post.read_time ?? Math.max(1, Math.ceil((post.word_count ?? 500) / 200));

  useEffect(() => {
    import('marked').then(({ marked }) => {
      const result = marked.parse(post.content);
      if (result instanceof Promise) result.then(h => setHtml(h));
      else setHtml(result as string);
    });
  }, [post.content]);

  useEffect(() => {
    if (!html) return;
    import('highlight.js').then(({ default: hljs }) => {
      document.querySelectorAll('pre code').forEach(b => hljs.highlightElement(b as HTMLElement));
    });
  }, [html]);

  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      setProgress(Math.min(100, el.scrollTop / (el.scrollHeight - el.clientHeight) * 100));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      <nav className="nav-glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/blog" style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.82rem', color: 'var(--muted)', transition: 'color 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--fg)')}
            onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = 'var(--muted)')}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            All posts
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--muted)' }}>{Math.round(progress)}%</span>
            <button onClick={toggle} className="theme-toggle" title="Toggle theme">{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>
        </div>
      </nav>

      <article style={{ maxWidth: 740, margin: '0 auto', padding: '48px 24px 96px' }}>
        <header style={{ marginBottom: 48 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>{post.cover_emoji || cat.emoji}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em', background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}40`, padding: '3px 10px', borderRadius: 20 }}>
              {cat.emoji} {cat.label}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{dateStr}</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>· {readTime} min read</span>
            {post.word_count && <span style={{ fontSize: '0.78rem', color: 'var(--muted)', fontFamily: 'monospace' }}>· {post.word_count} words</span>}
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', color: 'var(--fg)', lineHeight: 1.25, letterSpacing: '-0.03em', marginBottom: 16 }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ fontSize: '1.05rem', color: 'var(--fg2)', lineHeight: 1.7, marginBottom: 24 }}>{post.excerpt}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <img src="/naveen.jpg" alt="Naveen Meel" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--fg)' }}>Naveen Meel</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Network Engineer @ Airtel · {dateStr}</p>
            </div>
          </div>
        </header>

        <div className="prose-blog" dangerouslySetInnerHTML={{ __html: html || '<p style="color:var(--muted)">Loading…</p>' }} />

        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>Tags:</span>
            {post.tags.map(t => (
              <span key={t} style={{ fontSize: '0.72rem', fontFamily: 'monospace', background: 'var(--bg3)', color: 'var(--fg2)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>#{t}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
          <Link href="/blog" className="btn btn-ghost">← Back to all posts</Link>
        </div>
      </article>
    </div>
  );
}
