'use client';

import Link from 'next/link';
import { productPath, productAlt } from '@/lib/storePath';
import ProductImage from '@/components/user/ProductImage';
import { Star } from 'lucide-react';
import ProductQuickActions, { ProductCartButton } from '@/components/user/ProductQuickActions';

function money(value) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function categoryLabel(slug) {
  if (!slug) return '';
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export default function ProductCard({ product }) {
  const hasDiscount = product.originalPrice > product.price;
  const discount = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const href = productPath(product);

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f3ebe3]">
        <Link href={href} className="absolute inset-0">
          <ProductImage src={product.image} alt={productAlt(product)} className="object-cover transition duration-500 group-hover:scale-[1.04]" />
        </Link>
        {discount > 0 ? (
          <span className="pointer-events-none absolute left-2 top-2 bg-white/90 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-900 backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px] sm:tracking-[0.14em]">
            {discount}% off
          </span>
        ) : null}
        <ProductQuickActions product={product} compact showCart={false} />
      </div>

      <div className="flex items-end justify-between gap-2 px-0.5 pt-2.5 sm:gap-3 sm:pt-3">
        <Link href={href} className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-400 sm:text-[11px] sm:tracking-[0.16em]">
            {categoryLabel(product.category)}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[13px] font-medium leading-snug text-neutral-950 sm:truncate sm:text-sm">
            {product.name}
          </h3>
          <p className="mt-1.5 flex items-baseline gap-2 sm:mt-2">
            <span className="text-[13px] font-semibold text-neutral-950 sm:text-sm">{money(product.price)}</span>
            {hasDiscount ? (
              <span className="text-[11px] text-neutral-400 line-through sm:text-xs">{money(product.originalPrice)}</span>
            ) : null}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-500 sm:hidden">
            <Star className="h-3 w-3 fill-neutral-900 text-neutral-900" />
            {product.rating}
          </p>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ProductCartButton product={product} />
          <p className="hidden items-center gap-1 text-xs text-neutral-500 sm:flex">
            <Star className="h-3.5 w-3.5 fill-neutral-900 text-neutral-900" />
            {product.rating}
          </p>
        </div>
      </div>
    </article>
  );
}
