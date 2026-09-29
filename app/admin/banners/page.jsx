'use client';

import { useEffect, useState } from 'react';
import BannerTable from '@/components/admin/BannerTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

function shape(banner) {
  return { ...banner, id: String(banner._id || banner.id) };
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/banners')
      .then((data) => setBanners((data || []).map(shape)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Homepage"
        description="Slides, the sale promo, and deal-of-the-day panels. The storefront reads these from the homepage API."
        action={{ href: '/admin/banners/create', label: '+ Add banner' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <BannerTable
        banners={banners}
        onDelete={async (id) => {
          await api(`/api/banners/${id}`, { method: 'DELETE' });
          load();
        }}
      />
    </div>
  );
}
