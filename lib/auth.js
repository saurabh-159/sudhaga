import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function requireAuth() {
  const jar = await cookies();
  const token = jar.get('token')?.value;
  const user = token ? await verifyToken(token) : null;
  if (!user?.id) {
    const error = new Error('Unauthorized');
    throw error;
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== 'admin') {
    const error = new Error('Forbidden');
    throw error;
  }
  return user;
}
