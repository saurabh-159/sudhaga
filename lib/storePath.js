export function productPath(product) {
  const slug = String(product?.slug || '').trim();
  if (slug) return `/products/${slug}`;
  const id = String(product?.id || product?._id || '').trim();
  if (id) return `/products/${id}`;
  return '/products';
}

export function productAlt(product) {
  const custom = String(product?.imageAlt || '').trim();
  if (custom) return custom;
  const name = String(product?.name || 'Product').trim();
  const category = String(product?.categoryName || '').trim();
  if (category) return `${name}, ${category} from Sudhaga`;
  return `${name} from Sudhaga`;
}

export function pageTitle(custom, fallback) {
  const title = String(custom || '').trim();
  return title || fallback;
}

export function productCrumbs(product) {
  const categoryName = product?.categoryName || '';
  const items = [{ name: 'Home', href: '/' }];
  if (product?.category) {
    items.push({
      name: categoryName || 'Category',
      href: `/categories/${product.category}`,
    });
  } else {
    items.push({ name: 'Products', href: '/products' });
  }
  items.push({ name: product?.name || 'Product', href: productPath(product) });
  return items;
}

export function storePath(value, fallback = '/products') {
  const href = String(value || '').trim();
  if (!href.startsWith('/') || href.startsWith('//') || href.includes('\\') || href.includes('://')) {
    return fallback;
  }
  return href;
}
