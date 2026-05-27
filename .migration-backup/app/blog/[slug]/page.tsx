import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PostReader from '@/components/blog/PostReader';

export const dynamic = 'force-dynamic';

type Props = { params: { slug: string } };

async function getPost(slug: string) {
  try {
    // On Vercel, VERCEL_URL is set automatically. Prefer explicit APP_URL, then Vercel's URL, then localhost.
    const base =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    const res = await fetch(`${base}/api/posts/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const { post } = await res.json();
    return post;
  } catch { return null; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post Not Found' };
  return {
    title: post.title,
    description: post.excerpt || '',
    openGraph: {
      title: post.title,
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.created_at,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  return <PostReader post={post} />;
}
