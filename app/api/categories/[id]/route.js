import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';

export async function GET(_, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const category = await Category.findById(id);
    if (!category) return err('Category not found', 404);
    return ok(category);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await req.json();
    const { id } = await params;
    const category = await Category.findByIdAndUpdate(id, body, { new: true });
    return ok(category);
  } catch (e) {
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    await Category.findByIdAndDelete(id);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}