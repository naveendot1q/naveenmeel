import { marked } from 'marked';

// Configure marked with syntax highlighting stub (highlight.js loaded client-side)
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Custom renderer for better styling
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
  const language = lang || 'plaintext';
  return `<pre class="code-block" data-lang="${language}"><code class="language-${language} hljs">${escapeHtml(text)}</code></pre>`;
};

renderer.blockquote = ({ tokens }: { tokens: any[] }) => {
  const body = marked.Parser.parse(tokens);
  return `<blockquote class="md-blockquote">${body}</blockquote>`;
};

renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
  const id = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${depth} id="${id}" class="md-h${depth}">${text}</h${depth}>`;
};

renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  return `<a href="${href}" ${title ? `title="${title}"` : ''} target="_blank" rel="noopener noreferrer" class="md-link">${text}</a>`;
};

renderer.image = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
  return `<img src="${href}" alt="${text}" ${title ? `title="${title}"` : ''} class="md-image" loading="lazy" />`;
};

marked.use({ renderer });

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function parseMarkdown(content: string): Promise<string> {
  return await marked.parse(content);
}

export function extractExcerpt(content: string, length = 160): string {
  return content
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, length) + '...';
}
