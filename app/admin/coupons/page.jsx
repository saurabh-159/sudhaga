'use client';

import { useEffect, useState } from 'react';
import CouponTable from '@/components/admin/CouponTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

function shapeCoupon(coupon) {
  return { ...coupon, id: String(coupon._id || coupon.id) };
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/coupons')
      .then((data) => setCoupons((data || []).map(shapeCoupon)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Create discount codes. A code is marked used only after the customer places the order."
        action={{ href: '/admin/coupons/create', label: '+ Add coupon' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <CouponTable
        coupons={coupons}
        onDelete={async (id) => {
          await api(`/api/coupons/${id}`, { method: 'DELETE' });
          load();
        }}
      />
    </div>
  );
}
