import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readCouponBody } from '@/lib/couponInput';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return ok(coupons);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    const payload = readCouponBody(await req.json());
    const coupon = await Coupon.create(payload);
    return ok(coupon, 201);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    if (e?.code === 11000) return err('A coupon with this code already exists');
    return catchErr(e);
  }
}
