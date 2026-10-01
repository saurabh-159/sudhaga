import ProductGrid from '@/components/user/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import { listProducts } from '@/lib/catalog';
import { pageNumber, productsCanonical } from '@/lib/canonical';
import { metaDescription } from '@/lib/site';
import { pageHead } from '@/lib/pageMeta';

function listingPath(page, search) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/products?${query}` : '/products';
}

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
  const search = String(sp?.search || '').trim();
  const requestedPage = pageNumber(sp?.page);
  let listing;
  try {
    listing = await listProducts(requestedPage, 12, search);
  } catch {
    return (
      <p className="px-4 py-16 text-center">Products are temporarily unavailable. Please try again.</p>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-neutral-900" />
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">Shop</p>
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 sm:text-3xl">
          {search ? `Results for “${search}”` : 'All Products'}
        </h1>
      </div>
      <ProductGrid products={listing.products} />
      <Pagination
        current={listing.page}
        total={listing.pages}
        hrefFor={(page) => listingPath(page, search)}
      />
    </div>
  );
}
