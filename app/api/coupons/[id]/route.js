import { connectDB } from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readCouponBody } from '@/lib/couponInput';

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return err('Coupon not found', 404);
    return ok(coupon);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const payload = readCouponBody(await req.json());
    const coupon = await Coupon.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!coupon) return err('Coupon not found', 404);
    return ok(coupon);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    if (e?.code === 11000) return err('A coupon with this code already exists');
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return err('Coupon not found', 404);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}
