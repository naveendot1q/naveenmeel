import { useMemo } from 'react';
import { CATEGORIES, getCategoryMeta } from '@/lib/categories';
import type { Post } from '@/lib/types';

type Props = { posts: Post[]; filter: string; onFilterChange: (cat: string) => void; isAdmin: boolean; };

export default function BlogSidebar({ posts, filter, onFilterChange }: Props) {
  const stats = useMemo(() => {
    const words = posts.reduce((a, p) => a + (p.word_count || 0), 0);
    const cats = new Set(posts.map(p => p.category)).size;
    let streak = 0;
    const daySet = new Set(posts.map(p => p.created_at.slice(0, 10)));
    const d = new Date(); d.setHours(0, 0, 0, 0);
    while (daySet.has(d.toISOString().slice(0, 10))) { streak++; d.setDate(d.getDate() - 1); }
    return { total: posts.length, words: words > 999 ? `${(words / 1000).toFixed(1)}k` : String(words), cats, streak };
  }, [posts]);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    posts.forEach(p => { m[p.category] = (m[p.category] || 0) + 1; });
    return m;
  }, [posts]);

  const recent = posts.slice(0, 5);

  return (
    <aside style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div className="card" style={{ padding: 18 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Stats</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[{ n: stats.total, l: 'Posts' }, { n: `${stats.streak}d`, l: 'Streak' }, { n: stats.words, l: 'Words' }, { n: stats.cats, l: 'Topics' }].map(({ n, l }) => (
            <div key={l} style={{ background: 'var(--bg3)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: 'var(--accent)', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics */}
      <div className="card" style={{ padding: 18 }}>
        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Topics</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => onFilterChange('all')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer', border: 'none', background: filter === 'all' ? 'var(--accent-dim)' : 'transparent', color: filter === 'all' ? 'var(--accent)' : 'var(--fg2)', fontWeight: filter === 'all' ? 700 : 400, transition: 'all 0.12s', textAlign: 'left' }}>
            <span>All posts</span>
            <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', background: 'var(--bg3)', padding: '1px 7px', borderRadius: 10, color: 'var(--muted)' }}>{posts.length}</span>
          </button>
          {CATEGORIES.filter(c => catCounts[c.id]).map(cat => (
            <button key={cat.id} onClick={() => onFilterChange(cat.id)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, fontSize: '0.82rem', cursor: 'pointer', border: 'none', background: filter === cat.id ? `${cat.color}14` : 'transparent', color: filter === cat.id ? cat.color : 'var(--fg2)', fontWeight: filter === cat.id ? 700 : 400, transition: 'all 0.12s', textAlign: 'left' }}>
              <span>{cat.emoji} {cat.label}</span>
              <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', background: 'var(--bg3)', padding: '1px 7px', borderRadius: 10, color: 'var(--muted)' }}>{catCounts[cat.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent */}
      {recent.length > 0 && (
        <div className="card" style={{ padding: 18 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 14 }}>Recent</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recent.map((post, i) => {
              const cat = getCategoryMeta(post.category);
              const d = new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return (
                <a key={post.id} href={`/blog/${post.slug}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 0', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none', transition: 'opacity 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--fg)', lineHeight: 1.4 }}>{post.title}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{cat.emoji} {cat.label} · {d}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* About */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <img src="/naveen.jpg" alt="Naveen Meel" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)', flexShrink: 0 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--fg)' }}>Naveen Meel</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Network Engineer @ Airtel</p>
          </div>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }}>
          Writing about Networking, Cloud, DevOps, K8s, Terraform — and basketball.
        </p>
        <a href="https://www.linkedin.com/in/naveenmeel" target="_blank" rel="noopener" className="btn btn-ghost" style={{ fontSize: '0.75rem', padding: '6px 14px', width: '100%' }}>
          LinkedIn ↗
        </a>
      </div>
    </aside>
  );
}
