'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api, shapeOrder } from '@/lib/apiClient';
import { productPath } from '@/lib/storePath';

const statusSteps = [
  { key: 'Ordered', label: 'Order placed', desc: 'We received your order' },
  { key: 'Packed', label: 'Packed', desc: 'Your items were packed' },
  { key: 'Shipped', label: 'Shipped', desc: 'On the way to you' },
  { key: 'Out for Delivery', label: 'Out for delivery', desc: 'Arriving today' },
  { key: 'Delivered', label: 'Delivered', desc: 'Delivered successfully' },
];

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return '•';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatPhone(phone) {
  const raw = String(phone || '').trim();
  const digits = raw.replace(/\D/g, '');
  const local =
    digits.length === 10
      ? digits
      : digits.length === 11 && digits.startsWith('0')
        ? digits.slice(1)
        : digits.length === 12 && digits.startsWith('91')
          ? digits.slice(2)
          : '';
  if (local.length === 10) return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  return raw;
}

function getStepIndex(status) {
  if (status === 'Processing') return 0;
  if (status === 'Shipped') return 2;
  if (status === 'Delivered') return 4;
  if (status === 'Cancelled') return -1;
  return 0;
}

const statusConfig = {
  Processing: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    dot: 'bg-amber-500',
    bar: 'bg-amber-500',
    label: 'Processing',
  },
  Shipped: {
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    dot: 'bg-sky-500',
    bar: 'bg-sky-500',
    label: 'In transit',
  },
  Delivered: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-600',
    label: 'Delivered',
  },
  Cancelled: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    dot: 'bg-red-500',
    bar: 'bg-red-500',
    label: 'Cancelled',
  },
};

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  useEffect(() => {
    api(`/api/orders/${id}`)
      .then((data) => {
        const shaped = shapeOrder(data);
        setOrder({
          ...shaped,
          lineItems: (data.items || []).map((item, index) => ({
            ...item,
            id: item.product || index,
          })),
        });
      })
      .catch(() => setMissing(true));
  }, [id]);

  if (missing) return <p className="px-4 py-16 text-center">Order not found.</p>;
  if (!order) return <p className="px-4 py-16 text-center">Loading order…</p>;

  const items = order.lineItems;
  const config = statusConfig[order.status] || statusConfig.Processing;
  const currentStepIndex = getStepIndex(order.status);

  const ship = order.shipping && typeof order.shipping === 'object' ? order.shipping : {};
  const account = order.user && typeof order.user === 'object' ? order.user : {};
  const recipient = ship.name || account.name || 'Customer';
  const cityLine = [ship.city, ship.state].filter(Boolean).join(', ');
  const place = [cityLine, ship.pincode].filter(Boolean).join(' — ');
  const addressLines = [ship.address, place].filter((line) => String(line || '').trim());
  if (addressLines.length) addressLines.push('India');
  const recipientPhone = formatPhone(ship.phone);
  const recipientEmail = ship.email || account.email || '';

  const subtotal = order.subtotal ?? items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Number(order.discount || 0);
  const shipping = order.shippingFee ?? (order.subtotal == null ? 0 : subtotal > 999 ? 0 : 49);
  const tax = order.tax ?? (order.subtotal == null ? 0 : Math.round((subtotal - discount) * 0.18));
  const total = Number(order.total || 0);

  async function handleDownloadInvoice() {
    if (downloading) return;
    setInvoiceError('');
    setDownloading(true);
    try {
      const { downloadOrderInvoice } = await import('@/lib/invoicePdf.mjs');
      await downloadOrderInvoice({
        ...order,
        items,
        subtotal,
        discount,
        shippingFee: shipping,
        tax,
        total,
      });
    } catch {
      setInvoiceError('Could not create the invoice. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);
  const formattedETA = estimatedDelivery.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-8 md:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(208,177,90,0.08),_transparent_60%)]"
      />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-neutral-500 md:text-sm">
        <Link href="/" className="transition hover:text-neutral-900">
          Home
        </Link>
        <svg className="h-3.5 w-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/orders" className="transition hover:text-neutral-900">
          My orders
        </Link>
        <svg className="h-3.5 w-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-neutral-900">#{order.id}</span>
      </nav>

      {/* Header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-[#161311] px-4 py-6 text-white shadow-[0_20px_50px_rgba(22,19,17,0.2)] sm:px-6 sm:py-7 md:px-8 md:py-8">
        <div
          aria-hidden
          className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--brand-gold,#D0B15A)]/20 blur-3xl"
        />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <span
              className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${config.bg} ${config.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>

            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-6 bg-[#e7d3b0]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7d3b0]">
                Order details
              </p>
            </div>

            <h1 className="text-2xl font-medium tracking-tight text-[#f7f3ee] md:text-3xl">
              Order #{order.id}
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Placed on {order.date} · {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="md:text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Order total
            </p>
            <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight text-[#f7f3ee] md:text-4xl">
              ₹{order.total?.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {order.status === 'Cancelled' ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 md:px-5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-red-900">Order cancelled</p>
            <p className="mt-0.5 text-xs leading-relaxed text-red-700">
              Any payment made will be refunded to your original method within 3–5 business days.
            </p>
          </div>
        </div>
      ) : null}

      {/* Tracking */}
      {order.status !== 'Cancelled' ? (
        <div className="mb-6 rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(22,19,17,0.05)] ring-1 ring-black/[0.05] md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3ebe3] text-neutral-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.6}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a2 2 0 104 0m-4 0a2 2 0 114 0"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-lg font-medium text-neutral-950">Track your order</h2>
              <p className="text-xs text-neutral-500">
                {order.status === 'Delivered'
                  ? 'Delivered successfully'
                  : `Estimated delivery: ${formattedETA}`}
              </p>
            </div>
          </div>

          <div className="hidden rounded-2xl bg-[#faf7f3] p-6 md:block">
            <div className="relative">
              <div className="absolute left-5 right-5 top-5 h-px bg-neutral-200" />
              <div
                className={`absolute left-5 top-5 h-px ${config.bar} transition-all duration-700`}
                style={{
                  width: `calc((100% - 40px) * ${currentStepIndex / (statusSteps.length - 1)})`,
                }}
              />

              <div className="relative flex justify-between">
                {statusSteps.map((s, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isLast = i === statusSteps.length - 1;

                  return (
                    <div
                      key={s.key}
                      className="flex flex-col items-center text-center"
                      style={{ width: '20%' }}
                    >
                      <div
                        className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white transition ${
                          isCompleted
                            ? `${config.bar} border-transparent text-white shadow-md`
                            : 'border-neutral-200'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-neutral-300" />
                        )}
                        {isCurrent && !isLast ? (
                          <span
                            className={`absolute inset-0 animate-ping rounded-full opacity-30 ${config.bar}`}
                          />
                        ) : null}
                      </div>
                      <p
                        className={`mt-3 text-xs font-medium ${
                          isCompleted ? 'text-neutral-950' : 'text-neutral-400'
                        }`}
                      >
                        {s.label}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] ${
                          isCompleted ? 'text-neutral-500' : 'text-neutral-300'
                        }`}
                      >
                        {s.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {statusSteps.map((s, i) => {
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;

              return (
                <div key={s.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white ${
                        isCompleted
                          ? `${config.bar} border-transparent text-white`
                          : 'border-neutral-200'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-neutral-300" />
                      )}
                      {isCurrent ? (
                        <span
                          className={`absolute inset-0 animate-ping rounded-full opacity-30 ${config.bar}`}
                        />
                      ) : null}
                    </div>
                    {i < statusSteps.length - 1 ? (
                      <div
                        className={`my-1 w-px flex-1 ${
                          i < currentStepIndex ? config.bar : 'bg-neutral-200'
                        }`}
                        style={{ minHeight: '32px' }}
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 pb-4">
                    <p
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-neutral-950' : 'text-neutral-400'
                      }`}
                    >
                      {s.label}
                    </p>
                    <p
                      className={`mt-0.5 text-xs ${
                        isCompleted ? 'text-neutral-500' : 'text-neutral-300'
                      }`}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_rgba(22,19,17,0.05)] ring-1 ring-black/[0.05]">
            <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-5 md:px-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3ebe3] text-neutral-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-medium text-neutral-950">Order items</h2>
                <p className="text-xs text-neutral-500">
                  {items.length} {items.length === 1 ? 'product' : 'products'}
                </p>
              </div>
            </div>

            <div className="divide-y divide-black/[0.06]">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 px-5 py-5 transition hover:bg-[#faf7f3] md:px-6"
                >
                  <Link href={productPath(item)} className="shrink-0">
                    <div className="h-24 w-20 overflow-hidden rounded-xl bg-[#f3ebe3] md:h-28 md:w-24">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-top transition duration-500 hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="min-w-0 flex-1">
                    <Link href={productPath(item)}>
                      <h3 className="line-clamp-2 text-sm font-medium text-neutral-950 transition hover:text-neutral-600 md:text-base">
                        {item.name}
                      </h3>
                    </Link>

                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-neutral-500">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f1ea] px-2.5 py-1">
                        <span className="h-2 w-2 rounded-full bg-neutral-900" />
                        Black
                      </span>
                      <span className="rounded-full bg-[#f6f1ea] px-2.5 py-1">Size M</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-neutral-500">
                        Qty: <span className="font-medium text-neutral-900">{item.qty}</span>
                      </p>
                      <div className="text-right">
                        <p className="font-semibold tabular-nums text-neutral-950">
                          ₹{(item.price * item.qty).toLocaleString('en-IN')}
                        </p>
                        {item.qty > 1 ? (
                          <p className="text-[10px] text-neutral-400">
                            ₹{item.price.toLocaleString('en-IN')} each
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(22,19,17,0.05)] ring-1 ring-black/[0.05] md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3ebe3] text-neutral-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-medium text-neutral-950">Delivery address</h2>
                <p className="text-xs text-neutral-500">Where we&apos;ll deliver your order</p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#faf7f3] p-4 ring-1 ring-black/[0.04]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-medium text-neutral-700 ring-1 ring-black/5">
                  {initials(recipient)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-950">{recipient}</p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                    {addressLines.length
                      ? addressLines.map((line, index) => (
                          <span key={index} className="block">
                            {line}
                          </span>
                        ))
                      : 'Delivery address was not saved with this order.'}
                  </p>
                  {recipientPhone || recipientEmail ? (
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                      {recipientPhone ? <span>{recipientPhone}</span> : null}
                      {recipientPhone && recipientEmail ? (
                        <span className="h-1 w-1 rounded-full bg-neutral-300" />
                      ) : null}
                      {recipientEmail ? <span>{recipientEmail}</span> : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(22,19,17,0.05)] ring-1 ring-black/[0.05] md:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3ebe3] text-neutral-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.6}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </span>
              <div>
                <h2 className="text-lg font-medium text-neutral-950">Payment method</h2>
                <p className="text-xs text-neutral-500">How you paid</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-[#faf7f3] px-4 py-3.5 ring-1 ring-black/[0.04]">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-12 items-center justify-center rounded-md bg-[#161311] text-[10px] font-bold tracking-wider text-[#e7d3b0]">
                  VISA
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-950">•••• •••• •••• 4242</p>
                  <p className="text-[11px] text-neutral-500">Expires 12/26</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Paid
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_rgba(22,19,17,0.08)] ring-1 ring-black/[0.06]">
            <div className="relative overflow-hidden bg-[#161311] px-5 py-5">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--brand-gold,#D0B15A)]/20 blur-3xl"
              />
              <div className="relative flex items-center gap-3">
                <span className="h-px w-6 bg-[#e7d3b0]" />
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#e7d3b0]">
                  Price breakdown
                </h2>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5 space-y-3 rounded-2xl bg-[#faf7f3] p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-medium tabular-nums text-neutral-950">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">
                      Coupon{order.coupon?.code ? ` ${order.coupon.code}` : ''}
                    </span>
                    <span className="font-medium tabular-nums text-emerald-700">
                      −₹{discount.toLocaleString('en-IN')}
                    </span>
                  </div>
                ) : null}
                {order.couponUsed && order.coupon?.code ? (
                  <p className="text-xs font-medium text-emerald-700">Coupon {order.coupon.code} used</p>
                ) : null}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-medium text-emerald-700">Free</span>
                  ) : (
                    <span className="font-medium tabular-nums text-neutral-950">₹{shipping}</span>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Tax (GST 18%)</span>
                  <span className="font-medium tabular-nums text-neutral-950">
                    ₹{tax.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between border-t border-dashed border-neutral-200 pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Total paid
                </p>
                <p className="text-2xl font-medium tabular-nums tracking-tight text-neutral-950">
                  ₹{total.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/[0.05]">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Quick actions
            </p>
            <div className="space-y-2">
              {order.status === 'Shipped' ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f3ebe3] px-4 py-3 text-sm font-medium text-neutral-900 transition hover:bg-[#ebe0d4]"
                >
                  Live track order
                </button>
              ) : null}

              {order.status === 'Delivered' ? (
                <>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Rate your order
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#f6f1ea] px-4 py-3 text-sm font-medium text-neutral-800 transition hover:bg-[#f3ebe3]"
                  >
                    Reorder items
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#faf7f3] px-4 py-3 text-sm font-medium text-neutral-700 ring-1 ring-black/5 transition hover:bg-[#f3ebe3] disabled:cursor-wait disabled:opacity-60"
              >
                {downloading ? 'Preparing PDF…' : 'Download invoice'}
              </button>
              {invoiceError ? <p className="text-center text-xs text-red-600">{invoiceError}</p> : null}
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#faf7f3] px-4 py-3 text-sm font-medium text-neutral-700 ring-1 ring-black/5 transition hover:bg-[#f3ebe3]"
              >
                Need help?
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--brand-gold,#D0B15A)]/35 bg-gradient-to-br from-[#faf7f3] to-[#f3ebe3] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold,#D0B15A)]">
              Need assistance?
            </p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-700">
              Our support team is available 24/7. Reach out anytime.
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-900"
            >
              Contact support →
            </button>
          </div>
        </aside>
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/orders"
          className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-[#f3ebe3] hover:text-neutral-950"
        >
          <svg
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          Back to all orders
        </Link>
      </div>
    </div>
  );
}
