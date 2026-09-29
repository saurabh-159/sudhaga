'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/user/ProductGrid';
import Pagination from '@/components/ui/Pagination';
import { api, shapeProduct } from '@/lib/apiClient';
import { Suspense } from 'react';

function ProductsBrowser() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const query = new URLSearchParams({ page: String(page), limit: '12' });
    if (search) query.set('search', search);
    api(`/api/products?${query}`)
      .then((data) => {
        setProducts((data.products || []).map(shapeProduct));
        setPages(data.pages || 1);
      })
      .catch(() => setProducts([]));
  }, [page, search]);

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
      <ProductGrid products={products} />
      <Pagination current={page} total={pages} onChange={setPage} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<p className="px-4 py-8">Loading products…</p>}>
      <ProductsBrowser />
    </Suspense>
  );
}
