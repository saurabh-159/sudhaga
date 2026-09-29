import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { backfillAddresses, rememberShippingAddress } from '@/lib/shippingAddress';

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();
    let user = await User.findById(session.id);
    if (!user) return err('User not found', 404);
    if (!user.addresses?.length) user = await backfillAddresses(user);
    user = await User.findById(user._id).select('-password');
    return ok(user);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req) {
  try {
    const session = await requireAuth();
    await connectDB();
    const { name, phone, address, shipping } = await req.json();
    if (shipping) await rememberShippingAddress(session.id, shipping);

    const patch = {
      ...(name ? { name } : {}),
      ...(phone !== undefined && !shipping ? { phone } : {}),
      ...(address && !shipping ? { address } : {}),
    };
    if (Object.keys(patch).length) {
      await User.findByIdAndUpdate(session.id, patch);
    }

    if (!shipping && address?.line1) {
      const existing = await User.findById(session.id).select('name phone email');
      await rememberShippingAddress(session.id, {
        name: name || existing?.name,
        phone: phone ?? existing?.phone,
        email: existing?.email,
        address: address.line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    }

    const user = await User.findById(session.id).select('-password');
    return ok(user);
  } catch (e) {
    return catchErr(e);
  }
}
