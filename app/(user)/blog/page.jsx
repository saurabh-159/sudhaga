import Link from 'next/link';
import { listPublishedArticles } from '@/lib/articles';
import { cleanCanonical } from '@/lib/canonical';
import { pageHead } from '@/lib/pageMeta';

export async function generateMetadata({ searchParams }) {
  const canon = cleanCanonical('/blog', await searchParams);
  return pageHead({
    title: 'Blog',
    description: 'Guides from Sudhaga on choosing ethnic wear, shipping, and returns.',
    canonical: canon.alternates.canonical,
    indexable: !canon.robots,
  });
}

export default async function BlogPage() {
  let articles = [];
  try {
    articles = await listPublishedArticles();
  } catch {
    return <p className="px-4 py-16 text-center">The blog is temporarily unavailable. Please try again.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Blog</h1>
      <p className="mt-3 text-sm leading-relaxed text-neutral-600">
        Short guides for shopping Sudhaga. Each article links back to the shop, shipping, and returns pages.
      </p>
      {articles.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500">No articles yet.</p>
      ) : (
        <ul className="mt-8 space-y-6">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-neutral-200 pb-6">
              <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
                <Link href={`/blog/${article.slug}`} className="hover:underline">
                  {article.title}
                </Link>
              </h2>
              {article.excerpt ? <p className="mt-2 text-sm leading-relaxed text-neutral-600">{article.excerpt}</p> : null}
              <Link href={`/blog/${article.slug}`} className="mt-3 inline-block text-sm font-medium text-neutral-950 underline">
                Read article
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
