'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useCatalog } from '@/components/user/CatalogProvider';
import { defaultVariant } from '@/lib/variants';

export default function ReadyToShipButton({ product }) {
  const router = useRouter();
  const { addToCart, cartItems, closeCart } = useCatalog();
  const [pending, setPending] = useState(false);

  async function goCheckout() {
    if (pending) return;
    setPending(true);
    try {
      const variant = defaultVariant(product);
      const sku = variant.sku || product.sku || '';
      const already = cartItems.some(
        (item) => String(item.id) === String(product.id) && (item.sku || '') === sku,
      );
      if (!already) {
        await addToCart(product.id, 1, product, variant, { quiet: true });
      }
      closeCart();
      router.push('/checkout');
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={goCheckout}
      disabled={pending}
      aria-label={`Buy ${product.name} now`}
      className="mt-2.5 hidden w-fit cursor-pointer items-center gap-1.5 rounded-md border-0 bg-neutral-900 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-neutral-800 disabled:opacity-70 sm:inline-flex"
    >
      Ready to ship
      <Zap className="h-3.5 w-3.5 fill-white" />
    </button>
  );
}
