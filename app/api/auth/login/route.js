import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { ok, err, catchErr } from '@/lib/utils';
import { loginSchema } from '@/validations/authValidation';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password, portal = 'admin' } = loginSchema.parse(body);

    const user = await User.findOne({ email });
    if (!user) return err('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return err('Invalid credentials', 401);
    if (portal !== 'store' && user.role !== 'admin') return err('Unauthorized', 403);

    const token = await signToken({ id: String(user._id), role: user.role });
    const res = ok({
      user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
    });
    res.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (e) {
    return catchErr(e);
  }
}