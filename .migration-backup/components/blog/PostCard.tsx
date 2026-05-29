'use client';

import Link from 'next/link';
import { getCategoryMeta } from '@/lib/categories';
import type { Post } from '@/lib/types';

type Props = {
  post: Post;
  isAdmin: boolean;
  onEdit: (post: Post) => void;
  onDelete: (slug: string) => void;
  onTogglePublish: (post: Post) => void;
};

export default function PostCard({ post, isAdmin, onEdit, onDelete, onTogglePublish }: Props) {
  const cat = getCategoryMeta(post.category);
  const dateStr = new Date(post.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const readTime = post.read_time ?? Math.max(1, Math.ceil((post.word_count ?? 500) / 200));

  return (
    <div
      className="card group relative"
      style={{ background: '#161b22', overflow: 'hidden', transition: 'all .25s' }}
    >
      {/* Category accent line */}
      <div style={{ height: 2, background: `linear-gradient(to right, ${cat.color}, transparent)` }} />

      <div className="p-5 sm:p-6">
        <div className="flex gap-4 items-start">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="badge text-xs"
                style={{
                  background: `${cat.color}18`,
                  color: cat.color,
                  border: `1px solid ${cat.color}40`,
                  padding: '3px 10px',
                  borderRadius: 20,
                }}
              >
                {cat.emoji} {cat.label}
              </span>
              <span className="text-xs font-mono" style={{ color: '#8b949e' }}>{dateStr}</span>
              <span className="text-xs font-mono" style={{ color: '#8b949e' }}>· {readTime} min read</span>
              {!post.published && (
                <span className="badge text-xs" style={{ background: 'rgba(248,81,73,.12)', color: '#f85149', border: '1px solid rgba(248,81,73,.3)', padding: '2px 8px', borderRadius: 4 }}>
                  Draft
                </span>
              )}
            </div>

            {/* Title */}
            <Link href={`/blog/${post.slug}`}>
              <h2
                className="font-display font-bold mb-2 leading-snug transition-colors group-hover:text-orange-400"
                style={{ fontSize: '1.1rem', color: '#e6edf3' }}
              >
                {post.title}
              </h2>
            </Link>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm leading-relaxed line-clamp-2" style={{ color: '#8b949e' }}>
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: '#21262d', color: '#8b949e' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Emoji thumbnail */}
          <div
            className="hidden sm:flex flex-shrink-0 items-center justify-center rounded-lg text-4xl"
            style={{ width: 88, height: 72, background: '#21262d', border: '1px solid #30363d' }}
          >
            {post.cover_emoji || cat.emoji}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3"
          style={{ borderTop: '1px solid #21262d' }}>
          <div className="flex items-center gap-4 text-xs font-mono" style={{ color: '#8b949e' }}>
            <span>📖 {readTime} min</span>
            {post.word_count && <span>📝 {post.word_count} words</span>}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/blog/${post.slug}`}
              className="text-xs font-mono transition-colors"
              style={{ color: '#FF6B1A' }}
            >
              Read →
            </Link>

            {/* Admin actions */}
            {isAdmin && (
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ml-3">
                <button
                  onClick={() => onEdit(post)}
                  title="Edit"
                  className="p-1.5 rounded text-xs transition-all"
                  style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF6B1A', e.currentTarget.style.color = '#FF6B1A')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d', e.currentTarget.style.color = '#8b949e')}
                >✎</button>
                <button
                  onClick={() => onTogglePublish(post)}
                  title={post.published ? 'Unpublish' : 'Publish'}
                  className="p-1.5 rounded text-xs transition-all"
                  style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff', e.currentTarget.style.color = '#58a6ff')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d', e.currentTarget.style.color = '#8b949e')}
                >{post.published ? '⏸' : '▶'}</button>
                <button
                  onClick={() => onDelete(post.slug)}
                  title="Delete"
                  className="p-1.5 rounded text-xs transition-all"
                  style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#f85149', e.currentTarget.style.color = '#f85149')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d', e.currentTarget.style.color = '#8b949e')}
                >🗑</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
