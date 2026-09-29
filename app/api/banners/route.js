import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readBannerBody } from '@/lib/bannerInput';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    const banners = await Banner.find().sort({ placement: 1, order: 1, createdAt: -1 });
    return ok(banners);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    const banner = await Banner.create(readBannerBody(await req.json()));
    return ok(banner, 201);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}
