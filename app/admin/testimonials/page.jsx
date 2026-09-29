'use client';

import { useEffect, useState } from 'react';
import TestimonialTable from '@/components/admin/TestimonialTable';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

function shape(review) {
  return { ...review, id: String(review._id || review.id) };
}

export default function AdminTestimonials() {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState('');

  const load = () => {
    api('/api/testimonials')
      .then((data) => setReviews((data || []).map(shape)))
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Reviews"
        description="Customer quotes on the homepage. Hidden reviews stay in the list but are not shown in the store."
        action={{ href: '/admin/testimonials/create', label: '+ Add review' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <TestimonialTable
        reviews={reviews}
        onDelete={async (id) => {
          await api(`/api/testimonials/${id}`, { method: 'DELETE' });
          load();
        }}
      />
    </div>
  );
}
