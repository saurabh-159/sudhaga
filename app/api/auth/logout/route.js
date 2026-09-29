import { ok } from '@/lib/utils';

export async function POST() {
  const res = ok({ message: 'Logged out' });
  res.cookies.set('token', '', { maxAge: 0, path: '/' });
  return res;
}