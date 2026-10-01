import Link from 'next/link';
import { listCategories } from '@/lib/catalog';
import { cleanCanonical } from '@/lib/canonical';
import { metaDescription } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema } from '@/lib/schema';

const FOCUS_CLASS = {
  top: 'object-top',
  center: 'object-center',
  bottom: 'object-bottom',
};

function itemLabel(count) {
  if (count === 1) return '1 item';
  return `${count} items`;
}

export async function generateMetadata({ searchParams }) {
  const description = metaDescription(
    'Shop Sudhaga by category — festive suits, lehengas, and everyday ethnic wear.',
  );
  const canon = cleanCanonical('/categories', await searchParams);
  return pageHead({
    title: 'Shop by Category',
    description,
    canonical: canon.alternates.canonical,
    indexable: !canon.robots,
  });
}

export default async function CategoriesPage() {
  let categories;
  try {
    categories = await listCategories();
  } catch {
    return (
      <p className="px-4 py-16 text-center">Categories are temporarily unavailable. Please try again.</p>
    );
  }

  const totalPieces = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', href: '/' },
          { name: 'Categories', href: '/categories' },
        ])}
      />
      <nav className="mb-8 flex items-center gap-2 text-xs text-neutral-500 md:text-sm">
        <Link href="/" className="transition-colors hover:text-neutral-900">
          Home
        </Link>
        <span className="text-neutral-300">/</span>
        <span className="font-medium text-neutral-900">Categories</span>
      </nav>

      <header className="mb-8 md:mb-10">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-neutral-900" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">
            Collections
          </p>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950 md:text-[2.5rem] md:leading-none">
          Shop by Category
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-neutral-500 md:text-[15px]">
          {categories.length} collections · {totalPieces} pieces — from festive suits to everyday ethnic.
        </p>
      </header>

      {categories.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => {
            const contain = category.imageFit === 'contain';
            const focusClass = FOCUS_CLASS[category.imageFocus] || 'object-center';

            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-[1.25rem] shadow-[0_10px_28px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(0,0,0,0.4)]"
                style={contain ? { backgroundColor: category.imageBg || '#e8e0d6' } : undefined}
              >
                <img
                  src={category.image}
                    alt={category.imageAlt || category.name}
                  className={`h-full w-full transition duration-700 ease-out group-hover:scale-[1.04] ${
                    contain ? 'object-contain' : `object-cover ${focusClass}`
                  }`}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent transition duration-300 group-hover:from-black/85" />
                <span className="absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-4">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                    {category.blurb}
                  </span>
                  <span className="block text-lg font-semibold leading-none tracking-tight sm:text-xl">
                    {category.name}
                  </span>
                  <span className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-white/80">{itemLabel(category.count)}</span>
                    <span className="translate-y-1.5 text-[11px] font-semibold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      Explore →
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="py-16 text-center text-neutral-500">No categories yet.</p>
      )}
    </div>
  );
}
