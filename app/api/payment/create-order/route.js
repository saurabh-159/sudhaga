import { getRazorpay } from '@/lib/razorpay';
import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { ok, err, catchErr } from '@/lib/utils';

export async function POST() {
  try {
    const user = await requireAuth();
    await connectDB();

    const cart = await Cart.findOne({ user: user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) return err('Cart is empty');

    const total = cart.items.reduce((s, i) => s + i.product.price * i.qty, 0);

    const order = await getRazorpay().orders.create({
      amount: total * 100, // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    return ok({ order, amount: total, key: process.env.RAZORPAY_KEY_ID });
  } catch (e) {
    return catchErr(e);
  }
}