import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductGrid from '@/components/user/ProductGrid';
import ProductFilters from '@/components/user/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { getCategoryView, getListingFacets, listFilteredProducts } from '@/lib/catalog';
import { cleanCanonical, pageNumber } from '@/lib/canonical';
import { clearedFilters, listingHref, parseListingFilters } from '@/lib/listingQuery';
import { pageTitle } from '@/lib/storePath';
import { metaDescription } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const view = await getCategoryView(slug).catch(() => null);
  if (!view) {
    return pageHead({
      title: 'Category not found',
      description: 'That category is not available at Sudhaga.',
      canonical: '/categories',
      indexable: false,
    });
  }
  const title = pageTitle(view.category.seoTitle, view.category.name);
  const description = metaDescription(
    view.category.metaDescription || view.category.blurb,
    `Shop ${view.category.name} at Sudhaga.`,
  );
  const canon = cleanCanonical(`/categories/${view.category.slug}`, sp);
  return pageHead({
    title,
    description,
    canonical: canon.alternates.canonical,
    indexable: !canon.robots,
    images: view.category.image
      ? [{ url: view.category.image, alt: view.category.imageAlt || view.category.name }]
      : undefined,
  });
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const filters = { ...parseListingFilters(sp), categories: [] };
  const pathname = `/categories/${slug}`;
  let view;
  let listing;
  let facets;
  try {
    view = await getCategoryView(slug);
    if (view) {
      [listing, facets] = await Promise.all([
        listFilteredProducts({
          page: pageNumber(sp?.page),
          limit: 12,
          categorySlug: slug,
          filters,
        }),
        getListingFacets({ categorySlug: slug, search: filters.search }),
      ]);
    }
  } catch {
    return (
      <p className="px-4 py-16 text-center">This category is temporarily unavailable. Please try again.</p>
    );
  }
  if (!view || !listing || !facets) notFound();

  const { category, others: otherCategories } = view;
  const clearHref = listingHref(pathname, clearedFilters(filters));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', href: '/' },
          { name: 'Categories', href: '/categories' },
          { name: category.name, href: `/categories/${category.slug}` },
        ])}
      />
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/categories" className="hover:text-gray-900 transition-colors">
          Categories
        </Link>
        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero */}
      <section className="relative mb-8 overflow-hidden rounded-[1.25rem] md:mb-10 md:rounded-[1.5rem]">
        <div
          className="absolute inset-0"
          style={
            category.imageFit === 'contain'
              ? { backgroundColor: category.imageBg || '#f3ebe3' }
              : undefined
          }
        >
          <img
            src={category.image}
            alt=""
            aria-hidden
            className={`h-full w-full ${
              category.imageFit === 'contain'
                ? 'object-contain object-right'
                : `object-cover ${
                    category.imageFocus === 'top'
                      ? 'object-top'
                      : category.imageFocus === 'bottom'
                        ? 'object-bottom'
                        : 'object-center'
                  }`
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[200px] flex-col justify-end px-6 py-8 sm:min-h-[240px] sm:px-8 md:min-h-[280px] md:px-10 md:py-10">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/80">
              {category.count} {category.count === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-none">
            {category.name}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 md:text-[15px]">
            {category.blurb || `Shop our ${category.name.toLowerCase()} collection.`}
          </p>
          {category.answerText ? (
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90">{category.answerText}</p>
          ) : null}
        </div>
      </section>

      <ProductFilters pathname={pathname} filters={filters} facets={facets} total={listing.total}>
        {listing.products.length ? (
          <ProductGrid products={listing.products} />
        ) : (
          <div className="rounded-3xl border border-black/[0.06] bg-[#faf7f3] px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-neutral-950">No pieces match these filters</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              {listing.total === 0 && category.count === 0
                ? 'Nothing is listed in this category yet. Explore the rest of the edit.'
                : 'Try another price, size, or colour, or clear the filters to see this collection.'}
            </p>
            {category.count === 0 ? (
              <Link href="/categories" className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white">
                Browse categories
              </Link>
            ) : (
              <Link href={clearHref} className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white">
                Clear filters
              </Link>
            )}
          </div>
        )}
        <Pagination
          current={listing.page}
          total={listing.pages}
          hrefFor={(page) => listingHref(pathname, filters, page)}
        />
      </ProductFilters>

      {/* Related categories */}
      {otherCategories.length > 0 && (
        <section className="mt-14 border-t border-neutral-200/80 pt-12 md:mt-16 md:pt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-neutral-900" />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">
                  Collections
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 md:text-[1.75rem]">
                Explore more
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Other looks from the Sudhaga edit
              </p>
            </div>
            <Link
              href="/categories"
              className="group hidden items-center gap-1.5 text-sm font-medium text-neutral-700 transition hover:text-neutral-950 md:inline-flex"
            >
              Shop all
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            {otherCategories.map((c) => {
              const count = c.count;
              const contain = c.imageFit === 'contain';
              const focusClass =
                c.imageFocus === 'top'
                  ? 'object-top'
                  : c.imageFocus === 'bottom'
                    ? 'object-bottom'
                    : 'object-center';

              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="group relative aspect-[3/4] overflow-hidden rounded-[1.25rem] shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(0,0,0,0.4)]"
                  style={contain ? { backgroundColor: c.imageBg || '#e8e0d6' } : undefined}
                >
                  <img
                    src={c.image}
                    alt={c.imageAlt || c.name}
                    className={`h-full w-full transition duration-700 ease-out group-hover:scale-[1.04] ${
                      contain ? 'object-contain' : `object-cover ${focusClass}`
                    }`}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition duration-300 group-hover:from-black/85" />
                  <span className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
                    <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                      {c.blurb}
                    </span>
                    <span className="block text-base font-semibold leading-none tracking-tight sm:text-lg">
                      {c.name}
                    </span>
                    <span className="mt-2.5 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-white/80">
                        {count === 1 ? '1 item' : `${count} items`}
                      </span>
                      <span className="translate-y-1.5 text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                        Explore →
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}