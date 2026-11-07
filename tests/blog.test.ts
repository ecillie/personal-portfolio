import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const posts = JSON.parse(readFileSync(new URL('../data/blog.json', import.meta.url), 'utf8')) as Record<string, unknown>[];

const isStringList = (value: unknown) => Array.isArray(value) && value.every((item) => typeof item === 'string');

test('blog posts have the required fields', () => {
  for (const post of posts) {
    const label = String(post.slug ?? post.title ?? 'unknown post');
    for (const field of ['slug', 'title', 'date', 'description']) {
      assert.equal(typeof post[field], 'string', `${label}: "${field}" must be a string`);
    }
    assert.match(String(post.slug), /^[a-z0-9]+(-[a-z0-9]+)*$/, `${label}: slug must be lowercase-with-dashes`);
    assert.match(String(post.date), /^\d{4}-\d{2}-\d{2}$/, `${label}: date must be YYYY-MM-DD`);
    for (const field of ['authors', 'topics', 'skills']) {
      assert.ok(isStringList(post[field]), `${label}: "${field}" must be a list of strings`);
    }
    assert.ok((post.authors as string[]).length > 0, `${label}: at least one author is required`);
  }
});

test('blog slugs are unique', () => {
  const slugs = posts.map((post) => post.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('each blog post has either a PDF in public/blog or a text body', () => {
  for (const post of posts) {
    const hasPdf = post.pdf !== undefined;
    const hasBody = post.body !== undefined;
    assert.ok(hasPdf !== hasBody, `${post.slug}: set exactly one of "pdf" or "body"`);
    if (hasPdf) {
      assert.ok(existsSync(new URL(`../public/blog/${post.pdf}`, import.meta.url)), `${post.slug}: public/blog/${post.pdf} not found`);
    } else {
      assert.ok(Array.isArray(post.body), `${post.slug}: "body" must be a list`);
      for (const block of post.body as unknown[]) {
        const valid = typeof block === 'string'
          || (typeof block === 'object' && block !== null && (typeof (block as { heading?: unknown }).heading === 'string' || isStringList((block as { list?: unknown }).list)));
        assert.ok(valid, `${post.slug}: body blocks must be a string, { "heading": ... }, or { "list": [...] }`);
      }
    }
  }
});
