import { connectDB } from '@/lib/mongodb';
import FooterLink from '@/models/FooterLink';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readFooterLinkBody } from '@/lib/footerLinkInput';

function duplicate(error) {
  return error?.code === 11000;
}

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const link = await FooterLink.findById(id);
    if (!link) return err('Link not found', 404);
    return ok(link);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const link = await FooterLink.findByIdAndUpdate(id, readFooterLinkBody(await req.json()), {
      new: true,
      runValidators: true,
    });
    if (!link) return err('Link not found', 404);
    return ok(link);
  } catch (e) {
    if (duplicate(e)) return err('That text is already used in this column', 400);
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const link = await FooterLink.findByIdAndDelete(id);
    if (!link) return err('Link not found', 404);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}
