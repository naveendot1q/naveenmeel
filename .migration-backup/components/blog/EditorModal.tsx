'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { CATEGORIES } from '@/lib/categories';
import type { Post } from '@/lib/types';

const EMOJIS = ['📝','🌐','☁️','⚙️','🔒','🐧','🔄','☸️','🏗️','📊','📜','🐍','⚡','🏀','✨','💡','🚀','🔥','💻','📡'];

type Props = {
  post: Post | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditorModal({ post, onClose, onSaved }: Props) {
  const [title, setTitle]         = useState(post?.title || '');
  const [content, setContent]     = useState('');
  const [category, setCategory]   = useState(post?.category || 'networking');
  const [customCat, setCustomCat] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [excerpt, setExcerpt]     = useState(post?.excerpt || '');
  const [tags, setTags]           = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput]   = useState('');
  const [emoji, setEmoji]         = useState(post?.cover_emoji || '📝');
  const [published, setPublished] = useState(post?.published ?? true);
  const [tab, setTab]             = useState<'write' | 'preview'>('write');
  const [preview, setPreview]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');
  const [wordCount, setWordCount] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Load full post content if editing
  useEffect(() => {
    if (post?.slug) {
      fetch(`/api/posts/${post.slug}`)
        .then(r => r.json())
        .then(d => setContent(d.post?.content || ''));
    }
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [post?.slug]);

  useEffect(() => {
    setWordCount(content.trim() ? content.split(/\s+/).length : 0);
  }, [content]);

  useEffect(() => {
    if (tab === 'preview' && content) {
      // Simple client-side markdown render for preview
      import('marked').then(({ marked }) => {
        marked.setOptions({ gfm: true, breaks: true });
        const html = marked.parse(content) as string;
        setPreview(html);
      });
    }
  }, [tab, content]);

  // Markdown toolbar helper
  function insert(before: string, after = '', placeholder = '') {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd;
    const sel = content.substring(s, e) || placeholder;
    const newContent = content.substring(0, s) + before + sel + after + content.substring(e);
    setContent(newContent);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = s + before.length;
      ta.selectionEnd   = s + before.length + sel.length;
    }, 0);
  }

  function insertLine(prefix: string) {
    const ta = taRef.current; if (!ta) return;
    const s = ta.selectionStart;
    const ls = content.lastIndexOf('\n', s - 1) + 1;
    const newContent = content.substring(0, ls) + prefix + content.substring(ls);
    setContent(newContent);
    setTimeout(() => { ta.focus(); ta.selectionStart = ta.selectionEnd = ls + prefix.length; }, 0);
  }

  function insertTable() {
    insert('\n| Header 1 | Header 2 | Header 3 |\n|---|---|---|\n| Cell 1 | Cell 2 | Cell 3 |\n');
  }

  function addTag(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (!tags.includes(t)) setTags([...tags, t]);
      setTagInput('');
    }
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setSaving(true); setError('');
    try {
      const body = {
        title, content, excerpt, tags, published,
        cover_emoji: emoji,
        category,
        custom_category: showCustom ? customCat : undefined,
      };
      const url    = post?.slug ? `/api/posts/${post.slug}` : '/api/posts';
      const method = post?.slug ? 'PATCH' : 'POST';
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const toolbarButtons = [
    { label: 'B',  action: () => insert('**', '**', 'bold'),    title: 'Bold' },
    { label: 'I',  action: () => insert('*', '*', 'italic'),    title: 'Italic' },
    { label: 'S̶', action: () => insert('~~', '~~', 'strike'),  title: 'Strikethrough' },
    { label: 'H1', action: () => insertLine('# '),               title: 'Heading 1' },
    { label: 'H2', action: () => insertLine('## '),              title: 'Heading 2' },
    { label: 'H3', action: () => insertLine('### '),             title: 'Heading 3' },
    { label: '`',  action: () => insert('`', '`', 'code'),      title: 'Inline code' },
    { label: '```',action: () => insert('```\n', '\n```', 'code'), title: 'Code block' },
    { label: '🔗', action: () => insert('[', '](url)', 'link'), title: 'Link' },
    { label: '❝',  action: () => insertLine('> '),              title: 'Blockquote' },
    { label: '• ', action: () => insertLine('- '),              title: 'Bullet list' },
    { label: '1.',action: () => insertLine('1. '),              title: 'Numbered list' },
    { label: '—', action: () => insert('\n---\n'),              title: 'Divider' },
    { label: '⊞',  action: insertTable,                          title: 'Table' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'rgba(1,4,9,.96)', backdropFilter: 'blur(16px)' }}
    >
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="w-full max-w-4xl rounded-xl overflow-hidden"
          style={{ background: '#161b22', border: '1px solid #30363d' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b"
            style={{ background: '#0d1117', borderColor: '#21262d' }}>
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-lg" style={{ color: '#FF6B1A' }}>
                {post ? 'Edit Post' : 'New Post'}
              </span>
              <span className="text-xs font-mono px-2 py-1 rounded"
                style={{ background: '#21262d', color: '#8b949e' }}>
                {wordCount} words
              </span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
              style={{ background: '#21262d', color: '#8b949e' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f85149')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8b949e')}>
              ✕
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            {/* Title + Emoji */}
            <div className="flex gap-3">
              {/* Emoji picker */}
              <div className="relative group">
                <button className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all"
                  style={{ background: '#21262d', border: '1px solid #30363d' }}>
                  {emoji}
                </button>
                <div className="absolute top-14 left-0 z-10 rounded-xl p-3 hidden group-hover:grid"
                  style={{ background: '#1c2128', border: '1px solid #30363d', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, width: 180 }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      className="p-1.5 rounded text-xl hover:bg-white/10 transition-colors">{e}</button>
                  ))}
                </div>
              </div>
              <input
                type="text" value={title} onChange={e => setTitle(e.target.value)}
                className="form-input flex-1 text-lg font-display font-bold"
                placeholder="Post title..." style={{ fontSize: '1.1rem' }}
              />
            </div>

            {/* Category + Excerpt row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category</label>
                <div className="flex gap-2">
                  <select
                    value={showCustom ? '__custom__' : category}
                    onChange={e => {
                      if (e.target.value === '__custom__') { setShowCustom(true); }
                      else { setShowCustom(false); setCategory(e.target.value); }
                    }}
                    className="form-input flex-1"
                    style={{ background: '#010409' }}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                    ))}
                    <option value="__custom__">➕ Add custom category...</option>
                  </select>
                </div>
                {showCustom && (
                  <input
                    type="text" value={customCat} onChange={e => setCustomCat(e.target.value)}
                    className="form-input mt-2"
                    placeholder="e.g. eBPF, Rust, VLSI..."
                  />
                )}
              </div>
              <div>
                <label className="form-label">Excerpt</label>
                <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)}
                  className="form-input" placeholder="Brief summary (auto-generated if empty)..." />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="form-label">Tags</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs font-mono px-2 py-1 rounded"
                    style={{ background: '#21262d', color: '#8b949e' }}>
                    #{t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))}
                      className="ml-1 hover:text-red-400 transition-colors">×</button>
                  </span>
                ))}
              </div>
              <input
                type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={addTag}
                className="form-input"
                placeholder="Type a tag and press Enter or comma... e.g. mpls, bgp, k8s"
              />
            </div>

            {/* Markdown Editor */}
            <div>
              <div className="flex items-center gap-0 border-b mb-0"
                style={{ borderColor: '#21262d' }}>
                {(['write', 'preview'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="px-4 py-2 text-sm font-medium transition-all border-b-2"
                    style={{
                      color: tab === t ? '#FF6B1A' : '#8b949e',
                      borderBottomColor: tab === t ? '#FF6B1A' : 'transparent',
                      background: 'none', marginBottom: -1,
                    }}>
                    {t === 'write' ? '✏️ Write' : '👁 Preview'}
                  </button>
                ))}
                <div className="ml-auto flex flex-wrap gap-1 pb-2 pr-2">
                  {toolbarButtons.map(btn => (
                    <button key={btn.label} onClick={btn.action} title={btn.title}
                      className="px-2 py-1 text-xs font-mono rounded transition-all"
                      style={{ background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#FF6B1A', e.currentTarget.style.borderColor = 'rgba(255,107,26,.4)')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#8b949e', e.currentTarget.style.borderColor = '#30363d')}
                    >{btn.label}</button>
                  ))}
                </div>
              </div>

              {tab === 'write' ? (
                <textarea
                  ref={taRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="form-input font-mono text-sm"
                  style={{
                    minHeight: 360, resize: 'vertical', borderRadius: '0 0 8px 8px',
                    borderTop: 'none', fontFamily: 'JetBrains Mono, monospace',
                    lineHeight: 1.8, fontSize: '0.83rem', tabSize: 2,
                  }}
                  placeholder={`Write in Markdown...

# My Post Title

## Introduction
Write here. Full **Markdown** is supported.

## Code Example
\`\`\`bash
kubectl get pods -n default
\`\`\`

## Conclusion
Wrap it up!`}
                  spellCheck
                />
              ) : (
                <div
                  className="prose-blog p-5 rounded-b-xl overflow-y-auto"
                  style={{ minHeight: 360, background: '#010409', border: '1px solid #30363d', borderTop: 'none' }}
                  dangerouslySetInnerHTML={{ __html: preview || '<p style="color:#8b949e">Nothing to preview yet.</p>' }}
                />
              )}
            </div>

            {/* Options row */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setPublished(!published)}
                  className="relative w-10 h-5 rounded-full transition-colors"
                  style={{ background: published ? '#FF6B1A' : '#21262d', cursor: 'pointer' }}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: published ? 'translateX(22px)' : 'translateX(2px)' }} />
                </div>
                <span className="text-sm" style={{ color: '#8b949e' }}>
                  {published ? 'Published' : 'Draft (hidden)'}
                </span>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="text-sm p-3 rounded-lg"
                style={{ background: 'rgba(248,81,73,.1)', color: '#f85149', border: '1px solid rgba(248,81,73,.3)' }}>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t"
            style={{ background: '#0d1117', borderColor: '#21262d' }}>
            <span className="text-xs font-mono" style={{ color: '#8b949e' }}>
              Markdown · Saved to Supabase · Public via API
            </span>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn btn-outline text-sm py-2 px-4">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary text-sm py-2 px-5"
                style={{ opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : post ? '✓ Update' : '🚀 Publish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
