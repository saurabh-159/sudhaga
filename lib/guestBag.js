import { api } from '@/lib/apiClient';

const CART_KEY = 'sudhaga_cart';
const WISH_KEY = 'sudhaga_wishlist';

function readList(key) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function readGuestCart() {
  return readList(CART_KEY)
    .filter((row) => row && typeof row.productId === 'string' && row.productId)
    .map((row) => ({ productId: row.productId, qty: Math.max(1, Math.min(20, Number(row.qty) || 1)) }));
}

export function writeGuestCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function readGuestWishlist() {
  return readList(WISH_KEY).filter((id) => typeof id === 'string' && id);
}

export function writeGuestWishlist(ids) {
  localStorage.setItem(WISH_KEY, JSON.stringify(ids));
}

export async function mergeGuestBag() {
  const cart = readGuestCart();
  const wish = readGuestWishlist();
  if (cart.length) {
    await api('/api/cart/merge', { method: 'POST', body: JSON.stringify({ items: cart }) });
    localStorage.removeItem(CART_KEY);
  }
  if (wish.length) {
    await api('/api/wishlist/merge', { method: 'POST', body: JSON.stringify({ productIds: wish }) });
    localStorage.removeItem(WISH_KEY);
  }
}
