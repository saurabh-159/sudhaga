'use client';

import { useEffect, useRef, useState } from 'react';
import { priceQuote } from '@/lib/pricing';
import { api } from '@/lib/apiClient';
import { draftFromUser, emptyShipping, streetIsBlank } from '@/lib/addressBook';
import { useCatalog } from '@/components/user/CatalogProvider';
import Link from 'next/link';
import CheckoutForm from '@/components/user/CheckoutForm';
import GoogleAuthButton from '@/components/user/GoogleAuthButton';
import {
  ShoppingBag,
  Truck,
  CreditCard,
  Check,
  Lock,
  Shield,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Package,
  ChevronRight,
  RefreshCw,
  Tag,
  X,
} from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems, user, authReady, refreshSession } = useCatalog();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [draft, setDraft] = useState(emptyShipping);
  const [usingNew, setUsingNew] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);
  const [loginNudge, setLoginNudge] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCode, setAppliedCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponBusy, setCouponBusy] = useState(false);
  const [quote, setQuote] = useState(null);
  const loginPanelRef = useRef(null);
  const appliedCodeRef = useRef('');
  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartKey = cartItems.map((item) => `${item.id}:${item.qty}`).join('|');
  const localBill = priceQuote(subtotal);
  const bill = quote?.bill || localBill;
  const deliveryFee = bill.shipping;
  const tax = bill.tax;
  const discount = bill.discount;
  const total = bill.total;

  useEffect(() => {
    if (!authReady || usingNew) return;
    setDraft((current) => (streetIsBlank(current) ? draftFromUser(user) : current));
  }, [authReady, user, usingNew]);

  useEffect(() => {
    if (!loginNudge) return;
    loginPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [loginNudge]);

  useEffect(() => {
    if (!authReady || !user) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    api('/api/checkout/quote', {
      method: 'POST',
      body: JSON.stringify({ couponCode: appliedCodeRef.current }),
    })
      .then((data) => {
        if (!cancelled) setQuote(data);
      })
      .catch((err) => {
        if (cancelled) return;
        if (appliedCodeRef.current) {
          appliedCodeRef.current = '';
          setAppliedCode('');
          setCouponError(err.message);
          api('/api/checkout/quote', {
            method: 'POST',
            body: JSON.stringify({ couponCode: '' }),
          })
            .then((data) => {
              if (!cancelled) setQuote(data);
            })
            .catch(() => {});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [authReady, user, cartKey]);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    if (!user) {
      setLoginNudge(true);
      setCouponError('Sign in before applying a coupon.');
      return;
    }
    setCouponBusy(true);
    setCouponError('');
    try {
      const data = await api('/api/checkout/quote', {
        method: 'POST',
        body: JSON.stringify({ couponCode: code }),
      });
      appliedCodeRef.current = data.coupon?.code || '';
      setAppliedCode(appliedCodeRef.current);
      setQuote(data);
      setCouponInput('');
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponBusy(false);
    }
  }

  async function clearCoupon() {
    appliedCodeRef.current = '';
    setAppliedCode('');
    setCouponError('');
    if (!user) {
      setQuote(null);
      return;
    }
    try {
      const data = await api('/api/checkout/quote', {
        method: 'POST',
        body: JSON.stringify({ couponCode: '' }),
      });
      setQuote(data);
    } catch (err) {
      setCouponError(err.message);
    }
  }

  const steps = [
    { id: 1, label: 'Shipping', icon: MapPin },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Review', icon: Check },
  ];

  async function captureShipping() {
    const form = document.getElementById('checkout-form');
    if (!form?.reportValidity()) return null;
    const next = { ...draft };
    if (user) {
      try {
        await api('/api/auth/me', {
          method: 'PUT',
          body: JSON.stringify({ shipping: next }),
        });
        await refreshSession();
        setError('');
      } catch (err) {
        setError(err.message);
      }
    }
    return next;
  }

  function loadRazorpay() {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleOrder() {
    if (!user) {
      setLoginNudge(true);
      setError('Sign in with Google before placing this order.');
      return;
    }
    const destination = draft;
    setError('');
    setPlacing(true);
    try {
      if (paymentMethod === 'Cash on Delivery') {
        const order = await api('/api/orders', {
          method: 'POST',
          body: JSON.stringify({ shipping: destination, couponCode: appliedCodeRef.current }),
        });
        setPlacedOrder(order);
        setOrderPlaced(true);
        await refreshSession();
        return;
      }

      const ready = await loadRazorpay();
      if (!ready) throw new Error('Could not load Razorpay');
      const pay = await api('/api/payment/create-order', { method: 'POST' });
      const rzp = new window.Razorpay({
        key: pay.key,
        amount: pay.order.amount,
        currency: pay.order.currency || 'INR',
        order_id: pay.order.id,
        handler: async (response) => {
          const order = await api('/api/orders', {
            method: 'POST',
            body: JSON.stringify({ shipping: destination, couponCode: appliedCodeRef.current }),
          });
          await api('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            }),
          });
          setPlacedOrder(order);
          setOrderPlaced(true);
          await refreshSession();
        },
      });
      rzp.open();
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (orderPlaced) {
    return (
      <div className="relative mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.12),_transparent_55%)]"
        />
        <div className="text-center">
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 scale-150 rounded-full bg-emerald-400/30 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[0_12px_40px_rgba(5,150,105,0.35)]">
              <Check className="h-9 w-9" strokeWidth={2.5} />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700">
              Order confirmed
            </p>
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-neutral-950 md:text-4xl">
            Thank you for your order
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            Your order{' '}
            <span className="font-mono font-semibold text-neutral-900">#{String(placedOrder?._id || '').slice(-8)}</span> has
            been placed. A confirmation email is on its way.
          </p>
          {placedOrder?.couponUsed && placedOrder?.coupon?.code ? (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Coupon {placedOrder.coupon.code} used
              {placedOrder.discount ? ` · −₹${Number(placedOrder.discount).toLocaleString('en-IN')}` : ''}
            </p>
          ) : null}

          <div className="mt-8 rounded-3xl border border-black/[0.06] bg-[#faf7f3] p-6 text-left shadow-[0_12px_40px_rgba(22,19,17,0.04)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-black/5">
                <Package className="h-5 w-5 text-[var(--brand-gold,#D0B15A)]" strokeWidth={1.6} />
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-950">Estimated delivery</p>
                <p className="text-xs text-neutral-500">
                  Arriving by <span className="font-medium text-neutral-900">Tomorrow, 6 PM</span>
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t border-black/[0.06] pt-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover bg-[#f3ebe3] ring-1 ring-black/5"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-950">{item.name}</p>
                    <p className="text-xs text-neutral-500">Qty: {item.qty}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-neutral-950">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800"
            >
              Continue shopping
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-7 py-3.5 text-sm font-medium text-neutral-800 transition hover:border-black/20 hover:bg-[#faf7f3]"
            >
              Track order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(208,177,90,0.08),_transparent_60%)]"
      />

      <nav className="mb-6 flex items-center gap-2 text-xs text-neutral-500 md:text-sm">
        <Link href="/cart" className="transition hover:text-neutral-900">
          Cart
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
        <span className="font-medium text-neutral-900">Checkout</span>
      </nav>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Secure checkout
            </p>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-none">
            Complete your order
          </h1>
          <p className="mt-3 text-sm text-neutral-500">Three simple steps to place your order</p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3.5 py-2 text-xs text-neutral-500 shadow-sm ring-1 ring-black/5">
          <Shield className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.6} />
          Encrypted & secure
        </div>
      </div>

      {authReady && !user ? (
        <section
          ref={loginPanelRef}
          aria-label="Sign in"
          className={`mb-8 rounded-2xl bg-[#faf7f3] px-4 py-4 sm:px-5 ${
            loginNudge ? 'ring-2 ring-neutral-950' : 'ring-1 ring-black/[0.06]'
          }`}
        >
          <div className="mx-auto max-w-md">
            <GoogleAuthButton
              label="Continue with Google"
              onSuccess={() => {
                setLoginNudge(false);
                setError('');
              }}
            />
            {loginNudge ? (
              <p className="mt-2 text-center text-xs font-medium text-neutral-950">
                Sign in is required before this order can be placed.
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Progress */}
      <div className="mb-10 max-w-xl rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(22,19,17,0.04)] ring-1 ring-black/[0.05]">
        <div className="flex items-center">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;

            return (
              <div key={s.id} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => isCompleted && setStep(s.id)}
                    disabled={!isCompleted}
                    className={`relative flex h-11 w-11 items-center justify-center rounded-full transition duration-300 ${
                      isActive
                        ? 'bg-neutral-950 text-white shadow-lg shadow-neutral-950/20'
                        : isCompleted
                          ? 'bg-[var(--brand-gold,#D0B15A)] text-neutral-950'
                          : 'bg-[#faf7f3] text-neutral-400 ring-1 ring-black/5'
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </button>
                  <p
                    className={`mt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      isActive
                        ? 'text-neutral-950'
                        : isCompleted
                          ? 'text-[var(--brand-gold,#D0B15A)]'
                          : 'text-neutral-400'
                    }`}
                  >
                    {s.label}
                  </p>
                </div>

                {i < steps.length - 1 ? (
                  <div className="mx-2 mb-6 h-0.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        step > s.id ? 'w-full bg-[var(--brand-gold,#D0B15A)]' : 'w-0'
                      }`}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <div className="rounded-3xl bg-white p-4 shadow-[0_20px_50px_rgba(22,19,17,0.06)] ring-1 ring-black/[0.06] sm:p-6 md:p-8">
            <div className="mb-7 flex items-center gap-3 border-b border-black/[0.06] pb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3ebe3] text-neutral-800">
                {step === 1 && <MapPin className="h-5 w-5" strokeWidth={1.6} />}
                {step === 2 && <CreditCard className="h-5 w-5" strokeWidth={1.6} />}
                {step === 3 && <Check className="h-5 w-5" strokeWidth={1.6} />}
              </span>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-gold,#D0B15A)]">
                  Step {step} of 3
                </p>
                <h2 className="text-lg font-medium text-neutral-950 md:text-xl">
                  {step === 1 && 'Shipping information'}
                  {step === 2 && 'Payment details'}
                  {step === 3 && 'Review & confirm'}
                </h2>
              </div>
            </div>

            {step === 1 ? (
              <CheckoutForm
                user={user}
                value={draft}
                onChange={setDraft}
                usingNew={usingNew}
                onUseSaved={() => setUsingNew(false)}
                onAddNew={() => setUsingNew(true)}
              />
            ) : null}

            {step === 2 ? (
              <div className="space-y-4">
                <p className="text-sm text-neutral-500">
                  Choose how you&apos;d like to pay. All payments are encrypted.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {['UPI', 'Card', 'Net Banking', 'Cash on Delivery'].map((method) => {
                    const selected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-4 text-left transition ${
                          selected
                            ? 'bg-[#faf7f3] ring-2 ring-neutral-950'
                            : 'bg-white ring-1 ring-black/10 hover:ring-black/20'
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            selected ? 'border-neutral-950' : 'border-neutral-300'
                          }`}
                        >
                          {selected ? (
                            <span className="h-2 w-2 rounded-full bg-neutral-950" />
                          ) : null}
                        </span>
                        <span className="text-sm font-medium text-neutral-900">{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-neutral-600">
                  Please review your order before placing it. You can go back to edit shipping or
                  payment details.
                </p>
                {draft.address ? (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-neutral-700 ring-1 ring-black/5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Deliver to
                    </p>
                    <p className="mt-1 font-medium text-neutral-950">{draft.name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                      {draft.address}, {draft.city}, {draft.state} {draft.pincode}
                      {draft.phone ? ` · ${draft.phone}` : ''}
                    </p>
                  </div>
                ) : null}
                <div className="space-y-3 rounded-2xl bg-[#faf7f3] p-4 ring-1 ring-black/[0.04]">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover bg-[#f3ebe3]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-neutral-950">{item.name}</p>
                        <p className="text-xs text-neutral-500">
                          Qty {item.qty} · ₹{item.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="rounded-xl bg-white px-3.5 py-2.5 text-xs text-neutral-500 ring-1 ring-black/5">
                  Paying via <span className="font-medium text-neutral-900">{paymentMethod}</span>
                </p>
              </div>
            ) : null}

            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
            <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-black/[0.06] pt-6 sm:flex-row">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="group inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to {steps[step - 2].label}
                </button>
              ) : (
                <Link
                  href="/cart"
                  className="group inline-flex w-full items-center justify-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950 sm:w-auto"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to cart
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={async () => {
                    if (step === 1) {
                      const next = await captureShipping();
                      if (!next) return;
                    }
                    setStep(step + 1);
                  }}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800 sm:w-auto"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={placing}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800 disabled:opacity-60 sm:w-auto"
                >
                  <Lock className="h-4 w-4" strokeWidth={1.6} />
                  {placing ? 'Placing…' : !user ? 'Login to place order' : `Place order · ₹${total.toLocaleString('en-IN')}`}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-2 lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(22,19,17,0.08)] ring-1 ring-black/[0.06]">
            <div className="relative overflow-hidden bg-[#161311] px-6 py-6">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--brand-gold,#D0B15A)]/20 blur-3xl"
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="h-px w-6 bg-[#e7d3b0]" />
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7d3b0]">
                      Your order
                    </h2>
                  </div>
                  <p className="mt-2 text-xl font-medium text-[#f7f3ee]">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <ShoppingBag className="h-5 w-5 text-[#e7d3b0]" strokeWidth={1.6} />
              </div>
            </div>

            <div className="p-6">
              <div className="mb-5 max-h-64 space-y-3.5 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover bg-[#f3ebe3]"
                      />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] font-bold text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-950">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold tabular-nums text-neutral-950">
                      ₹{(item.price * item.qty).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  <Tag className="h-3.5 w-3.5" />
                  Coupon
                </label>
                {appliedCode ? (
                  <div className="rounded-2xl bg-[#faf7f3] px-3.5 py-3 ring-1 ring-black/[0.05]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-mono text-sm font-semibold text-neutral-950">{appliedCode}</p>
                      <button
                        type="button"
                        onClick={clearCoupon}
                        aria-label="Remove coupon"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-white hover:text-neutral-950"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">
                      Discount is on this total. The coupon is marked used after you place the order.
                    </p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(event) => {
                        setCouponInput(event.target.value.toUpperCase());
                        if (couponError) setCouponError('');
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') applyCoupon();
                      }}
                      placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#faf7f3] px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-neutral-900 placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-neutral-400 focus:border-[var(--brand-gold,#D0B15A)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold,#D0B15A)]/20"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponInput.trim() || couponBusy}
                      className="rounded-xl bg-neutral-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-40"
                    >
                      {couponBusy ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError ? <p className="mt-2 text-xs text-red-600">{couponError}</p> : null}
              </div>

              <div className="mb-5 space-y-2.5 rounded-2xl bg-[#faf7f3] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-medium tabular-nums text-neutral-950">
                    ₹{bill.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Coupon</span>
                    <span className="font-medium tabular-nums text-emerald-700">
                      −₹{discount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  {deliveryFee === 0 ? (
                    <span className="font-medium text-emerald-700">Free</span>
                  ) : (
                    <span className="font-medium tabular-nums text-neutral-950">₹{deliveryFee}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Tax (GST 18%)</span>
                  <span className="font-medium tabular-nums text-neutral-950">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mb-5 flex items-end justify-between border-t border-dashed border-neutral-200 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Total
                </p>
                <p className="text-3xl font-medium tabular-nums tracking-tight text-neutral-950">
                  ₹{total.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-[#faf7f3] p-3.5 ring-1 ring-black/[0.04]">
                <Truck
                  className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-gold,#D0B15A)]"
                  strokeWidth={1.6}
                />
                <div>
                  <p className="text-xs font-medium text-neutral-950">Estimated delivery</p>
                  <p className="text-[11px] text-neutral-500">Tomorrow, before 6 PM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.05]">
            <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              Buyer protection
            </p>
            <ul className="space-y-2.5">
              {[
                { icon: Lock, label: 'SSL secured checkout' },
                { icon: Shield, label: '100% purchase protection' },
                { icon: Truck, label: 'Free delivery above ₹999' },
                { icon: RefreshCw, label: 'Easy 7-day returns' },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-xs text-neutral-600">
                  <Icon
                    className="h-3.5 w-3.5 shrink-0 text-[var(--brand-gold,#D0B15A)]"
                    strokeWidth={1.6}
                  />
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
