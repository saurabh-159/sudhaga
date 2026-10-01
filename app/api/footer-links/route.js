import { connectDB } from '@/lib/mongodb';
import FooterLink from '@/models/FooterLink';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readFooterLinkBody } from '@/lib/footerLinkInput';
import { ensureFooterLinks } from '@/lib/footerLinks';

function duplicate(error) {
  return error?.code === 11000;
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    await ensureFooterLinks();
    const links = await FooterLink.find().sort({ section: 1, sort: 1, label: 1 });
    return ok(links);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    await ensureFooterLinks();
    const link = await FooterLink.create(readFooterLinkBody(await req.json()));
    return ok(link, 201);
  } catch (e) {
    if (duplicate(e)) return err('That text is already used in this column', 400);
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}
