import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';

export async function GET(_, { params }) {
  try {
    const user = await requireAuth();
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) return err('Order not found', 404);
    if (user.role !== 'admin' && order.user._id.toString() !== user.id) {
      return err('Forbidden', 403);
    }
    return ok(order);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { status } = await req.json();
    const { id } = await params;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    return ok(order);
  } catch (e) {
    return catchErr(e);
  }
}