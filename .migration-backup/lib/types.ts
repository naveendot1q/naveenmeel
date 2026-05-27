export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content?: string;
  category: string;
  tags: string[] | null;
  published: boolean;
  cover_emoji: string | null;
  created_at: string;
  updated_at: string;
  read_time: number | null;
  word_count: number | null;
};
