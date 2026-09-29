'use client';

import { useMemo } from 'react';
import { priceQuote } from '@/lib/pricing';
import CartItem from '@/components/user/CartItem';
import { useCatalog } from '@/components/user/CatalogProvider';
import Link from 'next/link';
import {
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  ArrowRight,
  Lock,
  ArrowLeft,
  Check,
} from 'lucide-react';

export default function CartPage() {
  const { cartItems: items, updateQty, removeFromCart, clearCart, user } = useCatalog();

  const remove = (id) => removeFromCart(id);
  const changeQty = (id, qty) => updateQty(id, qty);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);

  const originalTotal = useMemo(
    () => items.reduce((s, i) => s + (i.originalPrice || i.price) * i.qty, 0),
    [items],
  );

  const productDiscount = originalTotal - subtotal;
  const bill = priceQuote(subtotal);
  const shipping = bill.shipping;
  const tax = bill.tax;
  const total = bill.total;
  const freeShippingProgress = Math.min(100, (subtotal / 999) * 100);
  const amountForFreeShipping = Math.max(0, 999 - subtotal);
  const itemCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
      {/* soft page wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(208,177,90,0.08),_transparent_60%)]"
      />

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Your bag
            </p>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-none">
            Shopping Cart
          </h1>
          {!user && items.length > 0 ? (
            <p className="mt-3 text-sm text-neutral-500">
              Saved on this device.{' '}
            <Link href="/account?next=/cart" className="underline">
              Login
            </Link>{' '}
            to keep this bag.
            </p>
          ) : null}
          <p className="mt-3 text-sm text-neutral-500">
            {itemCount > 0
              ? `${itemCount} ${itemCount === 1 ? 'piece' : 'pieces'} ready for checkout`
              : 'Your cart is waiting to be filled'}
          </p>
        </div>

        {items.length > 0 ? (
          <button
            type="button"
            onClick={clearCart}
            className="self-start rounded-full px-4 py-2 text-sm text-neutral-500 transition hover:bg-[#f3ebe3] hover:text-neutral-900 sm:self-end"
          >
            Clear cart
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-[#faf7f3] px-6 py-20 text-center md:py-28">
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 scale-150 rounded-full bg-[var(--brand-gold,#D0B15A)]/15 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(22,19,17,0.08)] ring-1 ring-black/5">
              <ShoppingBag className="h-8 w-8 text-neutral-700" strokeWidth={1.4} />
            </div>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-950 md:text-3xl">
            Your cart is empty
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Explore our festive collections and find something you love.
          </p>
          <Link
            href="/products"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800"
          >
            Start shopping
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="space-y-5 lg:col-span-3">
            {/* Free shipping */}
            <div
              className={`overflow-hidden rounded-2xl px-5 py-4 ${
                amountForFreeShipping === 0
                  ? 'bg-emerald-50/80 ring-1 ring-emerald-200/70'
                  : 'bg-[#faf7f3] ring-1 ring-black/[0.05]'
              }`}
            >
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    amountForFreeShipping === 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-neutral-800 shadow-sm ring-1 ring-black/5'
                  }`}
                >
                  {amountForFreeShipping === 0 ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Truck className="h-4 w-4" strokeWidth={1.6} />
                  )}
                </span>
                {amountForFreeShipping === 0 ? (
                  <p className="text-sm font-medium text-emerald-800">
                    You&apos;ve unlocked free shipping
                  </p>
                ) : (
                  <p className="text-sm text-neutral-700">
                    Add{' '}
                    <span className="font-semibold text-neutral-950">
                      ₹{amountForFreeShipping.toLocaleString('en-IN')}
                    </span>{' '}
                    more for free shipping
                  </p>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    amountForFreeShipping === 0
                      ? 'bg-emerald-600'
                      : 'bg-[var(--brand-gold,#D0B15A)]'
                  }`}
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={item.id} item={item} onRemove={remove} onQtyChange={changeQty} />
              ))}
            </div>

            <Link
              href="/products"
              className="group inline-flex items-center gap-2 pt-1 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Continue shopping
            </Link>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              {[
                { icon: Truck, title: 'Free delivery', sub: 'Above ₹999' },
                { icon: RefreshCw, title: 'Easy returns', sub: '7 days' },
                { icon: Shield, title: 'Secure payment', sub: '100% safe' },
              ].map(({ icon: Icon, title, sub }) => (
                <div
                  key={title}
                  className={`flex items-center gap-3 rounded-2xl bg-white px-3 py-3.5 ring-1 ring-black/[0.05] sm:px-4 sm:py-4 ${
                    title === 'Secure payment' ? 'col-span-2 sm:col-span-1' : ''
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f3ebe3]">
                    <Icon className="h-4 w-4 text-[var(--brand-gold,#D0B15A)]" strokeWidth={1.6} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-neutral-950">{title}</p>
                    <p className="text-xs text-neutral-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-2 lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(22,19,17,0.08)] ring-1 ring-black/[0.06]">
              <div className="relative overflow-hidden bg-[#161311] px-6 py-6">
                <div
                  aria-hidden
                  className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-gold,#D0B15A)]/20 blur-3xl"
                />
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <span className="h-px w-6 bg-[#e7d3b0]" />
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7d3b0]">
                      Order summary
                    </h2>
                  </div>
                  <p className="mt-2 text-xl font-medium text-[#f7f3ee]">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-5 space-y-3.5 rounded-2xl bg-[#faf7f3] p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-medium tabular-nums text-neutral-950">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {productDiscount > 0 ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-500">Product discount</span>
                      <span className="font-medium tabular-nums text-emerald-700">
                        −₹{productDiscount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Shipping</span>
                    {shipping === 0 ? (
                      <span className="font-medium text-emerald-700">Free</span>
                    ) : (
                      <span className="font-medium tabular-nums text-neutral-950">₹{shipping}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">Tax (GST 18%)</span>
                    <span className="font-medium tabular-nums text-neutral-950">
                      ₹{tax.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mb-6 flex items-end justify-between border-t border-dashed border-neutral-200 pt-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Total
                    </p>
                    {productDiscount > 0 ? (
                      <p className="mt-1 text-xs font-medium text-emerald-700">
                        You save ₹{productDiscount.toLocaleString('en-IN')}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-3xl font-medium tabular-nums tracking-tight text-neutral-950">
                    ₹{total.toLocaleString('en-IN')}
                  </p>
                </div>

                <Link
                  href="/checkout"
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 py-4 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800"
                >
                  <Lock className="h-4 w-4" strokeWidth={1.6} />
                  Proceed to checkout
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
                  <Lock className="h-3 w-3" />
                  Secure checkout · 256-bit SSL
                </p>
              </div>
            </div>

          </aside>
        </div>
      )}
    </div>
  );
}
