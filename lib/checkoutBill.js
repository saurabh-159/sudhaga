import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import CouponRedemption from '@/models/CouponRedemption';
import Order from '@/models/Order';
import { discountFor, lineCap, priceQuote, couponLabel } from '@/lib/pricing';
import { rememberShippingAddress } from '@/lib/shippingAddress';

export class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function moneyProblem(coupon, subtotal, usedByUser) {
  if (!coupon || !coupon.active) return 'This coupon is not valid';
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) return 'This coupon has expired';
  if (Number(coupon.minSubtotal || 0) > subtotal) {
    const more = Number(coupon.minSubtotal) - subtotal;
    return `Add ₹${more.toLocaleString('en-IN')} more to use this coupon`;
  }
  if (Number(coupon.maxUses) > 0 && coupon.usedCount >= coupon.maxUses) {
    return 'This coupon has been fully used';
  }
  if (coupon.oncePerUser && usedByUser) return 'You have already used this coupon';
  if (coupon.type === 'percent' && (coupon.value <= 0 || coupon.value > 100)) return 'This coupon is not valid';
  if (coupon.type === 'flat' && coupon.value <= 0) return 'This coupon is not valid';
  return '';
}

function cartLines(cart) {
  return (cart?.items || []).map((item) => {
    if (!item.product?._id) {
      throw new CheckoutError('A product in your bag is no longer available');
    }
    const qty = Number(item.qty) || 0;
    if (qty < 1 || qty > lineCap(item.product.stock)) {
      throw new CheckoutError(`${item.product.name} does not have enough stock`);
    }
    return {
      productId: item.product._id,
      name: item.product.name,
      price: Number(item.product.price) || 0,
      qty,
      image: item.product.image || '',
    };
  });
}

async function findCoupon(couponCode, userId, subtotal) {
  const code = String(couponCode || '').trim().toUpperCase();
  if (!code) return null;
  const coupon = await Coupon.findOne({ code });
  const usedByUser = coupon
    ? Boolean(await CouponRedemption.exists({ coupon: coupon._id, user: userId }))
    : false;
  const problem = moneyProblem(coupon, subtotal, usedByUser);
  if (problem) throw new CheckoutError(problem);
  return coupon;
}

export async function quoteCheckout(userId, couponCode = '') {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    return { empty: true, bill: priceQuote(0), coupon: null };
  }
  const lines = cartLines(cart);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const coupon = await findCoupon(couponCode, userId, subtotal);
  const discount = discountFor(coupon, subtotal);
  return {
    empty: false,
    bill: priceQuote(subtotal, discount),
    coupon: coupon
      ? {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          label: couponLabel(coupon),
          discount,
          used: false,
        }
      : null,
  };
}

function assertShipping(shipping) {
  const required = ['name', 'phone', 'email', 'address', 'city', 'state', 'pincode'];
  const missing = !shipping || required.some((key) => !String(shipping[key] || '').trim());
  if (missing) throw new CheckoutError('Shipping address is incomplete');
}

async function takeStock(lines) {
  const taken = [];
  for (const line of lines) {
    const updated = await Product.findOneAndUpdate(
      { _id: line.productId, stock: { $gte: line.qty } },
      { $inc: { stock: -line.qty } },
    );
    if (!updated) {
      await restoreStock(taken);
      throw new CheckoutError(`${line.name} does not have enough stock`);
    }
    taken.push(line);
  }
  return taken;
}

async function restoreStock(lines) {
  await Promise.all(
    lines.map((line) => Product.findByIdAndUpdate(line.productId, { $inc: { stock: line.qty } })),
  );
}

async function redeemCoupon(coupon, userId, discount) {
  const filter = {
    _id: coupon._id,
    active: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  };
  if (Number(coupon.maxUses) > 0) filter.usedCount = { $lt: coupon.maxUses };
  const updated = await Coupon.findOneAndUpdate(filter, { $inc: { usedCount: 1 } });
  if (!updated) throw new CheckoutError('This coupon is no longer available');

  try {
    return await CouponRedemption.create({
      coupon: coupon._id,
      user: userId,
      code: coupon.code,
      discount,
      oncePerUser: Boolean(coupon.oncePerUser),
    });
  } catch (error) {
    await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: -1 } });
    if (error?.code === 11000) throw new CheckoutError('You have already used this coupon');
    throw error;
  }
}

async function releaseCoupon(redemption) {
  if (!redemption) return;
  await CouponRedemption.deleteOne({ _id: redemption._id });
  await Coupon.findByIdAndUpdate(redemption.coupon, { $inc: { usedCount: -1 } });
}

export async function placeCheckoutOrder({ userId, shipping, couponCode }) {
  assertShipping(shipping);
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) throw new CheckoutError('Cart is empty');

  const lines = cartLines(cart);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const coupon = await findCoupon(couponCode, userId, subtotal);
  const discount = discountFor(coupon, subtotal);
  const bill = priceQuote(subtotal, discount);

  const taken = await takeStock(lines);
  let redemption = null;
  let order = null;
  try {
    if (coupon) redemption = await redeemCoupon(coupon, userId, discount);
    order = await Order.create({
      user: userId,
      items: lines.map((line) => ({
        product: line.productId,
        name: line.name,
        price: line.price,
        qty: line.qty,
        image: line.image,
      })),
      shipping,
      subtotal: bill.subtotal,
      discount: bill.discount,
      shippingFee: bill.shipping,
      tax: bill.tax,
      total: bill.total,
      coupon: coupon
        ? { code: coupon.code, type: coupon.type, value: coupon.value }
        : undefined,
      couponUsed: Boolean(coupon),
      status: 'Pending',
    });
    if (redemption) {
      redemption.order = order._id;
      await redemption.save();
    }
    cart.items = [];
    await cart.save();
    try {
      await rememberShippingAddress(userId, shipping);
    } catch (saveError) {
      console.error('Could not save shipping address', saveError);
    }
    return order;
  } catch (error) {
    await restoreStock(taken);
    await releaseCoupon(redemption);
    if (order?._id) await Order.deleteOne({ _id: order._id });
    throw error;
  }
}
