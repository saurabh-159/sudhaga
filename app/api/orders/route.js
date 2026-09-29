import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { placeCheckoutOrder, CheckoutError } from '@/lib/checkoutBill';

export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();
    const filter = user.role === 'admin' ? {} : { user: user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return ok(orders);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const body = await req.json();
    const order = await placeCheckoutOrder({
      userId: user.id,
      shipping: body.shipping,
      couponCode: body.couponCode,
    });
    return ok(order, 201);
  } catch (e) {
    if (e instanceof CheckoutError) return err(e.message, e.status);
    return catchErr(e);
  }
}