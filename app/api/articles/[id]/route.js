import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readArticleBody } from '@/lib/articleInput';
import { uniqueArticleSlug } from '@/lib/articles';

export async function GET(_, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const article = await Article.findById(id);
    if (!article) return err('Article not found', 404);
    return ok(article);
  } catch (e) {
    return catchErr(e);
  }
}

export async function PUT(req, { params }) {
  try {
    await requireAdmin();
    await connectDB();
    const { id } = await params;
    const input = readArticleBody(await req.json());
    input.slug = await uniqueArticleSlug(input.slug, id);
    const article = await Article.findByIdAndUpdate(id, input, { new: true, runValidators: true });
    if (!article) return err('Article not found', 404);
    return ok(article);
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
    const article = await Article.findByIdAndDelete(id);
    if (!article) return err('Article not found', 404);
    return ok({ message: 'Deleted' });
  } catch (e) {
    return catchErr(e);
  }
}
