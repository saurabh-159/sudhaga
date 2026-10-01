import Link from 'next/link';
import ProductGrid from '@/components/user/ProductGrid';
import ProductFilters from '@/components/user/ProductFilters';
import Pagination from '@/components/ui/Pagination';
import { getListingFacets, listFilteredProducts, listProducts } from '@/lib/catalog';
import { pageNumber, productsCanonical } from '@/lib/canonical';
import { clearedFilters, listingHref, parseListingFilters } from '@/lib/listingQuery';
import { metaDescription } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const search = String(sp?.search || '').trim();
  const page = pageNumber(sp?.page);
  const title = search ? `Results for “${search}”` : page > 1 ? `All Products, page ${page}` : 'All Products';
  const description = metaDescription(
    search
      ? `Search results for ${search} at Sudhaga.`
      : 'Shop Sudhaga ethnic wear — suit sets, lehenga sets, and kurta sets.',
  );
  const canon = productsCanonical(sp);
  let pagination;
  if (!canon.robots) {
    const listing = await listProducts(page, 12, '').catch(() => null);
    if (listing && listing.pages > 1) {
      pagination = {};
      if (page > 1) pagination.previous = page === 2 ? '/products' : `/products?page=${page - 1}`;
      if (page < listing.pages) pagination.next = `/products?page=${page + 1}`;
    }
  }
  return {
    ...pageHead({
      title,
      description,
      canonical: canon.alternates.canonical,
      indexable: !canon.robots,
    }),
    ...(pagination ? { pagination } : {}),
  };
}

export default async function ProductsPage({ searchParams }) {
  const sp = await searchParams;
  const filters = parseListingFilters(sp);
  const requestedPage = pageNumber(sp?.page);
  let listing;
  let facets;
  try {
    [listing, facets] = await Promise.all([
      listFilteredProducts({ page: requestedPage, limit: 12, filters }),
      getListingFacets({ search: filters.search }),
    ]);
  } catch {
    return (
      <p className="px-4 py-16 text-center">Products are temporarily unavailable. Please try again.</p>
    );
  }

  const clearHref = listingHref('/products', clearedFilters(filters));

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-neutral-900" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">Shop</p>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          {filters.search ? `Results for “${filters.search}”` : 'All Products'}
        </h1>
      </div>
      <ProductFilters pathname="/products" filters={filters} facets={facets} total={listing.total} showCategories>
        {listing.products.length ? (
          <ProductGrid products={listing.products} />
        ) : (
          <div className="rounded-3xl border border-black/[0.06] bg-[#faf7f3] px-6 py-16 text-center">
            <h2 className="text-xl font-semibold text-neutral-950">No pieces match these filters</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500">
              Try another category, price, or size, or clear the filters to see the full edit.
            </p>
            <Link href={clearHref} className="mt-6 inline-flex rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-white">
              Clear filters
            </Link>
          </div>
        )}
        <Pagination
          current={listing.page}
          total={listing.pages}
          hrefFor={(page) => listingHref('/products', filters, page)}
        />
      </ProductFilters>
    </div>
  );
}
