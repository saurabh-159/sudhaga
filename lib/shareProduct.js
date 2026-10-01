import { productPath } from '@/lib/storePath';

export async function shareProduct(product, urlOverride) {
  const path = productPath(product);
  const url = urlOverride || `${window.location.origin}${path}`;
  const name = String(product?.name || '').trim();
  const title = name ? `${name} | Sudhaga` : 'Sudhaga';
  const text = name ? `${name} on Sudhaga` : 'Shop ethnic wear at Sudhaga';

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
    }
  }

  try {
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
