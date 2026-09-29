'use client';

import { useEffect, useState } from 'react';
import DashboardCard from '@/components/admin/DashboardCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeOrder } from '@/lib/apiClient';
import { Package, ShoppingBag, Users, DollarSign, Tags } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });

  useEffect(() => {
    Promise.all([
      api('/api/products?limit=1'),
      api('/api/orders'),
      api('/api/users'),
    ])
      .then(([productData, orders, users]) => {
        const shaped = (orders || []).map(shapeOrder);
        setStats({
          products: productData.total || 0,
          orders: shaped.length,
          users: (users || []).length,
          revenue: shaped.reduce((sum, order) => sum + order.total, 0),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of store activity and catalog health."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <DashboardCard title="Products" value={stats.products} icon={Package} color="bg-neutral-900" />
        <DashboardCard title="Orders" value={stats.orders} icon={ShoppingBag} color="bg-emerald-700" />
        <DashboardCard title="Users" value={stats.users} icon={Users} color="bg-sky-700" />
        <DashboardCard title="Revenue" value={`₹${stats.revenue.toLocaleString('en-IN')}`} icon={DollarSign} color="bg-amber-700" />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/attributes"
          className="group rounded-2xl border border-black/8 bg-white p-5 transition hover:border-neutral-300"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition group-hover:bg-neutral-950 group-hover:text-white">
            <Tags className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-neutral-950">Attributes</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Size, color, and fabric labels used on product forms.
          </p>
        </Link>
        <Link
          href="/admin/products/create"
          className="group rounded-2xl border border-black/8 bg-white p-5 transition hover:border-neutral-300"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 transition group-hover:bg-neutral-950 group-hover:text-white">
            <Package className="h-5 w-5" />
          </div>
          <h2 className="font-semibold text-neutral-950">Add a product</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Create a new listing with pricing, stock, and an ImageKit photo.
          </p>
        </Link>
      </div>
    </div>
  );
}
