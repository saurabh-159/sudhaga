function optionToken(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'X';
}

export function hasVariants(product) {
  return (product?.attributes || []).some((row) => row?.options?.length);
}

export function skuWithOptions(baseSku, options = []) {
  const base = String(baseSku || '').trim().toUpperCase();
  const picked = plainOptions(options);
  if (!base || !picked.length) return base;
  const suffix = [...picked]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((option) => optionToken(option.value))
    .join('-');
  return `${base}-${suffix}`.slice(0, 32);
}

export function lineKey(productId, sku = '') {
  return `${productId}::${sku || ''}`;
}

export function splitLineKey(lineId) {
  const value = String(lineId || '');
  const index = value.indexOf('::');
  if (index === -1) return { productId: value, sku: '' };
  return { productId: value.slice(0, index), sku: value.slice(index + 2) };
}

export function plainOptions(options) {
  if (!Array.isArray(options)) return [];
  return options
    .filter((option) => option?.slug && option.value != null && String(option.value) !== '')
    .map((option) => ({
      name: option.name || option.slug,
      slug: option.slug,
      value: String(option.value),
    }));
}

export function variantGroups(attributes = []) {
  const groups = [];
  for (const row of attributes || []) {
    for (const option of row.options || []) {
      let group = groups.find((item) => item.slug === option.slug);
      if (!group) {
        group = { slug: option.slug, name: option.name || option.slug, values: [] };
        groups.push(group);
      }
      if (!group.values.includes(option.value)) group.values.push(option.value);
    }
  }
  const rank = (slug) => {
    if (slug === 'color' || slug === 'colour') return 0;
    if (slug === 'size') return 1;
    return 2;
  };
  return groups.sort((a, b) => rank(a.slug) - rank(b.slug));
}

export function selectionOf(row) {
  const selected = {};
  for (const option of row?.options || []) selected[option.slug] = option.value;
  return selected;
}

export function matchVariant(attributes = [], selected = {}) {
  return (
    (attributes || []).find((row) =>
      (row.options || []).every((option) => selected[option.slug] === option.value),
    ) || null
  );
}

export function chooseVariant(attributes = [], selected = {}, slug, value) {
  const exact = matchVariant(attributes, { ...selected, [slug]: value });
  if (exact) return exact;
  return (
    (attributes || []).find((row) =>
      (row.options || []).some((option) => option.slug === slug && option.value === value),
    ) ||
    attributes?.[0] ||
    null
  );
}

export function defaultVariant(product) {
  const row = (product?.attributes || []).find((item) => item?.options?.length);
  if (!row) return { sku: product?.sku || '', options: [] };
  return { sku: row.sku || '', options: plainOptions(row.options) };
}

export function variantBySku(product, sku = '') {
  const wanted = String(sku || '');
  if (!wanted) return null;
  const row = (product?.attributes || []).find((item) => item?.sku === wanted);
  if (row) {
    return {
      sku: row.sku,
      price: Number(row.price),
      options: plainOptions(row.options),
    };
  }
  if (product?.sku === wanted) {
    return { sku: wanted, price: Number(product.price) || 0, options: [] };
  }
  return null;
}

export function resolveCartVariant(product, sku = '') {
  const exact = variantBySku(product, sku);
  if (exact) return exact;
  if (sku) return null;
  const row = (product?.attributes || []).find((item) => item?.sku && item.options?.length);
  if (row) {
    return {
      sku: row.sku,
      price: Number(row.price),
      options: plainOptions(row.options),
    };
  }
  return { sku: product?.sku || '', price: Number(product?.price) || 0, options: [] };
}

export function lineFromProduct(product, item = {}) {
  const sku = String(item.sku || '');
  const variant = (product?.attributes || []).find((row) => row.sku && row.sku === sku);
  const options = variant?.options?.length ? plainOptions(variant.options) : plainOptions(item.options);
  const price = variant ? Number(variant.price) : Number(product?.price || 0);
  const resolvedSku = variant?.sku || sku || product?.sku || '';
  return {
    ...product,
    price,
    qty: item.qty,
    sku: resolvedSku,
    options,
    lineId: lineKey(product?.id, resolvedSku),
  };
}
