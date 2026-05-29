import { Link } from 'wouter';
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
  const dateStr = new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const readTime = post.read_time ?? Math.max(1, Math.ceil((post.word_count ?? 500) / 200));

  return (
    <div className="card card-hover" style={{ overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: cat.color, opacity: 0.6 }} />
      <div style={{ padding: '20px 22px' }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Meta row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em', background: `${cat.color}18`, color: cat.color, border: `1px solid ${cat.color}40`, padding: '2px 9px', borderRadius: 20 }}>
                {cat.emoji} {cat.label}
              </span>
              {!post.published && (
                <span style={{ fontSize: '0.65rem', fontWeight: 700, background: 'rgba(248,113,113,0.1)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.3)', padding: '2px 8px', borderRadius: 6 }}>Draft</span>
              )}
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>{dateStr}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'monospace' }}>· {readTime} min</span>
            </div>

            {/* Title */}
            <Link href={`/blog/${post.slug}`}>
              <h2 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--fg)', lineHeight: 1.4, marginBottom: 8, transition: 'color 0.15s', letterSpacing: '-0.01em' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg)')}>
                {post.title}
              </h2>
            </Link>

            {/* Excerpt */}
            {post.excerpt && (
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 12 }} className="line-clamp-2">
                {post.excerpt}
              </p>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {post.tags.slice(0, 4).map(tag => (
                  <span key={tag} style={{ fontSize: '0.68rem', fontFamily: 'monospace', background: 'var(--bg3)', color: 'var(--muted)', padding: '2px 8px', borderRadius: 12, border: '1px solid var(--border)' }}>#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Emoji thumb */}
          <div style={{ width: 72, height: 64, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
            {post.cover_emoji || cat.emoji}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)', marginTop: 4 }}>
          <Link href={`/blog/${post.slug}`} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)' }}>
            Read →
          </Link>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: '✏️', title: 'Edit', onClick: () => onEdit(post), hoverColor: 'var(--accent)' },
                { label: post.published ? '⏸' : '▶', title: post.published ? 'Unpublish' : 'Publish', onClick: () => onTogglePublish(post), hoverColor: 'var(--blue)' },
                { label: '🗑', title: 'Delete', onClick: () => { if (confirm(`Delete "${post.title}"?`)) onDelete(post.slug); }, hoverColor: 'var(--red)' },
              ].map(btn => (
                <button key={btn.label} onClick={btn.onClick} title={btn.title}
                  style={{ width: 30, height: 30, borderRadius: 6, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--fg2)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
                  onMouseEnter={e => { (e.currentTarget.style.borderColor = btn.hoverColor); (e.currentTarget.style.background = 'var(--accent-dim)'); }}
                  onMouseLeave={e => { (e.currentTarget.style.borderColor = 'var(--border)'); (e.currentTarget.style.background = 'var(--bg3)'); }}>
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
