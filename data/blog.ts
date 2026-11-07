/**
 * Blog posts live in data/blog.json — edit that file, not this one.
 * PDF posts set "pdf" to a filename in public/blog/; text posts provide a "body" instead.
 * See CONTENT_GUIDE.md for the full format.
 */
import blogData from './blog.json';

export type BlogBlock = string | { heading: string } | { list: string[] };

type BlogPostBase = {
  slug: string;
  title: string;
  date: string;
  authors: string[];
  description: string;
  topics: string[];
  skills: string[];
  draft?: boolean;
};

export type BlogPost = BlogPostBase & ({ pdf: string; body?: never } | { body: BlogBlock[]; pdf?: never });

export const allBlogPosts = blogData as BlogPost[];

/** Published posts, newest first. Drafts are only shown in local development. */
export const blogPosts = allBlogPosts
  .filter((post) => !post.draft || import.meta.env.DEV)
  .sort((a, b) => b.date.localeCompare(a.date));

export const blogTopics = [...new Set(blogPosts.flatMap((post) => post.topics))].sort();

export function formatBlogDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
