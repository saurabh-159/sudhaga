import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { productSchema } from '@/validations/productValidation';

export async function GET(_, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) return err('Product not found', 404);
    return ok(product);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const parsed = productSchema.parse({
      ...body,
      price: Number(body.price),
      stock: Number(body.stock || 0),
      ...(body.originalPrice ? { originalPrice: Number(body.originalPrice) } : {}),
      attributes: Array.isArray(body.attributes) ? body.attributes : [],
    });
    const product = await Product.findByIdAndUpdate(id, parsed, { new: true, runValidators: true });
    if (!product) return err('Product not found', 404);
    return ok(product);
  } catch (e) {
    return catchErr(e);
  }
}

export async function DELETE(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    await Product.findByIdAndDelete(id);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}