import { connectDB } from '@/lib/mongodb';
import Wishlist from '@/models/Wishlist';
import { requireAuth } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();
    let wl = await Wishlist.findOne({ user: user.id }).populate('products');
    if (!wl) wl = await Wishlist.create({ user: user.id, products: [] });
    return ok(wl);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { productId } = await req.json();
    let wl = await Wishlist.findOne({ user: user.id });
    if (!wl) wl = await Wishlist.create({ user: user.id, products: [] });

    const exists = wl.products.find((p) => p.toString() === productId);
    if (exists) wl.products = wl.products.filter((p) => p.toString() !== productId);
    else wl.products.push(productId);

    await wl.save();
    await wl.populate('products');
    return ok(wl);
  } catch (e) {
    return catchErr(e);
  }
}