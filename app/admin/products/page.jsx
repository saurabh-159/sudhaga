'use client';

import { useEffect, useState } from 'react';
import ProductTable from '@/components/admin/ProductTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeProduct } from '@/lib/apiClient';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/products?limit=100')
      .then((data) => setProducts((data.products || []).map(shapeProduct)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage catalog items, stock, and pricing."
        action={{ href: '/admin/products/create', label: '+ Add product' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <ProductTable
        products={products}
        onDelete={async (id) => {
          await api(`/api/products/${id}`, { method: 'DELETE' });
          load();
        }}
      />
    </div>
  );
}
