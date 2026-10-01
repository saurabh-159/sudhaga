export const SYSTEM_PATHS = {
  shipping: '/shipping',
  returns: '/returns',
  privacy: '/privacy',
  terms: '/terms',
};

export function policyPath(policy) {
  return SYSTEM_PATHS[policy.slug] || `/policies/${policy.slug}`;
}

const RESERVED = new Set([
  'shipping',
  'returns',
  'privacy',
  'terms',
  'contact',
  'about',
  'products',
  'cart',
  'checkout',
  'blog',
  'login',
  'admin',
  'policies',
  'categories',
  'wishlist',
  'orders',
  'account',
  'profile',
  'api',
]);

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export function policySlug(value) {
  const slug = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
  return slug || 'page';
}

export function isReservedPolicySlug(slug) {
  return RESERVED.has(slug);
}

export function readPolicyBody(body = {}, { system = false } = {}) {
  const title = String(body.title || '').trim();
  const text = String(body.body || '').trim();
  const slugInput = String(body.slug || '').trim();
  if (title.length < 3) fail('Title is required');
  if (title.length > 140) fail('Title is too long');
  if (text.length < 40) fail('Page text is too short');
  if (text.length > 20000) fail('Page text is too long');

  const slug = policySlug(slugInput || title);
  if (!system && isReservedPolicySlug(slug)) {
    fail('That address is reserved. Pick another URL slug.');
  }

  return {
    title,
    slug,
    summary: String(body.summary || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 300),
    body: text,
    published: system ? true : body.published !== false && body.published !== 'false',
  };
}
