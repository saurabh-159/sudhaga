import { connectDB } from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readBannerBody } from '@/lib/bannerInput';

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const banner = await Banner.findById(id);
    if (!banner) return err('Banner not found', 404);
    return ok(banner);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const banner = await Banner.findByIdAndUpdate(id, readBannerBody(await req.json()), {
      new: true,
      runValidators: true,
    });
    if (!banner) return err('Banner not found', 404);
    return ok(banner);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) return err('Banner not found', 404);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}
