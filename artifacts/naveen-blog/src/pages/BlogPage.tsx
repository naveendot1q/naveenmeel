import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import PostCard from '@/components/blog/PostCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import EditorModal from '@/components/blog/EditorModal';
import HeatmapChart from '@/components/blog/HeatmapChart';
import { CATEGORIES } from '@/lib/categories';
import type { Post } from '@/lib/types';

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[0,1,2].map(i => (
        <div key={i} className="card" style={{ padding: 22, opacity: 1 - i * 0.2 }}>
          <div style={{ height: 12, borderRadius: 6, background: 'var(--bg3)', width: '60%', marginBottom: 12 }} />
          <div style={{ height: 10, borderRadius: 6, background: 'var(--bg3)', width: '90%', marginBottom: 8 }} />
          <div style={{ height: 10, borderRadius: 6, background: 'var(--bg3)', width: '75%' }} />
        </div>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadAllPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/posts?limit=500');
      const json = await res.json();
      setAllPosts(json.posts || []);
    } catch {}
  }, []);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filter !== 'all') p.set('category', filter);
      if (search) p.set('search', search);
      const res = await fetch(`/api/posts?${p}`);
      const json = await res.json();
      setPosts(json.posts || []);
    } catch { showToast('Failed to load posts'); }
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setIsAdmin(d.authenticated));
    loadAllPosts();
  }, [loadAllPosts]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  function openNewPost() { setEditingPost(null); setEditorOpen(true); }
  function openEdit(post: Post) { setEditingPost(post); setEditorOpen(true); }

  async function handleDelete(slug: string) {
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { showToast('Post deleted'); loadPosts(); loadAllPosts(); }
    else showToast('Delete failed');
  }

  async function handleTogglePublish(post: Post) {
    const res = await fetch(`/api/posts/${post.slug}`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    if (res.ok) { showToast(post.published ? 'Post unpublished' : 'Post published'); loadPosts(); loadAllPosts(); }
    else showToast('Failed to update');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar isAdmin={isAdmin} onNewPost={openNewPost} onAuthChange={setIsAdmin} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>Writing</p>
          <h1 style={{ fontWeight: 800, fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'var(--fg)', letterSpacing: '-0.03em', marginBottom: 10 }}>Blog & Articles</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', maxWidth: 480, lineHeight: 1.7 }}>
            Notes on Networking, Cloud, DevOps, Kubernetes, Terraform — and life off the court.
          </p>
        </div>

        {/* Heatmap */}
        <div style={{ marginBottom: 32 }}>
          <HeatmapChart posts={allPosts} allPosts={allPosts} />
        </div>

        {/* Search + Write */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: 'var(--muted)', pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder="Search posts…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="form-input"
              style={{ paddingLeft: 36 }}
            />
          </div>
          {isAdmin && (
            <button onClick={openNewPost} className="btn btn-primary">✍️ New Post</button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
          <button onClick={() => setFilter('all')} style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${filter === 'all' ? 'var(--accent-border)' : 'transparent'}`, background: filter === 'all' ? 'var(--accent-dim)' : 'var(--bg3)', color: filter === 'all' ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.12s' }}>
            All
          </button>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setFilter(cat.id)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', border: `1px solid ${filter === cat.id ? `${cat.color}50` : 'transparent'}`, background: filter === cat.id ? `${cat.color}15` : 'var(--bg3)', color: filter === cat.id ? cat.color : 'var(--muted)', transition: 'all 0.12s' }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          {/* Post list */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 14, fontFamily: 'monospace' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'}
              {filter !== 'all' ? ` in "${filter}"` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>

            {loading ? <Spinner /> : posts.length === 0 ? (
              <div className="card" style={{ padding: '56px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{search ? '🔍' : '✍️'}</div>
                <p style={{ fontWeight: 700, color: 'var(--fg)', marginBottom: 6 }}>
                  {search ? 'No posts found' : 'No posts yet'}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>
                  {search ? `Nothing matching "${search}"` : isAdmin ? 'Click "New Post" to publish your first article.' : 'Check back soon!'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} isAdmin={isAdmin} onEdit={openEdit} onDelete={handleDelete} onTogglePublish={handleTogglePublish} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar — hide on small screens */}
          <div style={{ display: 'none' }} className="sidebar-wrapper">
            <BlogSidebar posts={allPosts} filter={filter} onFilterChange={setFilter} isAdmin={isAdmin} />
          </div>
        </div>
      </main>

      {editorOpen && (
        <EditorModal
          post={editingPost}
          onClose={() => setEditorOpen(false)}
          onSaved={() => {
            setEditorOpen(false);
            loadPosts();
            loadAllPosts();
            showToast(editingPost ? 'Post updated ✓' : 'Post published 🎉');
          }}
        />
      )}

      {toast && <div className="toast">{toast}</div>}

      <style>{`
        @media (min-width: 900px) {
          .sidebar-wrapper { display: block !important; }
        }
      `}</style>
    </div>
  );
}
