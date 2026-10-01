'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { productPath, productAlt } from '@/lib/storePath';
import ProductImage from '@/components/user/ProductImage';
import { ChevronLeft, ChevronRight, Headphones, RefreshCw, ShieldCheck, Truck, Zap } from 'lucide-react';
import ProductQuickActions from '@/components/user/ProductQuickActions';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const NOTES = [
  { icon: Truck, title: 'Free shipping', detail: 'On orders over ₹999' },
  { icon: ShieldCheck, title: 'Secure payment', detail: '100% protected' },
  { icon: RefreshCw, title: 'Easy returns', detail: '7-day return policy' },
  { icon: Headphones, title: 'Support', detail: 'Here when you need us' },
];

function money(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function categoryLabel(slug) {
  if (!slug) return 'Featured';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function FeaturedCard({ product }) {
  const hasDiscount = product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const href = productPath(product);

  return (
    <article className="flex h-full flex-col bg-white">
      <div className="relative aspect-[5/6] overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl">
        <Link href={href} className="absolute inset-0">
          <ProductImage src={product.image} alt={productAlt(product)} className="object-cover" sizes="(max-width: 768px) 80vw, 25vw" />
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

export default function FeaturedProducts({ products = [] }) {
  const featured = products.slice(0, 8);
  const swiperRef = useRef(null);

  if (!featured.length) return null;

  return (
    <section className="mb-16">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-left">
          <div className="flex items-center justify-center gap-3 sm:justify-start">
            <span className="h-px w-8 bg-neutral-900" />
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-900">Handpicked</p>
            <span className="h-px w-8 bg-neutral-900 sm:hidden" />
          </div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-neutral-950 md:text-4xl">Featured Products</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-500">
            Fresh embroidered chanderi suits and lehengas from the new drop.
          </p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Previous products"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next products"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Autoplay]}
        loop={featured.length > 8}
        grabCursor
        spaceBetween={12}
        slidesPerView={2}
        autoplay={{
          delay: 2800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 20 },
          1280: { slidesPerView: 4, spaceBetween: 20 },
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {featured.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <FeaturedCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <ul className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-neutral-200 md:grid-cols-4">
        {NOTES.map((note) => (
          <li key={note.title} className="flex items-center gap-3 bg-white px-4 py-4">
            <note.icon className="h-4 w-4 shrink-0 text-neutral-800" strokeWidth={1.75} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-950">{note.title}</p>
              <p className="truncate text-xs text-neutral-500">{note.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
