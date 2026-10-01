import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readStoreProfile } from '@/lib/storeProfileInput';
import { readStoreProfileRecord, saveStoreProfile } from '@/lib/storeProfile';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    return ok(await readStoreProfileRecord());
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}

export async function PUT(req) {
  try {
    await requireAdmin();
    await connectDB();
    const input = readStoreProfile(await req.json());
    return ok(await saveStoreProfile(input));
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}
