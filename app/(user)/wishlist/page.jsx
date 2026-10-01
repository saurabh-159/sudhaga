'use client';

import Link from 'next/link';
import ProductGrid from '@/components/user/ProductGrid';
import { useCatalog } from '@/components/user/CatalogProvider';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems: items, user } = useCatalog();

  return (
    <div className="relative mx-auto max-w-[1400px] px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(208,177,90,0.08),_transparent_60%)]"
      />

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Saved pieces
            </p>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-none">
            My Wishlist
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            {items.length > 0
              ? `${items.length} ${items.length === 1 ? 'piece' : 'pieces'} you love`
              : 'Save pieces you love and come back anytime'}
            {!user && items.length > 0 ? ' · saved on this device until you login' : ''}
          </p>
        </div>

        {items.length > 0 ? (
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 self-start rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800 sm:self-end"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
            Keep shopping
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-[#faf7f3] px-6 py-20 text-center md:py-28">
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 scale-150 rounded-full bg-[var(--brand-gold,#D0B15A)]/15 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(22,19,17,0.08)] ring-1 ring-black/5">
              <Heart className="h-8 w-8 text-neutral-700" strokeWidth={1.4} />
            </div>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-950 md:text-3xl">
            Your wishlist is empty
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Tap the heart on any product to save it here for later.
          </p>
          <Link
            href="/products"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800"
          >
            Browse collection
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-black/[0.05]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3ebe3]">
                <Heart className="h-4 w-4 fill-neutral-900 text-neutral-900" strokeWidth={1.6} />
              </span>
              <p className="text-sm text-neutral-600">
                <span className="font-semibold text-neutral-950">{items.length}</span> saved for later
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-medium text-neutral-500 underline decoration-neutral-300 underline-offset-4 transition hover:text-neutral-900 hover:decoration-neutral-900"
            >
              Find more
            </Link>
          </div>

          <ProductGrid products={items} />
        </>
      )}
    </div>
  );
}
