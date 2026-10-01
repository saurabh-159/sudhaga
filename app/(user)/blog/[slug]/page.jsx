import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/user/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { getPublishedArticle } from '@/lib/articles';
import { cleanCanonical } from '@/lib/canonical';
import { pageTitle } from '@/lib/storePath';
import { metaDescription } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';
import { articleSchema, breadcrumbSchema } from '@/lib/schema';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const articleView = await getPublishedArticle(slug).catch(() => null);
  if (!articleView) {
    return pageHead({
      title: 'Article not found',
      description: 'That article is not available at Sudhaga.',
      canonical: '/blog',
      indexable: false,
    });
  }
  const { article } = articleView;
  const title = pageTitle(article.seoTitle, article.title);
  const description = metaDescription(article.metaDescription || article.excerpt || article.body);
  const canon = cleanCanonical(`/blog/${article.slug}`, await searchParams);
  return pageHead({
    title,
    description,
    canonical: canon.alternates.canonical,
    indexable: !canon.robots,
    type: 'article',
    images: article.image ? [{ url: article.image, alt: article.imageAlt || article.title }] : undefined,
  });
}

function paragraphs(body) {
  return String(body || '')
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  let view;
  try {
    view = await getPublishedArticle(slug);
  } catch {
    return <p className="px-4 py-16 text-center">This article is temporarily unavailable. Please try again.</p>;
  }
  if (!view) notFound();

  const { article, related } = view;
  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: article.title, href: `/blog/${article.slug}` },
  ];
  const shopLinks = article.links.length
    ? article.links
    : [
        { label: 'All products', href: '/products' },
        { label: 'Categories', href: '/categories' },
      ];

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd data={articleSchema(article)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">{article.title}</h1>
      {article.excerpt ? <p className="mt-4 text-base leading-relaxed text-neutral-600">{article.excerpt}</p> : null}
      {article.image ? (
        <img src={article.image} alt={article.imageAlt || article.title} className="mt-6 w-full rounded-2xl object-cover" />
      ) : null}
      <div className="mt-6 space-y-4">
        {paragraphs(article.body).map((paragraph, index) => (
          <p key={index} className="text-sm leading-relaxed text-neutral-700">
            {paragraph}
          </p>
        ))}
      </div>
      <section className="mt-10 border-t border-neutral-200 pt-6">
        <h2 className="text-lg font-semibold text-neutral-950">From the shop</h2>
        <ul className="mt-3 space-y-2">
          {shopLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="text-sm font-medium text-neutral-950 underline">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      {related.length ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-neutral-950">More articles</h2>
          <ul className="mt-3 space-y-2">
            {related.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm font-medium text-neutral-950 underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
