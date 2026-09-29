'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, shapeOrder } from '@/lib/apiClient';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  ChevronRight,
  MapPin,
  Calendar,
  ShoppingBag,
  RotateCcw,
  Download,
  Star,
  ChevronDown,
  Boxes,
} from 'lucide-react';

function getOrderThumbs(order) {
  return (order.images || []).filter((item) => item?.image).slice(0, 2);
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [invoiceId, setInvoiceId] = useState('');

  useEffect(() => {
    api('/api/orders')
      .then((data) =>
        setOrders(
          (data || []).map((order) => {
            const shaped = shapeOrder(order);
            return {
              ...shaped,
              items: shaped.itemCount,
              images: (order.items || []).map((item, index) => ({
                id: item.product || index,
                image: item.image,
              })),
            };
          })
        )
      )
      .catch(() => setOrders([]));
  }, []);
  async function handleDownloadInvoice(orderId) {
    if (invoiceId) return;
    setInvoiceId(orderId);
    try {
      const data = await api(`/api/orders/${orderId}`);
      const { downloadOrderInvoice } = await import('@/lib/invoicePdf.mjs');
      await downloadOrderInvoice(shapeOrder(data));
    } catch {
      setInvoiceId('');
      return;
    }
    setInvoiceId('');
  }

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filters = [
    { id: 'all', label: 'All', icon: Boxes },
    { id: 'Pending', label: 'Pending', icon: Clock },
    { id: 'Paid', label: 'Paid', icon: Clock },
    { id: 'Shipped', label: 'Shipped', icon: Truck },
    { id: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
    { id: 'Cancelled', label: 'Cancelled', icon: XCircle },
  ];

  const statusConfig = {
    Pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      icon: Clock,
    },
    Paid: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      icon: Clock,
    },
    Processing: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      icon: Clock,
    },
    Shipped: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      dot: 'bg-sky-500',
      bar: 'bg-sky-500',
      icon: Truck,
    },
    Delivered: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      bar: 'bg-emerald-600',
      icon: CheckCircle2,
    },
    Cancelled: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      dot: 'bg-red-500',
      bar: 'bg-red-500',
      icon: XCircle,
    },
  };

  const stats = useMemo(
    () => ({
      total: orders.length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
      inTransit: orders.filter((o) => ['Shipped', 'Processing', 'Pending', 'Paid'].includes(o.status)).length,
      totalSpent: orders.reduce((s, o) => s + (o.total || 0), 0),
    }),
    [orders],
  );

  const visibleOrders = useMemo(() => {
    let result = orders;

    if (activeFilter !== 'all') {
      result = result.filter((o) => o.status === activeFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) => o.id?.toLowerCase().includes(q) || o.status?.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'high') return b.total - a.total;
      if (sortBy === 'low') return a.total - b.total;
      return 0;
    });

    return result;
  }, [orders, activeFilter, search, sortBy]);

  const getProgress = (status) => {
    if (status === 'Pending' || status === 'Paid' || status === 'Processing') return 33;
    if (status === 'Shipped') return 66;
    if (status === 'Delivered') return 100;
    return 0;
  };

  const timelineSteps = ['Ordered', 'Packed', 'Shipped', 'Delivered'];

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(208,177,90,0.08),_transparent_60%)]"
      />

      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--brand-gold,#D0B15A)]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-500">
              Order history
            </p>
          </div>
          <h1 className="text-3xl font-medium tracking-tight text-neutral-950 md:text-[2.75rem] md:leading-none">
            My Orders
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Track, manage, and review all your orders in one place
          </p>
        </div>

        <Link
          href="/products"
          className="group inline-flex items-center gap-2 self-start rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800 md:self-end"
        >
          <ShoppingBag className="h-4 w-4" strokeWidth={1.6} />
          Continue shopping
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Total orders', value: stats.total, icon: Boxes },
          { label: 'Delivered', value: stats.delivered, icon: CheckCircle2 },
          { label: 'In transit', value: stats.inTransit, icon: Truck },
          {
            label: 'Total spent',
            value: `₹${stats.totalSpent.toLocaleString('en-IN')}`,
            icon: Package,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white px-4 py-5 shadow-[0_8px_30px_rgba(22,19,17,0.04)] ring-1 ring-black/[0.05] md:px-5"
            >
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#f3ebe3]">
                <Icon className="h-4 w-4 text-[var(--brand-gold,#D0B15A)]" strokeWidth={1.6} />
              </span>
              <p className="text-2xl font-medium tabular-nums tracking-tight text-neutral-950 md:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search + Sort */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID or status..."
            className="w-full rounded-full border border-black/10 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:border-[var(--brand-gold,#D0B15A)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold,#D0B15A)]/20"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full appearance-none rounded-full border border-black/10 bg-white py-3 pl-4 pr-10 text-sm font-medium text-neutral-700 shadow-sm transition hover:border-black/20 focus:border-[var(--brand-gold,#D0B15A)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-gold,#D0B15A)]/20 md:w-auto"
          >
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest first</option>
            <option value="high">Price: high to low</option>
            <option value="low">Price: low to high</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          const count =
            f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length;

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-neutral-950 text-white shadow-md shadow-neutral-950/15'
                  : 'bg-white text-neutral-600 ring-1 ring-black/10 hover:bg-[#faf7f3]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? '' : 'text-neutral-400'}`} strokeWidth={1.6} />
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  isActive ? 'bg-white/15 text-white' : 'bg-[#f3ebe3] text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visibleOrders.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-[#faf7f3] px-6 py-20 text-center md:py-28">
          <div className="relative mx-auto mb-8 w-fit">
            <div className="absolute inset-0 scale-150 rounded-full bg-[var(--brand-gold,#D0B15A)]/15 blur-2xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-[0_8px_30px_rgba(22,19,17,0.08)] ring-1 ring-black/5">
              <Package className="h-8 w-8 text-neutral-700" strokeWidth={1.4} />
            </div>
          </div>
          <h2 className="text-2xl font-medium tracking-tight text-neutral-950 md:text-3xl">
            {search || activeFilter !== 'all' ? 'No matching orders' : 'No orders yet'}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
            {search || activeFilter !== 'all'
              ? 'Try adjusting your filters or search term.'
              : "You haven't placed any orders yet. Start shopping to see them here."}
          </p>
          <Link
            href="/products"
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-medium tracking-wide text-white transition hover:bg-neutral-800"
          >
            Start shopping
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.Processing;
            const Icon = config.icon;
            const progress = getProgress(order.status);
            const currentStepIndex = Math.floor((progress / 100) * (timelineSteps.length - 1));
            const thumbs = getOrderThumbs(order);

            return (
              <article
                key={order.id}
                className="group overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(22,19,17,0.04)] ring-1 ring-black/[0.06] transition duration-300 hover:shadow-[0_16px_40px_rgba(22,19,17,0.08)] hover:ring-black/10"
              >
                <div className={`h-1 ${config.bar}`} />

                <div className="p-5 md:p-6">
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3ebe3] text-neutral-800">
                        <Icon className="h-5 w-5" strokeWidth={1.6} />
                      </span>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Order ID
                        </p>
                        <p className="text-base font-medium tracking-tight text-neutral-950 md:text-lg">
                          #{order.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden items-center -space-x-2 sm:flex">
                        {thumbs.map((p) => (
                          <img
                            key={p.id}
                            src={p.image}
                            alt=""
                            className="h-11 w-11 rounded-xl object-cover ring-2 ring-white"
                          />
                        ))}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-400">
                          Total
                        </p>
                        <p className="text-xl font-semibold tabular-nums tracking-tight text-neutral-950 md:text-2xl">
                          ₹{order.total?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {order.date}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-neutral-300" />
                    <span className="inline-flex items-center gap-1.5">
                      <Boxes className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {order.items} {order.items === 1 ? 'item' : 'items'}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-neutral-300" />
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium ${config.bg} ${config.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {order.status}
                    </span>
                  </div>

                  {order.status !== 'Cancelled' ? (
                    <div className="relative mb-5 rounded-2xl bg-[#faf7f3] px-4 py-4">
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-3 right-3 top-3 h-px bg-neutral-200" />
                        <div
                          className={`absolute left-3 top-3 h-px ${config.bar} transition-all duration-700`}
                          style={{ width: `calc((100% - 24px) * ${progress / 100})` }}
                        />

                        {timelineSteps.map((step, i) => {
                          const isCompleted = i <= currentStepIndex;
                          const isCurrent = i === currentStepIndex;

                          return (
                            <div key={step} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white transition ${
                                  isCompleted
                                    ? `${config.bar} border-transparent text-white`
                                    : 'border-neutral-200'
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-3 w-3" />
                                ) : (
                                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                                )}
                                {isCurrent ? (
                                  <span
                                    className={`absolute inset-0 animate-ping rounded-full opacity-30 ${config.bar}`}
                                  />
                                ) : null}
                              </div>
                              <p
                                className={`mt-1.5 text-[9px] font-medium whitespace-nowrap md:text-[10px] ${
                                  isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                                }`}
                              >
                                {step}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3.5 py-3">
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-xs font-medium text-red-700">
                        This order was cancelled. Any payment made will be refunded within 3–5
                        business days.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 border-t border-black/[0.06] pt-4">
                    <Link
                      href={`/orders/${order.id}`}
                      className="group/btn inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2.5 text-xs font-medium tracking-wide text-white transition hover:bg-neutral-800"
                    >
                      View details
                      <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>

                    {order.status === 'Shipped' ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f1ea] px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-[#f3ebe3]"
                      >
                        <MapPin className="h-3.5 w-3.5" strokeWidth={1.6} />
                        Track order
                      </button>
                    ) : null}

                    {order.status === 'Delivered' ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f1ea] px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-[#f3ebe3]"
                        >
                          <Star className="h-3.5 w-3.5" strokeWidth={1.6} />
                          Rate order
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f1ea] px-4 py-2.5 text-xs font-medium text-neutral-800 transition hover:bg-[#f3ebe3]"
                        >
                          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.6} />
                          Reorder
                        </button>
                      </>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(order.id)}
                      disabled={invoiceId === order.id}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium text-neutral-400 transition hover:bg-[#faf7f3] hover:text-neutral-900 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Download className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {invoiceId === order.id ? 'Preparing…' : 'Invoice'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
