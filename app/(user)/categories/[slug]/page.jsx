'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProductGrid from '@/components/user/ProductGrid';
import { api, shapeCategory, shapeProduct } from '@/lib/apiClient';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [otherCategories, setOtherCategories] = useState([]);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setMissing(false);
    setCategory(null);
    Promise.all([api('/api/categories'), api('/api/products?limit=100')])
      .then(([cats, prod]) => {
        const list = (cats || []).map(shapeCategory);
        const found = list.find((item) => item.slug === slug);
        if (!found) {
          setMissing(true);
          return;
        }
        const products = (prod.products || []).map(shapeProduct);
        setCategory(found);
        setCatalog(products);
        setFiltered(products.filter((product) => product.category === slug));
        setOtherCategories(list.filter((item) => item.slug !== slug).slice(0, 4));
      })
      .catch(() => setMissing(true));
  }, [slug]);

  if (missing) return <p className="px-4 py-16 text-center">Category not found.</p>;
  if (!category) return <p className="px-4 py-16 text-center">Loading…</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
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
              {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-[2.75rem] md:leading-none">
            {category.name}
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/75 md:text-[15px]">
            {category.blurb || `Shop our ${category.name.toLowerCase()} collection.`}
          </p>
        </div>
      </section>

      {/* Toolbar — Result count + Sort */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            All {category.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          {/* Sort dropdown (UI only) */}
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <select
              defaultValue="featured"
              className="w-full appearance-none bg-white border border-gray-200 hover:border-gray-300
                         rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700
                         focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
                         transition-colors cursor-pointer sm:w-auto"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* View toggle */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button aria-label="Grid view" className="p-2 rounded-lg bg-white shadow-sm text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button aria-label="List view" className="p-2 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-gray-500 font-medium">Active:</span>
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 
                         text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          {category.name}
          <button aria-label="Remove filter" className="hover:text-purple-900 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
        <button className="text-xs text-gray-500 hover:text-gray-900 font-medium underline underline-offset-2">
          Clear all
        </button>
      </div>

      {/* Products */}
      {filtered.length > 0 ? (
        <ProductGrid products={filtered} />
      ) : (
        /* Empty state */
        <div className="text-center py-20 px-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 
                          flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
            We couldn't find any products in this category right now. Check back soon or explore other categories.
          </p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold 
                       px-6 py-3 rounded-full hover:bg-gray-800 transition-all duration-300
                       hover:scale-105 active:scale-95"
          >
            Browse Categories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}

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
              const count = catalog.filter((p) => p.category === c.slug).length;
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
                    alt={c.name}
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