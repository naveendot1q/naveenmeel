'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeatmapChart from '@/components/blog/HeatmapChart';
import PostCard from '@/components/blog/PostCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import EditorModal from '@/components/blog/EditorModal';
import PwaInstallBanner from '@/components/ui/PwaInstallBanner';
import { CATEGORIES } from '@/lib/categories';
import type { Post } from '@/lib/types';

export type { Post } from '@/lib/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Load posts from Supabase API
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('category', filter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/posts?${params}`);
      const json = await res.json();
      setPosts(json.posts || []);
    } catch {
      showToast('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  // Check admin session
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setIsAdmin(d.authenticated));
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }

  function handleNewPost() { setEditingPost(null); setEditorOpen(true); }
  function handleEdit(post: Post) { setEditingPost(post); setEditorOpen(true); }

  async function handleDelete(slug: string) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) { showToast('Post deleted'); loadPosts(); }
    else showToast('Delete failed');
  }

  async function handlePublish(post: Post) {
    const res = await fetch(`/api/posts/${post.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: !post.published }),
    });
    if (res.ok) {
      showToast(post.published ? 'Post unpublished' : 'Post published');
      loadPosts();
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      <Navbar isAdmin={isAdmin} onNewPost={handleNewPost} onAuthChange={setIsAdmin} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* Page Header */}
        <div className="mb-10">
          <p className="font-mono text-xs tracking-widest mb-3" style={{ color: '#FF6B1A' }}>WRITING</p>
          <h1 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(2rem,5vw,3rem)', color: '#e6edf3', letterSpacing: '-0.02em' }}>
            Blog & Articles
          </h1>
          <p className="text-base max-w-xl" style={{ color: '#8b949e', lineHeight: 1.7 }}>
            Notes on Networking, Cloud, DevOps, DevSecOps, Kubernetes, Terraform, and life off the court.
          </p>
        </div>

        {/* Heatmap */}
        <HeatmapChart posts={posts} allPosts={posts} />

        <div className="flex gap-8 mt-8" style={{ alignItems: 'flex-start' }}>

          {/* MAIN FEED */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-5 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#8b949e' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="form-input pl-9"
                />
              </div>
              {isAdmin && (
                <button onClick={handleNewPost} className="btn btn-primary gap-2 whitespace-nowrap">
                  ✍️ Write Post
                </button>
              )}
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`badge cursor-pointer transition-all ${filter === 'all' ? 'text-xs' : 'opacity-60 hover:opacity-100'}`}
                style={{
                  background: filter === 'all' ? 'rgba(255,107,26,.15)' : 'rgba(255,255,255,.05)',
                  color: filter === 'all' ? '#FF6B1A' : '#8b949e',
                  border: `1px solid ${filter === 'all' ? 'rgba(255,107,26,.4)' : 'transparent'}`,
                  padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                }}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className="cursor-pointer transition-all"
                  style={{
                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600,
                    background: filter === cat.id ? `${cat.color}18` : 'rgba(255,255,255,.05)',
                    color: filter === cat.id ? cat.color : '#8b949e',
                    border: `1px solid ${filter === cat.id ? `${cat.color}55` : 'transparent'}`,
                    opacity: filter === cat.id ? 1 : 0.65,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>

            {/* Post count */}
            <p className="text-xs mb-4 font-mono tracking-wider" style={{ color: '#8b949e' }}>
              <span style={{ color: '#FF6B1A' }}>{posts.length}</span> {posts.length === 1 ? 'post' : 'posts'}
              {filter !== 'all' ? ` in "${filter}"` : ''}
              {search ? ` matching "${search}"` : ''}
            </p>

            {/* Post list */}
            {loading ? (
              <div className="flex flex-col gap-3">
                {[1,2,3].map(i => (
                  <div key={i} className="card p-6 animate-pulse" style={{ height: 160 }}>
                    <div className="h-4 rounded mb-3" style={{ background: '#21262d', width: '60%' }} />
                    <div className="h-3 rounded mb-2" style={{ background: '#21262d', width: '90%' }} />
                    <div className="h-3 rounded" style={{ background: '#21262d', width: '75%' }} />
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="card p-16 text-center">
                <div className="text-5xl mb-4">{search ? '🔍' : '✍️'}</div>
                <p className="font-display font-bold text-lg mb-2" style={{ color: '#e6edf3' }}>
                  {search ? 'No posts found' : 'No posts yet'}
                </p>
                <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>
                  {search ? `Nothing matching "${search}"` : isAdmin ? 'Hit "Write Post" to publish your first article.' : 'Check back soon!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublish={handlePublish}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <BlogSidebar posts={posts} filter={filter} onFilterChange={setFilter} isAdmin={isAdmin} />
        </div>
      </main>

      {/* Editor Modal */}
      {editorOpen && (
        <EditorModal
          post={editingPost}
          onClose={() => setEditorOpen(false)}
          onSaved={() => { setEditorOpen(false); loadPosts(); showToast(editingPost ? 'Post updated! ✓' : 'Post published! 🎉'); }}
        />
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      <PwaInstallBanner />
    </div>
  );
}
