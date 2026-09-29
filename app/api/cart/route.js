import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { lineCap } from '@/lib/pricing';

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();
    let cart = await Cart.findOne({ user: user.id }).populate('items.product');
    if (!cart) cart = await Cart.create({ user: user.id, items: [] });
    return ok(cart);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { productId, qty = 1 } = await req.json();
    if (!mongoose.Types.ObjectId.isValid(productId)) return err('Product not found', 404);
    const product = await Product.findById(productId).select('_id stock');
    if (!product) return err('Product not found', 404);

    let cart = await Cart.findOne({ user: user.id });
    if (!cart) cart = await Cart.create({ user: user.id, items: [] });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    const room = lineCap(product.stock) - (existing?.qty || 0);
    if (room < 1) return err('Not enough stock');
    const amount = Math.max(1, Math.min(room, Number(qty) || 1));
    if (existing) existing.qty += amount;
    else cart.items.push({ product: productId, qty: amount });

    await cart.save();
    await cart.populate('items.product');
    return ok(cart);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { productId, qty } = await req.json();
    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return ok({ items: [] });

    const existing = cart.items.find((i) => i.product.toString() === productId);
    if (!existing) return ok(cart);
    const nextQty = Number(qty);
    if (!Number.isFinite(nextQty) || nextQty < 1) {
      cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    } else {
      const product = await Product.findById(productId).select('stock');
      const cap = lineCap(product?.stock);
      if (cap < 1) return err('This item is out of stock');
      existing.qty = Math.min(cap, Math.floor(nextQty));
    }

    await cart.save();
    await cart.populate('items.product');
    return ok(cart);
  } catch (e) {
    return catchErr(e);
  }
}

export async function DELETE(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { productId } = await req.json();

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return ok({ message: 'Empty' });

    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product');
    return ok(cart);
  } catch (e) {
    return catchErr(e);
  }
}