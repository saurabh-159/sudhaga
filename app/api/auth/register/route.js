import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { ok, err, catchErr } from '@/lib/utils';
import { registerSchema } from '@/validations/authValidation';

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = registerSchema.parse(await req.json());
    const existing = await User.findOne({ email });
    if (existing) return err('Email already registered', 409);

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: 'user',
    });

    const token = await signToken({ id: String(user._id), role: user.role });
    const res = ok(
      { user: { id: String(user._id), name: user.name, email: user.email, role: user.role } },
      201,
    );
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
