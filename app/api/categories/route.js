import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return ok(categories);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-');
    const category = await Category.create({ ...body, slug });
    return ok(category, 201);
  } catch (e) {
    return catchErr(e);
  }
}