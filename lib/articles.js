import { connectDB } from '@/lib/mongodb';
import Article from '@/models/Article';
import { slugify } from '@/lib/articleInput';

const SEED = [
  {
    title: 'How to choose a suit set',
    slug: 'how-to-choose-a-suit-set',
    excerpt: 'A short guide to fabric, occasion, and fit before you order a Sudhaga suit set.',
    body: [
      'Start with the occasion. A chanderi suit with embroidery suits a festival or wedding function. A cotton kurta set is easier for everyday wear and travel.',
      'Check the fabric name on the product page, then the size chart, before you add the set to your bag. Photos show the colour and work; the description is the place to confirm what is included in the set.',
      'If two colours feel close, open both product pages and compare the price, the original price, and the stock note. A set that is out of stock stays on the site so you can see it, but it cannot be ordered until it is back.',
    ].join('\n\n'),
    focusKeyword: 'suit set',
    links: [
      { label: 'Shop suit sets', href: '/categories/suit-sets' },
      { label: 'Shop kurta sets', href: '/categories/kurta-sets' },
      { label: 'Browse all products', href: '/products' },
    ],
    published: true,
  },
  {
    title: 'Shipping, delivery, and returns',
    slug: 'shipping-and-returns',
    excerpt: 'What to expect after you place a Sudhaga order, and where to read the shipping and return pages.',
    body: [
      'After checkout, the order page is the record of what you bought. Delivery timing and the areas we ship to are written on the shipping page, so that page stays the source for those details.',
      'If a size or colour needs to change, use the returns page before you send anything back. It explains the window and what is required. Questions about a specific order can go through the contact page.',
    ].join('\n\n'),
    focusKeyword: 'shipping and returns',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Contact', href: '/contact' },
    ],
    published: true,
  },
];

function shape(article) {
  return {
    id: String(article._id),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    body: article.body || '',
    image: article.image || '',
    imageAlt: article.imageAlt || article.title,
    seoTitle: article.seoTitle || '',
    metaDescription: article.metaDescription || '',
    focusKeyword: article.focusKeyword || '',
    links: (article.links || []).map((link) => ({ label: link.label, href: link.href })),
    published: article.published !== false,
    publishedAt: article.createdAt ? new Date(article.createdAt).toISOString() : null,
    updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : null,
  };
}

export async function ensureArticles() {
  if ((await Article.countDocuments()) > 0) return;
  await Promise.all(
    SEED.map((article) => Article.updateOne({ slug: article.slug }, { $setOnInsert: article }, { upsert: true }))
  );
}

export async function uniqueArticleSlug(preferred, currentId) {
  const base = slugify(preferred);
  let slug = base;
  let n = 2;
  while (await Article.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

export async function listPublishedArticles() {
  await connectDB();
  await ensureArticles();
  const articles = await Article.find({ published: true }).sort({ createdAt: -1 }).lean();
  return articles.map(shape);
}

export async function getPublishedArticle(slug) {
  await connectDB();
  await ensureArticles();
  const article = await Article.findOne({ slug, published: true }).lean();
  if (!article) return null;
  const others = await Article.find({ published: true, slug: { $ne: slug } })
    .sort({ createdAt: -1 })
    .limit(3)
    .select('title slug')
    .lean();
  return {
    article: shape(article),
    related: others.map((item) => ({ title: item.title, href: `/blog/${item.slug}` })),
  };
}
