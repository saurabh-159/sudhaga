'use client';

import Link from 'next/link';
import { productPath } from '@/lib/storePath';
import LineOptions from '@/components/user/LineOptions';
import { Heart, Minus, Plus, Trash2 } from 'lucide-react';

export default function CartItem({ item, onRemove, onQtyChange }) {
  const lineTotal = item.price * item.qty;
  const hasDiscount = item.originalPrice && item.originalPrice > item.price;
  const discount = hasDiscount
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  return (
    <article className="group relative flex gap-4 overflow-hidden rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_1px_0_rgba(22,19,17,0.03)] transition duration-300 hover:border-black/10 hover:shadow-[0_12px_40px_rgba(22,19,17,0.06)] sm:gap-5 sm:p-5">
      <Link
        href={productPath(item)}
        className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-xl bg-[#f3ebe3] sm:w-28 md:w-32"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]"
        />
        {discount > 0 ? (
          <span className="absolute left-2 top-2 bg-white/95 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-neutral-900 backdrop-blur-sm">
            -{discount}%
          </span>
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {item.category ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                {String(item.category).replace(/-/g, ' ')}
              </p>
            ) : null}
            <Link href={productPath(item)}>
              <h3 className="mt-1 line-clamp-2 text-[15px] font-medium leading-snug text-neutral-950 transition hover:text-neutral-600 md:text-base">
                {item.name}
              </h3>
            </Link>
            <LineOptions options={item.options} sku={item.sku} />
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label="Move to wishlist"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-[#f3ebe3] hover:text-neutral-900"
            >
              <Heart className="h-4 w-4" strokeWidth={1.6} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.lineId || item.id)}
              aria-label="Remove item"
              className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.6} />
            </button>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
          <div className="inline-flex items-center overflow-hidden rounded-full border border-black/10 bg-[#faf7f3]">
            <button
              type="button"
              onClick={() => onQtyChange(item.lineId || item.id, item.qty - 1)}
              aria-label="Decrease quantity"
              className="flex h-9 w-9 items-center justify-center text-neutral-700 transition hover:bg-[#f3ebe3]"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[2.25rem] text-center text-sm font-semibold tabular-nums text-neutral-950">
              {item.qty}
            </span>
            <button
              type="button"
              onClick={() => onQtyChange(item.lineId || item.id, item.qty + 1)}
              aria-label="Increase quantity"
              className="flex h-9 w-9 items-center justify-center text-neutral-700 transition hover:bg-[#f3ebe3]"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold tabular-nums tracking-tight text-neutral-950">
              ₹{lineTotal.toLocaleString('en-IN')}
            </p>
            {hasDiscount ? (
              <p className="mt-0.5 text-xs text-neutral-400 line-through">
                ₹{(item.originalPrice * item.qty).toLocaleString('en-IN')}
              </p>
            ) : item.qty > 1 ? (
              <p className="mt-0.5 text-[11px] text-neutral-400">
                ₹{item.price.toLocaleString('en-IN')} each
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
