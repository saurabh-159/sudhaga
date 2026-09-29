export function storePath(value, fallback = '/products') {
  const href = String(value || '').trim();
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('\\') || href.includes('://')) {
    return fallback;
  }
  return href;
}
