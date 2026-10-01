import { listSitemapEntries } from '@/lib/catalog';
import { listPublishedArticles } from '@/lib/articles';
import { listExtraPolicies } from '@/lib/policies';
import { policyPath } from '@/lib/policyInput';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const staticPages = [
    { path: '', priority: 1 },
    { path: '/products', priority: 0.8 },
    { path: '/categories', priority: 0.8 },
    { path: '/about', priority: 0.4 },
    { path: '/contact', priority: 0.4 },
    { path: '/shipping', priority: 0.4 },
    { path: '/returns', priority: 0.4 },
    { path: '/privacy', priority: 0.4 },
    { path: '/terms', priority: 0.4 },
    { path: '/blog', priority: 0.5 },
  ].map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: page.priority,
  }));

  try {
    const [{ products, categories }, articles, extraPolicies] = await Promise.all([
      listSitemapEntries(),
      listPublishedArticles(),
      listExtraPolicies(),
    ]);
    return [
      ...staticPages,
      ...extraPolicies.map((policy) => ({
        url: `${siteUrl}${policyPath(policy)}`,
        lastModified: policy.updatedAt ? new Date(policy.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.3,
      })),
      ...articles.map((article) => ({
        url: `${siteUrl}/blog/${article.slug}`,
        lastModified: article.updatedAt || now,
        changeFrequency: 'weekly',
        priority: 0.5,
      })),
      ...categories.map((category) => ({
        url: `${siteUrl}/categories/${category.slug}`,
        lastModified: category.updatedAt || now,
        changeFrequency: 'daily',
        priority: 0.7,
      })),
      ...products.map((product) => ({
        url: `${siteUrl}/products/${product.slug}`,
        lastModified: product.updatedAt || now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })),
    ];
  } catch {
    return staticPages;
  }
}
