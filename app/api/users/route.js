import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return ok(users);
  } catch (e) {
    return catchErr(e);
  }
}