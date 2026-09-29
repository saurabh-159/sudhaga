import { SignJWT, jwtVerify } from 'jose';

const SECRET = process.env.JWT_SECRET;
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function getKey() {
  if (!SECRET) throw new Error('JWT_SECRET is not set');
  return new TextEncoder().encode(SECRET);
}

export async function signToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES)
    .sign(getKey());
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getKey());
    return payload;
  } catch {
    return null;
  }
}
