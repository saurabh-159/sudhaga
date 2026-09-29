import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';
import { ok, err, catchErr } from '@/lib/utils';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';

function setSession(res, token) {
  res.cookies.set('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body?.idToken;
    if (!idToken || typeof idToken !== 'string') return err('Missing Google token', 400);

    const profile = await verifyFirebaseIdToken(idToken);
    const email = String(profile.email).toLowerCase();
    const name = String(profile.name || email.split('@')[0]).trim() || 'Sudhaga customer';
    const avatar = typeof profile.picture === 'string' ? profile.picture : '';

    await connectDB();
    let user = await User.findOne({ $or: [{ googleId: profile.sub }, { email }] });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId: profile.sub,
        avatar,
        role: 'user',
        password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10),
      });
    } else {
      if (!user.googleId) user.googleId = profile.sub;
      if (avatar) user.avatar = avatar;
      if (!user.name) user.name = name;
      await user.save();
    }

    const token = await signToken({ id: String(user._id), role: user.role });
    return setSession(
      ok({
        user: { id: String(user._id), name: user.name, email: user.email, role: user.role },
      }),
      token,
    );
  } catch (e) {
    if (e?.code === 'ERR_JWT_EXPIRED' || e?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      return err('Google login expired. Try again.', 401);
    }
    return catchErr(e);
  }
}
