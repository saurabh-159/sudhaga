import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';
import { lineCap } from '@/lib/pricing';

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { items = [] } = await req.json();
    let cart = await Cart.findOne({ user: user.id });
    if (!cart) cart = await Cart.create({ user: user.id, items: [] });

    for (const row of Array.isArray(items) ? items : []) {
      const productId = String(row?.productId || '');
      if (!mongoose.Types.ObjectId.isValid(productId)) continue;
      const product = await Product.findById(productId).select('_id stock');
      if (!product) continue;
      const qty = Math.max(1, Math.min(lineCap(product.stock), Number(row.qty) || 1));
      if (lineCap(product.stock) < 1) continue;
      const existing = cart.items.find((item) => item.product.toString() === productId);
      if (existing) existing.qty = Math.min(lineCap(product.stock), existing.qty + qty);
      else cart.items.push({ product: productId, qty });
    }

    await cart.save();
    await cart.populate('items.product');
    return ok(cart);
  } catch (e) {
    return catchErr(e);
  }
}
