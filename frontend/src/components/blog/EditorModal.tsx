import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { CATEGORIES } from '@/lib/categories';
import type { Post } from '@/lib/types';

const EMOJIS = ['📝','🌐','☁️','⚙️','🔒','🐧','🔄','☸️','🏗️','📊','📜','🐍','⚡','🏀','✨','💡','🚀','🔥','💻','📡'];

type Props = { post: Post | null; onClose: () => void; onSaved: () => void; };

export default function EditorModal({ post, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(post?.category || 'networking');
  const [customCat, setCustomCat] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [emoji, setEmoji] = useState(post?.cover_emoji || '📝');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [published, setPublished] = useState(post?.published ?? true);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [loadingContent, setLoadingContent] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (post?.slug) {
      setLoadingContent(true);
      fetch(`/api/posts/${post.slug}`)
        .then(r => r.json())
        .then(d => { setContent(d.post?.content || ''); setLoadingContent(false); })
        .catch(() => setLoadingContent(false));
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [post?.slug]);

  useEffect(() => {
    setWordCount(content.trim() ? content.trim().split(/\s+/).length : 0);
  }, [content]);

  useEffect(() => {
    if (tab !== 'preview' || !content) return;
    import('marked').then(({ marked }) => {
      const result = marked.parse(content);
      if (result instanceof Promise) {
        result.then(html => setPreviewHtml(html));
      } else {
        setPreviewHtml(result as string);
      }
    });
  }, [tab, content]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    if (showEmojiPicker) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [showEmojiPicker]);

  function getSelection() {
    const ta = taRef.current;
    if (!ta) return { s: 0, e: 0 };
    return { s: ta.selectionStart, e: ta.selectionEnd };
  }

  function applyToTextarea(newVal: string, cursorStart: number, cursorEnd: number) {
    setContent(newVal);
    setTimeout(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(cursorStart, cursorEnd);
    }, 0);
  }

  function insert(before: string, after = '', placeholder = 'text') {
    const ta = taRef.current; if (!ta) return;
    const { s, e } = getSelection();
    const sel = content.substring(s, e) || placeholder;
    const newVal = content.substring(0, s) + before + sel + after + content.substring(e);
    applyToTextarea(newVal, s + before.length, s + before.length + sel.length);
  }

  function insertLine(prefix: string) {
    const ta = taRef.current; if (!ta) return;
    const { s } = getSelection();
    const ls = content.lastIndexOf('\n', s - 1) + 1;
    const le = content.indexOf('\n', s);
    const lineEnd = le === -1 ? content.length : le;
    const lineContent = content.substring(ls, lineEnd);
    const alreadyHas = lineContent.startsWith(prefix.trimStart());
    if (alreadyHas) {
      const newVal = content.substring(0, ls) + lineContent.substring(prefix.length) + content.substring(lineEnd);
      applyToTextarea(newVal, s - prefix.length, s - prefix.length);
    } else {
      const newVal = content.substring(0, ls) + prefix + content.substring(ls);
      applyToTextarea(newVal, ls + prefix.length + (s - ls), ls + prefix.length + (s - ls));
    }
  }

  function insertBlock(block: string) {
    const ta = taRef.current; if (!ta) return;
    const { s } = getSelection();
    const before = s > 0 && content[s - 1] !== '\n' ? '\n' : '';
    const newVal = content.substring(0, s) + before + block + content.substring(s);
    const cur = s + before.length + block.length;
    applyToTextarea(newVal, cur, cur);
  }

  function addTag(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
      setTagInput('');
    }
  }

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setSaving(true); setError('');
    try {
      const body = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim() || undefined,
        tags,
        published,
        cover_emoji: emoji,
        category: showCustom ? undefined : category,
        custom_category: showCustom ? customCat.trim() : undefined,
      };
      const url = post?.slug ? `/api/posts/${post.slug}` : '/api/posts';
      const method = post?.slug ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  const toolbarGroups = [
    [
      { label: 'B', action: () => insert('**', '**', 'bold'), title: 'Bold', style: { fontWeight: 'bold' } },
      { label: 'I', action: () => insert('*', '*', 'italic'), title: 'Italic', style: { fontStyle: 'italic' } },
      { label: 'S', action: () => insert('~~', '~~', 'strikethrough'), title: 'Strikethrough' },
    ],
    [
      { label: 'H1', action: () => insertLine('# '), title: 'Heading 1' },
      { label: 'H2', action: () => insertLine('## '), title: 'Heading 2' },
      { label: 'H3', action: () => insertLine('### '), title: 'Heading 3' },
    ],
    [
      { label: '`', action: () => insert('`', '`', 'code'), title: 'Inline code' },
      { label: '```', action: () => insertBlock('```\ncode here\n```\n'), title: 'Code block', style: { fontFamily: 'monospace' } },
    ],
    [
      { label: '🔗', action: () => insert('[', '](url)', 'link text'), title: 'Link' },
      { label: '❝', action: () => insertLine('> '), title: 'Blockquote' },
      { label: '• ', action: () => insertLine('- '), title: 'Bullet list' },
      { label: '1.', action: () => insertLine('1. '), title: 'Numbered list' },
    ],
    [
      { label: '━', action: () => insertBlock('\n---\n'), title: 'Horizontal rule' },
      { label: '⊞', action: () => insertBlock('| Col 1 | Col 2 | Col 3 |\n|-------|-------|-------|\n| Cell  | Cell  | Cell  |\n'), title: 'Table' },
    ],
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, overflowY: 'auto', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px' }}>
        <div style={{ width: '100%', maxWidth: 860, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--accent)' }}>{post ? 'Edit Post' : 'New Post'}</span>
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', background: 'var(--bg3)', color: 'var(--muted)', padding: '3px 8px', borderRadius: 6 }}>{wordCount} words</span>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--fg2)', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>

          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Title + Emoji */}
            <div style={{ display: 'flex', gap: 12 }}>
              <div ref={emojiRef} style={{ position: 'relative', flexShrink: 0 }}>
                <button
                  onClick={() => setShowEmojiPicker(v => !v)}
                  title="Choose icon"
                  style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg3)', border: '1px solid var(--border)', fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {emoji}
                </button>
                {showEmojiPicker && (
                  <div style={{ position: 'absolute', top: 56, left: 0, zIndex: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 10, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 4, width: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
                    {EMOJIS.map(em => (
                      <button key={em} onClick={() => { setEmoji(em); setShowEmojiPicker(false); }} style={{ padding: 6, borderRadius: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg3)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >{em}</button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="form-input"
                placeholder="Post title…"
                style={{ fontSize: '1.1rem', fontWeight: 700, flex: 1 }}
                autoFocus={!post}
              />
            </div>

            {/* Category + Excerpt */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label className="form-label">Category</label>
                <select
                  value={showCustom ? '__custom__' : category}
                  onChange={e => {
                    if (e.target.value === '__custom__') { setShowCustom(true); }
                    else { setShowCustom(false); setCategory(e.target.value); }
                  }}
                  className="form-input"
                >
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  <option value="__custom__">+ Custom…</option>
                </select>
                {showCustom && (
                  <input type="text" value={customCat} onChange={e => setCustomCat(e.target.value)} className="form-input" style={{ marginTop: 8 }} placeholder="Custom category name" />
                )}
              </div>
              <div>
                <label className="form-label">Excerpt (optional)</label>
                <input type="text" value={excerpt} onChange={e => setExcerpt(e.target.value)} className="form-input" placeholder="One-line summary…" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {tags.map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontFamily: 'monospace', background: 'var(--bg3)', color: 'var(--fg2)', padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    #{t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1, padding: '0 0 0 2px' }}>×</button>
                  </span>
                ))}
              </div>
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} className="form-input" placeholder="Type tag and press Enter or comma" />
            </div>

            {/* Editor */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', background: 'var(--bg3)', borderRadius: 8, padding: 3, gap: 2 }}>
                  {(['write', 'preview'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)} style={{ padding: '5px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? '#fff' : 'var(--muted)', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Published</span>
                  <button
                    onClick={() => setPublished(v => !v)}
                    style={{ width: 42, height: 22, borderRadius: 11, background: published ? 'var(--accent)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <span style={{ position: 'absolute', top: 2, left: published ? 22 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  </button>
                </div>
              </div>

              {tab === 'write' ? (
                <>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, padding: '8px 10px', background: 'var(--bg)', borderRadius: '8px 8px 0 0', border: '1px solid var(--border)', borderBottom: 'none' }}>
                    {toolbarGroups.map((group, gi) => (
                      <div key={gi} style={{ display: 'flex', gap: 2, paddingRight: gi < toolbarGroups.length - 1 ? 8 : 0, borderRight: gi < toolbarGroups.length - 1 ? '1px solid var(--border)' : 'none', marginRight: gi < toolbarGroups.length - 1 ? 4 : 0 }}>
                        {group.map(b => (
                          <button
                            key={b.label}
                            onClick={b.action}
                            title={b.title}
                            style={{ padding: '4px 8px', borderRadius: 6, fontSize: '0.78rem', fontFamily: 'monospace', background: 'var(--bg3)', color: 'var(--fg2)', border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.12s', ...(b.style || {}) }}
                            onMouseEnter={e => { (e.currentTarget.style.color = 'var(--accent)'); (e.currentTarget.style.borderColor = 'var(--accent-border)'); (e.currentTarget.style.background = 'var(--accent-dim)'); }}
                            onMouseLeave={e => { (e.currentTarget.style.color = 'var(--fg2)'); (e.currentTarget.style.borderColor = 'transparent'); (e.currentTarget.style.background = 'var(--bg3)'); }}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  {loadingContent ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', color: 'var(--muted)', fontSize: '0.875rem' }}>
                      Loading…
                    </div>
                  ) : (
                    <textarea
                      ref={taRef}
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      placeholder="Write your post in Markdown…&#10;&#10;Tip: Use the toolbar above for formatting, or type markdown directly."
                      style={{ width: '100%', minHeight: 380, padding: '14px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '0 0 8px 8px', color: 'var(--fg)', fontFamily: 'JetBrains Mono, Fira Code, monospace', fontSize: '0.85rem', lineHeight: 1.75, resize: 'vertical', outline: 'none', transition: 'border-color 0.15s' }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    />
                  )}
                </>
              ) : (
                <div
                  className="prose-blog"
                  style={{ minHeight: 320, padding: '20px 24px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}
                  dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:var(--muted);font-style:italic">Nothing to preview yet…</p>' }}
                />
              )}
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
              <button onClick={onClose} className="btn btn-ghost">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ opacity: saving ? 0.7 : 1, minWidth: 130 }}>
                {saving ? 'Saving…' : post ? 'Update Post' : 'Publish Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
