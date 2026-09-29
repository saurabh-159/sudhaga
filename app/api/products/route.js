import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { requireAdmin } from '@/lib/auth';
import { ok, catchErr } from '@/lib/utils';
import { productSchema } from '@/validations/productValidation';

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const filter = {};
    if (category) {
      const cat = await Category.findOne({ slug: category });
      filter.category = cat ? cat._id : category;
    }
    if (search) filter.name = { $regex: search, $options: 'i' };

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').skip(skip).limit(limit).sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    return ok({ products, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    const body = await req.json();
    const parsed = productSchema.parse(body);
    const slug = parsed.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const product = await Product.create({ ...parsed, slug });
    return ok(product, 201);
  } catch (e) {
    return catchErr(e);
  }
}