import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { requireAdmin } from '@/lib/auth';
import { ok, err, catchErr } from '@/lib/utils';
import { readArticleBody } from '@/lib/articleInput';
import { ensureArticles, uniqueArticleSlug } from '@/lib/articles';

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();
    await ensureArticles();
    const articles = await Article.find().sort({ createdAt: -1 });
    return ok(articles);
  } catch (e) {
    return catchErr(e);
  }
}

export async function POST(req) {
  try {
    await requireAdmin();
    await connectDB();
    const input = readArticleBody(await req.json());
    input.slug = await uniqueArticleSlug(input.slug);
    const article = await Article.create(input);
    return ok(article, 201);
  } catch (e) {
    if (e.status) return err(e.message, e.status);
    return catchErr(e);
  }
}
