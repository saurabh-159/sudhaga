'use client';

import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useCatalog } from '@/components/user/CatalogProvider';

export default function CartAddedNotice() {
  const { cartNotice, dismissCartNotice } = useCatalog();

  useEffect(() => {
    if (!cartNotice) return undefined;
    const timer = setTimeout(dismissCartNotice, 2600);
    return () => clearTimeout(timer);
  }, [cartNotice, dismissCartNotice]);

  if (!cartNotice) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute right-0 top-[calc(100%+10px)] z-[80] w-64 origin-top-right animate-[fadeIn_0.22s_ease-out] rounded-2xl border border-black/[0.06] bg-white p-3 shadow-[0_16px_40px_rgba(22,19,17,0.16)]"
    >
      <div className="flex items-center gap-3">
        {cartNotice.image ? (
          <img
            src={cartNotice.image}
            alt=""
            className="h-12 w-10 shrink-0 rounded-lg object-cover object-top"
          />
        ) : (
          <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3ebe3] text-neutral-900">
            <Check className="h-4 w-4" strokeWidth={2.25} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Added to cart</p>
          <p className="truncate text-sm font-medium text-neutral-950">{cartNotice.name}</p>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismissCartNotice}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-neutral-500 transition hover:bg-[#f3ebe3] hover:text-neutral-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
