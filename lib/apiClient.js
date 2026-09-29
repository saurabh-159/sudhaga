export async function api(path, options = {}) {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new Error(json.message || 'Request failed');
  }
  return json.data;
}

function shapeAttributes(attributes) {
  if (!Array.isArray(attributes)) return [];
  return attributes
    .map((row) => {
      const options = Array.isArray(row?.options)
        ? row.options
            .filter((option) => option?.slug && option.value != null && String(option.value) !== '')
            .map((option) => ({
              name: option.name || option.slug,
              slug: option.slug,
              value: String(option.value),
            }))
        : [];
      if (!options.length || row?.price == null || row.price === '') return null;
      return { price: Number(row.price), options };
    })
    .filter(Boolean);
}

export function shapeProduct(product) {
  if (!product) return product;
  const category = product.category;
  const slug =
    category && typeof category === 'object' ? category.slug || '' : category || '';
  return {
    ...product,
    id: String(product._id || product.id),
    category: slug,
    categoryId: category && typeof category === 'object' ? String(category._id) : '',
    categoryName: category && typeof category === 'object' ? category.name : '',
    image: product.image || '',
    price: Number(product.price || 0),
    originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
    rating: product.rating || 0,
    stock: product.stock ?? 0,
    attributes: shapeAttributes(product.attributes),
  };
}

export function shapeCategory(category) {
  if (!category) return category;
  return {
    ...category,
    id: String(category._id || category.id),
    blurb: category.blurb || '',
    image: category.image || '',
  };
}

export function shapeOrder(order) {
  if (!order) return order;
  const created = order.createdAt ? new Date(order.createdAt) : null;
  return {
    ...order,
    id: String(order._id || order.id),
    date: created
      ? created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
    itemCount: Array.isArray(order.items) ? order.items.length : Number(order.items || 0),
    items: order.items || [],
    total: Number(order.total || 0),
  };
}

export function shapeUser(user) {
  if (!user) return user;
  const created = user.createdAt ? new Date(user.createdAt) : null;
  return {
    ...user,
    id: String(user._id || user.id),
    joined: created
      ? created.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : '',
  };
}

export function cartLines(cart) {
  return (cart?.items || [])
    .filter((item) => item.product)
    .map((item) => {
      const product = shapeProduct(item.product);
      return { ...product, qty: item.qty, lineId: product.id };
    });
}
