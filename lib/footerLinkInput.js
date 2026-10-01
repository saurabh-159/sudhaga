export const FOOTER_SECTIONS = [
  { value: 'help', label: 'Help' },
  { value: 'follow', label: 'Follow' },
];

const SECTIONS = new Set(FOOTER_SECTIONS.map((section) => section.value));

function fail(message) {
  const error = new Error(message);
  error.status = 400;
  throw error;
}

export function readFooterLinkBody(body = {}) {
  const section = String(body.section || '').trim();
  const label = String(body.label || '').trim();
  const sort = Number(body.sort);

  if (!SECTIONS.has(section)) fail('Choose Help or Follow');
  if (label.length < 2 || label.length > 40) fail('Link text must be 2–40 characters');

  return {
    section,
    label,
    url: readFooterUrl(body.url),
    sort: Number.isInteger(sort) && sort >= 0 && sort <= 999 ? sort : 100,
    published: body.published !== false && body.published !== 'false',
  };
}

export function readFooterUrl(value) {
  const url = String(value || '').trim();
  if (!url) fail('URL is required');
  if (url.length > 500) fail('URL is too long');

  if (url.startsWith('/')) {
    if (url.startsWith('//') || /\s/.test(url)) {
      fail('Use a site path like /contact, or a full https URL');
    }
    return url;
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    fail('Use a site path like /contact, or a full https URL');
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    fail('Only http and https links are allowed');
  }
  return parsed.toString();
}

export function isExternalFooterUrl(url) {
  return /^https?:\/\//i.test(String(url || ''));
}
