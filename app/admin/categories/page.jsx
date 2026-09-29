'use client';

import { useEffect, useState } from 'react';
import CategoryTable from '@/components/admin/CategoryTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api, shapeCategory } from '@/lib/apiClient';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/categories')
      .then((data) => setCategories((data || []).map(shapeCategory)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Organize the storefront into collections."
        action={{ href: '/admin/categories/create', label: '+ Add category' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <CategoryTable
        categories={categories}
        onDelete={async (id) => {
          await api(`/api/categories/${id}`, { method: 'DELETE' });
          load();
        }}
      />
    </div>
  );
}
