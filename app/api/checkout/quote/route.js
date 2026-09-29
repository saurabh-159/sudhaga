import { requireAuth } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { quoteCheckout, CheckoutError } from '@/lib/checkoutBill';
import { ok, err, catchErr } from '@/lib/utils';

export async function POST(req) {
  try {
    const user = await requireAuth();
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const quote = await quoteCheckout(user.id, body.couponCode || '');
    return ok(quote);
  } catch (e) {
    if (e instanceof CheckoutError) return err(e.message, e.status);
    return catchErr(e);
  }
}
