'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFormSection from '@/components/admin/AdminFormSection';
import { api, shapeOrder } from '@/lib/apiClient';
import Link from 'next/link';

const statusStyles = {
  Delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Shipped: 'bg-sky-50 text-sky-800 border-sky-200',
  Paid: 'bg-violet-50 text-violet-800 border-violet-200',
  Pending: 'bg-amber-50 text-amber-800 border-amber-200',
  Cancelled: 'bg-red-50 text-red-800 border-red-200',
};

const STATUSES = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    api(`/api/orders/${id}`)
      .then((data) => setOrder(shapeOrder(data)))
      .catch(() => setMissing(true));
  }, [id]);

  async function updateStatus(status) {
    const updated = await api(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    setOrder(shapeOrder(updated));
  }

  if (missing) return <p className="p-6">Order not found.</p>;
  if (!order) return <p className="p-6">Loading order…</p>;

  return (
    <div>
      <AdminPageHeader
        title={`Order ${order.id.slice(-8)}`}
        description="Order summary and fulfillment status."
        action={
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
          >
            Back to orders
          </Link>
        }
      />

      <AdminFormSection title="Details">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Date</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{order.date}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Items</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">{order.itemCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Total</dt>
            <dd className="mt-1 text-sm font-medium text-neutral-900">
              ₹{order.total.toLocaleString('en-IN')}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Status</dt>
            <dd className="mt-1">
              <span
                className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                  statusStyles[order.status] || 'border-neutral-200 bg-neutral-50 text-neutral-700'
                }`}
              >
                {order.status}
              </span>
            </dd>
          </div>
        </dl>
        <label className="mt-4 block text-sm font-medium text-neutral-800">
          Update status
          <select
            className="mt-1.5 w-full max-w-xs rounded-xl border border-neutral-200 px-3 py-2 text-sm"
            value={order.status}
            onChange={(event) => updateStatus(event.target.value)}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <ul className="mt-4 space-y-2">
          {(order.items || []).map((item, index) => (
            <li key={index} className="flex justify-between text-sm text-neutral-700">
              <span>{item.name} × {item.qty}</span>
              <span>₹{Number(item.price || 0).toLocaleString('en-IN')}</span>
            </li>
          ))}
        </ul>
      </AdminFormSection>
    </div>
  );
}
