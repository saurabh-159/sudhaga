import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import Product from '@/models/Product';
import { requireAuth } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { productIds = [] } = await req.json();
    const ids = (Array.isArray(productIds) ? productIds : [])
      .map(String)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const found = await Product.find({ _id: { $in: ids } }).select('_id');
    const valid = new Set(found.map((product) => String(product._id)));

    let wishlist = await Wishlist.findOne({ user: user.id });
    if (!wishlist) wishlist = await Wishlist.create({ user: user.id, products: [] });
    const have = new Set(wishlist.products.map((id) => String(id)));
    for (const id of valid) {
      if (!have.has(id)) wishlist.products.push(id);
    }

    await wishlist.save();
    await wishlist.populate('products');
    return ok(wishlist);
  } catch (e) {
    return catchErr(e);
  }
}
