'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Heart, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCatalog } from '@/components/user/CatalogProvider';
import { productPath } from '@/lib/storePath';
import LineOptions from '@/components/user/LineOptions';
import { lockBodyScroll } from '@/lib/scrollLock';

function money(value) {
  return `₹${Number(value || 0).toLocaleString('en-IN')}`;
}

export default function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    cartItems,
    cartCount,
    updateQty,
    removeFromCart,
    toggleWishlist,
    isWishlisted,
  } = useCatalog();

  useEffect(() => {
    if (!cartOpen) return undefined;
    const unlock = lockBodyScroll();
    function onKey(event) {
      if (event.key === 'Escape') closeCart();
    }
    document.addEventListener('keydown', onKey);
    return () => {
      unlock();
      document.removeEventListener('keydown', onKey);
    };
  }, [cartOpen, closeCart]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className={`fixed inset-0 z-[70] ${cartOpen ? '' : 'pointer-events-none'}`} aria-hidden={!cartOpen}>
      <button
        type="button"
        aria-label="Close cart overlay"
        tabIndex={cartOpen ? 0 : -1}
        onClick={closeCart}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
          cartOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <aside
        role="dialog"
        aria-modal={cartOpen}
        aria-label="Shopping bag"
        className={`absolute inset-y-0 right-0 flex w-full max-w-[440px] transform-gpu flex-col overscroll-contain bg-[#faf7f3] shadow-[-20px_0_60px_rgba(22,19,17,0.18)] transition-transform duration-200 ease-out motion-reduce:transition-none ${
          cartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-400">Your bag</p>
            <h2 className="mt-0.5 text-lg font-semibold text-neutral-950">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-[#f3ebe3]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-neutral-400">
                <ShoppingBag className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-medium text-neutral-950">Your bag is empty</p>
              <p className="mt-1 text-sm text-neutral-500">Save a look from any product card.</p>
              <Link
                href="/products"
                onClick={closeCart}
                className="mt-5 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white"
              >
                Browse products
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {cartItems.map((item) => {
                const saved = isWishlisted(item.id);
                return (
                  <li key={item.lineId || item.id} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/[0.05]">
                    <Link
                      href={productPath(item)}
                      onClick={closeCart}
                      className="relative aspect-[3/4] w-[76px] shrink-0 overflow-hidden rounded-xl bg-[#f3ebe3]"
                    >
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={productPath(item)} onClick={closeCart}>
                            <p className="line-clamp-2 text-sm font-medium leading-snug text-neutral-950">
                              {item.name}
                            </p>
                          </Link>
                          <LineOptions options={item.options} sku={item.sku} />
                          <p className="mt-1 text-sm font-semibold text-neutral-950">{money(item.price)}</p>
                        </div>
                        <div className="flex shrink-0">
                          <button
                            type="button"
                            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                            aria-pressed={saved}
                            onClick={() => toggleWishlist(item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-[#f3ebe3] hover:text-neutral-900"
                          >
                            <Heart className={`h-4 w-4 ${saved ? 'fill-[#e11d6a] text-[#e11d6a]' : ''}`} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => removeFromCart(item.lineId || item.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="inline-flex items-center overflow-hidden rounded-full border border-black/10 bg-[#faf7f3]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => updateQty(item.lineId || item.id, item.qty - 1)}
                            className="flex h-8 w-8 items-center justify-center text-neutral-700 transition hover:bg-[#f3ebe3]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-7 text-center text-sm font-semibold tabular-nums">{item.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => updateQty(item.lineId || item.id, Math.min(20, item.qty + 1))}
                            className="flex h-8 w-8 items-center justify-center text-neutral-700 transition hover:bg-[#f3ebe3]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-neutral-950">
                          {money(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {cartItems.length > 0 ? (
          <div className="border-t border-black/[0.06] bg-white px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-500">Subtotal</span>
              <span className="text-lg font-semibold text-neutral-950">{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">Shipping is calculated at checkout.</p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="mt-4 flex h-12 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Checkout
            </Link>
            <Link
              href="/cart"
              onClick={closeCart}
              className="mt-2 flex h-11 items-center justify-center rounded-full text-sm font-medium text-neutral-800 transition hover:bg-[#f3ebe3]"
            >
              View full bag
            </Link>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
