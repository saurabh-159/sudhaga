export const GST_RATE = 0.18;
export const SHIPPING_FEE = 49;
export const FREE_SHIPPING_OVER = 999;
export const MAX_LINE_QTY = 20;

export function lineCap(stock) {
  return Math.min(MAX_LINE_QTY, Math.max(0, Number(stock) || 0));
}

export function shippingFor(subtotal) {
  if (subtotal <= 0 || subtotal > FREE_SHIPPING_OVER) return 0;
  return SHIPPING_FEE;
}

export function discountFor(coupon, subtotal) {
  if (!coupon || subtotal <= 0) return 0;
  if (coupon.type === 'percent') {
    return Math.min(subtotal, Math.round((subtotal * Number(coupon.value || 0)) / 100));
  }
  return Math.min(subtotal, Math.max(0, Number(coupon.value) || 0));
}

export function priceQuote(subtotal, discount = 0) {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safeDiscount = Math.min(safeSubtotal, Math.max(0, Number(discount) || 0));
  const taxable = safeSubtotal - safeDiscount;
  const shipping = shippingFor(safeSubtotal);
  const tax = Math.round(taxable * GST_RATE);
  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    shipping,
    tax,
    total: taxable + shipping + tax,
  };
}

export function couponLabel(coupon) {
  if (!coupon) return '';
  if (coupon.description) return coupon.description;
  if (coupon.type === 'percent') return `${coupon.value}% off`;
  return `₹${Number(coupon.value || 0).toLocaleString('en-IN')} off`;
}
