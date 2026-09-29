'use client';

import { useState } from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCatalog } from '@/components/user/CatalogProvider';

export function ProductCartButton({ product, overlay = false, compact = false }) {
  const { addToCart, cartItems } = useCatalog();
  const inCart = cartItems.some((item) => String(item.id) === String(product.id));
  const [pending, setPending] = useState(false);

  async function onCart(event) {
    event.preventDefault();
    event.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      await addToCart(product.id, 1, product);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      aria-label={inCart ? `${product.name} is in your bag` : `Add ${product.name} to bag`}
      onClick={onCart}
      disabled={pending}
      className={`flex items-center justify-center rounded-full ring-1 ring-black/5 transition active:scale-95 disabled:opacity-70 ${
        overlay ? (compact ? 'h-9 w-9' : 'h-10 w-10') : 'h-8 w-8'
      } ${
        inCart
          ? 'bg-neutral-950 text-white ring-neutral-950'
          : overlay
            ? 'bg-white/90 text-neutral-800 shadow-sm backdrop-blur-md hover:scale-105 hover:bg-white'
            : 'bg-[#f6f3ef] text-neutral-800 hover:bg-[#efe8df]'
      }`}
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}

export default function ProductQuickActions({ product, compact = false, showCart = true }) {
  const { toggleWishlist, isWishlisted } = useCatalog();
  const saved = isWishlisted(product.id);

  async function onWish(event) {
    event.preventDefault();
    event.stopPropagation();
    await toggleWishlist(product.id);
  }

  const size = compact ? 'h-9 w-9' : 'h-10 w-10';
  const icon = compact ? 'h-4 w-4' : 'h-[18px] w-[18px]';

  return (
    <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-2 sm:right-3 sm:top-3">
      <button
        type="button"
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
        aria-pressed={saved}
        onClick={onWish}
        className={`flex ${size} items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 backdrop-blur-md transition duration-300 hover:scale-105 active:scale-95 ${
          saved ? 'bg-white text-[#e11d6a]' : 'bg-white/90 text-neutral-800 hover:bg-white'
        }`}
      >
        <Heart className={`${icon} ${saved ? 'fill-[#e11d6a]' : ''}`} strokeWidth={1.75} />
      </button>
      {showCart ? <ProductCartButton product={product} overlay compact={compact} /> : null}
    </div>
  );
}
