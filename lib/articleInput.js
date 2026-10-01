import { storePath } from '@/lib/storePath';

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export function slugify(value) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return slug || 'article';
}

function readLinks(value) {
  const lines = Array.isArray(value) ? value : String(value || '').split('\n');
  return lines
    .map((line) => {
      if (line && typeof line === 'object') {
        return { label: String(line.label || '').trim(), href: storePath(line.href, '') };
      }
      const [label, href] = String(line).split('|').map((part) => part.trim());
      return { label, href: storePath(href, '') };
    })
    .filter((link) => link.label && link.href);
}

export function readArticleBody(body = {}) {
  const title = String(body.title || '').trim();
  const text = String(body.body || '').trim();
  const slugInput = String(body.slug || '').trim();
  if (title.length < 4) fail('Title is required');
  if (text.length < 40) fail('Article text is too short');

  return {
    title,
    slug: slugify(slugInput || title),
    excerpt: String(body.excerpt || '').trim(),
    body: text,
    image: String(body.image || '').trim(),
    imageAlt: String(body.imageAlt || '').trim(),
    seoTitle: String(body.seoTitle || '').trim(),
    metaDescription: String(body.metaDescription || '').trim(),
    focusKeyword: String(body.focusKeyword || '').trim(),
    links: readLinks(body.links),
    published: body.published !== false && body.published !== 'false',
  };
}
