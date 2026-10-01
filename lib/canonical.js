function hasValue(value) {
  if (Array.isArray(value)) return value.some((item) => String(item || '').trim());
  return String(value ?? '').trim() !== '';
}

function paramKeys(searchParams) {
  if (!searchParams) return [];
  return Object.entries(searchParams)
    .filter(([, value]) => hasValue(value))
    .map(([key]) => key.toLowerCase());
}

export function pageNumber(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number.parseInt(String(raw || '1'), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function meta(canonical, indexable) {
  return {
    alternates: { canonical },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
  };
}

/** Clean page is indexable. Any query (utm, sort, filter) keeps the same canonical and stays out of the index. */
export function cleanCanonical(path, searchParams) {
  return meta(path, paramKeys(searchParams).length === 0);
}

/**
 * Products listing: page 1 is /products, later pages are /products?page=n.
 * Search, sort, color, size, and other params canonical to /products and are not indexed.
 */
export function productsCanonical(searchParams) {
  const keys = paramKeys(searchParams).filter((key) => key !== 'page');
  if (keys.length) return meta('/products', false);
  const page = pageNumber(searchParams?.page);
  return meta(page > 1 ? `/products?page=${page}` : '/products', true);
}
