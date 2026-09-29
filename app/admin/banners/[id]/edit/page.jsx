'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BannerForm from '@/components/admin/BannerForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

export default function EditBanner() {
  const { id } = useParams();
  const [banner, setBanner] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/banners/${id}`)
      .then(setBanner)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <AdminPageHeader title="Edit banner" description="Changes show on the homepage after you save." />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {banner ? <BannerForm initial={banner} /> : error ? null : <p className="text-sm text-neutral-500">Loading…</p>}
    </div>
  );
}
