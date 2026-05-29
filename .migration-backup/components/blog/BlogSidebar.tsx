'use client';

import { useMemo } from 'react';
import { CATEGORIES, getCategoryMeta } from '@/lib/categories';
import type { Post } from '@/lib/types';

type Props = {
  posts: Post[];
  filter: string;
  onFilterChange: (cat: string) => void;
  isAdmin: boolean;
};

export default function BlogSidebar({ posts, filter, onFilterChange, isAdmin }: Props) {
  const stats = useMemo(() => {
    const totalWords = posts.reduce((a, p) => a + (p.word_count || 0), 0);
    const cats = new Set(posts.map(p => p.category)).size;
    const today = new Date().toISOString().slice(0, 10);
    const hasToday = posts.some(p => p.created_at.slice(0, 10) === today);

    // Streak calculation
    let streak = 0;
    const daySet = new Set(posts.map(p => p.created_at.slice(0, 10)));
    const d = new Date(); d.setHours(0, 0, 0, 0);
    while (daySet.has(d.toISOString().slice(0, 10))) {
      streak++; d.setDate(d.getDate() - 1);
    }

    return {
      total: posts.length,
      words: totalWords > 999 ? `${(totalWords / 1000).toFixed(1)}k` : String(totalWords),
      cats,
      streak,
    };
  }, [posts]);

  const recent = useMemo(() => [...posts].slice(0, 5), [posts]);

  const catCounts = useMemo(() => {
    const map: Record<string, number> = {};
    posts.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
    return map;
  }, [posts]);

  return (
    <aside className="hidden lg:flex flex-col gap-4" style={{ width: 280, flexShrink: 0 }}>

      {/* Writing Stats */}
      <div className="card p-4" style={{ background: '#161b22' }}>
        <h3 className="font-display font-bold text-sm mb-4 pb-3 border-b"
          style={{ color: '#c9d1d9', borderColor: '#21262d', letterSpacing: '0.5px' }}>
          Writing Stats
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { num: stats.total, label: 'Posts' },
            { num: `${stats.streak}d`, label: 'Streak' },
            { num: stats.words, label: 'Words' },
            { num: stats.cats, label: 'Topics' },
          ].map(({ num, label }) => (
            <div key={label} className="rounded-lg p-3 text-center"
              style={{ background: '#21262d' }}>
              <div className="font-display font-bold text-2xl" style={{ color: '#FF6B1A', lineHeight: 1 }}>{num}</div>
              <div className="text-xs mt-1 font-mono tracking-wide" style={{ color: '#8b949e' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics / Tags */}
      <div className="card p-4" style={{ background: '#161b22' }}>
        <h3 className="font-display font-bold text-sm mb-4 pb-3 border-b"
          style={{ color: '#c9d1d9', borderColor: '#21262d', letterSpacing: '0.5px' }}>
          Topics
        </h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onFilterChange('all')}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
            style={{
              background: filter === 'all' ? 'rgba(255,107,26,.12)' : 'transparent',
              color: filter === 'all' ? '#FF6B1A' : '#8b949e',
            }}
          >
            <span>🗂️ All posts</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded"
              style={{ background: '#21262d', color: '#8b949e' }}>{posts.length}</span>
          </button>
          {CATEGORIES.filter(c => catCounts[c.id]).map(cat => (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left"
              style={{
                background: filter === cat.id ? `${cat.color}18` : 'transparent',
                color: filter === cat.id ? cat.color : '#8b949e',
              }}
            >
              <span>{cat.emoji} {cat.label}</span>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                style={{ background: '#21262d', color: '#8b949e' }}>{catCounts[cat.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      {recent.length > 0 && (
        <div className="card p-4" style={{ background: '#161b22' }}>
          <h3 className="font-display font-bold text-sm mb-4 pb-3 border-b"
            style={{ color: '#c9d1d9', borderColor: '#21262d', letterSpacing: '0.5px' }}>
            Recent Posts
          </h3>
          <div className="flex flex-col gap-3">
            {recent.map(post => {
              const cat = getCategoryMeta(post.category);
              const d = new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              return (
                <a key={post.id} href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-1 pb-3 border-b last:border-0 last:pb-0 transition-opacity hover:opacity-75"
                  style={{ borderColor: '#21262d' }}>
                  <span className="text-sm leading-snug font-medium group-hover:text-orange-400 transition-colors"
                    style={{ color: '#c9d1d9', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.4 }}>
                    {post.title}
                  </span>
                  <span className="text-xs font-mono" style={{ color: '#8b949e' }}>
                    {cat.emoji} {cat.label} · {d}
                  </span>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* About card */}
      <div className="card p-4" style={{ background: '#161b22' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-display font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #FF6B1A, #00D4FF)', color: '#0d1117' }}>
            NM
          </div>
          <div>
            <p className="font-display font-bold text-sm" style={{ color: '#e6edf3' }}>Naveen Meel</p>
            <p className="text-xs" style={{ color: '#8b949e' }}>Network Engineer @ Airtel</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed mb-3" style={{ color: '#8b949e' }}>
          Writing about Networking, Cloud, DevOps, K8s, Terraform, and life on the basketball court.
        </p>
        <a href="https://www.linkedin.com/in/naveenmeel" target="_blank" rel="noopener"
          className="btn btn-outline text-xs py-1.5 px-3 w-full justify-center">
          LinkedIn ↗
        </a>
      </div>
    </aside>
  );
}
