import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const user = await User.findById(id).select('-password');
    return ok(user);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await req.json();
    const { id } = await params;
    const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');
    return ok(user);
  } catch (e) {
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    await User.findByIdAndDelete(id);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}