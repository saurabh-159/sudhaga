import crypto from 'crypto';
import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { ok, err, catchErr } from '@/lib/utils';

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await req.json();

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature) return err('Invalid signature');

    const existing = await Order.findById(orderId);
    if (!existing) return err('Order not found', 404);
    if (user.role !== 'admin' && String(existing.user) !== String(user.id)) return err('Forbidden', 403);

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: 'Paid', paymentId: razorpay_payment_id, razorpayOrderId: razorpay_order_id },
      { new: true }
    );

    return ok(order);
  } catch (e) {
    return catchErr(e);
  }
}