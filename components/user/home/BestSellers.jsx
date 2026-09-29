'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductQuickActions from '@/components/user/ProductQuickActions';
import 'swiper/css';

function money(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function categoryLabel(slug) {
  if (!slug) return 'Best seller';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function BestSellerCard({ product }) {
  const hasDiscount = product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const href = `/products/${product.id}`;

  return (
    <article className="flex h-full flex-col bg-white">
      <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          <img src={product.image} alt="" className="h-full w-full object-cover" />
        </Link>

        <ProductQuickActions product={product} />

        <span className="pointer-events-none absolute bottom-2 left-2 z-10 bg-white px-1.5 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-neutral-900 shadow-sm sm:bottom-4 sm:left-3 sm:px-2.5 sm:py-1.5 sm:text-[11px]">
          Buy 1 Get 1 Free
        </span>
      </div>

      <div className="flex flex-col gap-2 pt-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:pt-3">
        <div className="min-w-0">
          <Link href={href}>
            <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-neutral-950 sm:text-[15px]">{product.name}</h3>
          </Link>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400 sm:text-[11px] sm:tracking-[0.18em]">
            {categoryLabel(product.category)}
          </p>
          {product.stock > 0 ? (
            <span className="mt-2.5 hidden w-fit items-center gap-1.5 rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white sm:inline-flex">
              Ready to ship
              <Zap className="h-3.5 w-3.5 fill-white" />
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center gap-x-2 gap-y-1 sm:flex-col sm:items-end sm:text-right">
          <span className="text-[13px] font-bold text-neutral-950 sm:text-[15px]">{money(product.price)}</span>
          {hasDiscount ? (
            <span className="text-xs text-neutral-400 line-through sm:mt-1 sm:text-sm">{money(product.originalPrice)}</span>
          ) : null}
          {discount > 0 ? (
            <span className="rounded-sm bg-[#ffe4ec] px-1.5 py-0.5 text-[10px] font-semibold text-[#e11d6a] sm:mt-1.5 sm:text-xs">
              {discount}% off
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function BestSellers({ products = [] }) {
  const bestSellers = products.slice(0, 8);

  if (!bestSellers.length) return null;

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-neutral-900" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">Most loved</p>
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-950 md:text-[2rem]">Best Sellers</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Festive favourites from the Tyohar edit — suits, lehengas, and gotapatti looks.
          </p>
        </div>

        <Link
          href="/products"
          className="hidden items-center gap-1.5 text-sm font-semibold text-neutral-900 transition hover:gap-2.5 sm:inline-flex"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="sm:hidden">
        <Swiper grabCursor spaceBetween={12} slidesPerView={2}>
          {bestSellers.map((product) => (
            <SwiperSlide key={product.id} className="!h-auto">
              <BestSellerCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Link
          href="/products"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-4">
        {bestSellers.map((product) => (
          <BestSellerCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
