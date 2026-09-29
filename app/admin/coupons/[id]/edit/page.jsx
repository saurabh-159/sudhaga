'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CouponForm from '@/components/admin/CouponForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

export default function EditCoupon() {
  const { id } = useParams();
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/coupons/${id}`)
      .then(setCoupon)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <AdminPageHeader title="Edit coupon" description="Update this code without changing how many times it has already been used." />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {coupon ? <CouponForm initial={coupon} /> : error ? null : <p className="text-sm text-neutral-500">Loading…</p>}
    </div>
  );
}
