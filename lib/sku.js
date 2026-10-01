function cleanToken(value, length) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, length);
}

export function optionKey(options = []) {
  return [...options]
    .sort((a, b) => String(a.slug).localeCompare(String(b.slug)))
    .map((option) => `${option.slug}:${option.value}`)
    .join('|');
}

export function baseFromName(name) {
  const words = String(name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return words[0]?.slice(0, 8) || 'SUD';
}

function claimSku(candidate, taken) {
  const normalized =
    String(candidate || '')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 32) || 'SUD';
  let sku = normalized;
  let n = 2;
  while (taken.has(sku)) {
    const suffix = `-${n}`;
    sku = `${normalized.slice(0, Math.max(1, 32 - suffix.length))}${suffix}`;
    n += 1;
  }
  taken.add(sku);
  return sku;
}

function reserve(existing, fallback, taken) {
  const current = String(existing || '').trim().toUpperCase();
  if (current && !taken.has(current)) {
    taken.add(current);
    return current;
  }
  return claimSku(fallback, taken);
}

function variantCode(options) {
  return [...options]
    .sort((a, b) => String(a.slug).localeCompare(String(b.slug)))
    .map((option) => cleanToken(option.value, 4) || 'X')
    .join('-');
}

export function needsSku(product) {
  if (!product?.sku) return true;
  return (product.attributes || []).some(
    (row) => Array.isArray(row?.options) && row.options.length > 0 && !row.sku,
  );
}

export function planSkus(product, taken) {
  const productSku = reserve(product.sku, baseFromName(product.name), taken);
  const attributes = (product.attributes || [])
    .map((row) => {
      const options = (row.options || [])
        .filter((option) => option?.slug && option.value != null && String(option.value) !== '')
        .map((option) => ({
          name: option.name || option.slug,
          slug: option.slug,
          value: String(option.value),
        }));
      if (!options.length || row.price == null || row.price === '') return null;
      return {
        sku: reserve(row.sku, `${productSku}-${variantCode(options)}`, taken),
        price: Number(row.price),
        options,
      };
    })
    .filter(Boolean);
  return { sku: productSku, attributes };
}

export function mergeAttributeSkus(existing = [], incoming = []) {
  const byKey = new Map();
  for (const row of existing || []) {
    const options = row?.options || [];
    if (!options.length || !row.sku) continue;
    byKey.set(optionKey(options), row.sku);
  }
  return (incoming || []).map((row) => ({
    price: row.price,
    options: row.options,
    sku: row.sku || byKey.get(optionKey(row.options || [])) || '',
  }));
}

export async function loadTakenSkus(exceptId) {
  const { default: Product } = await import('@/models/Product');
  const filter = exceptId ? { _id: { $ne: exceptId } } : {};
  const rows = await Product.find(filter).select('sku attributes.sku').lean();
  const taken = new Set();
  for (const row of rows) {
    if (row.sku) taken.add(String(row.sku));
    for (const attr of row.attributes || []) {
      if (attr.sku) taken.add(String(attr.sku));
    }
  }
  return taken;
}

export async function assignSkus(doc) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const taken = await loadTakenSkus(doc._id);
    const planned = planSkus(doc, taken);
    doc.sku = planned.sku;
    doc.attributes = planned.attributes;
    doc.markModified('attributes');
    try {
      await doc.save();
      return doc;
    } catch (error) {
      if (error?.code !== 11000 || attempt === 1) throw error;
    }
  }
  return doc;
}

export async function assignMissingSkus(products) {
  const pending = (products || []).filter(needsSku);
  if (!pending.length) return products;
  const taken = await loadTakenSkus();
  for (const product of pending) {
    if (product.sku) taken.delete(String(product.sku));
    for (const row of product.attributes || []) {
      if (row.sku) taken.delete(String(row.sku));
    }
    const planned = planSkus(product, taken);
    product.sku = planned.sku;
    product.attributes = planned.attributes;
    product.markModified('attributes');
    await product.save();
  }
  return products;
}
