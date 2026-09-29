'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import TestimonialForm from '@/components/admin/TestimonialForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

export default function EditTestimonial() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/testimonials/${id}`)
      .then(setReview)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <AdminPageHeader title="Edit review" description="Update the quote shown on the homepage." />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {review ? <TestimonialForm initial={review} /> : error ? null : <p className="text-sm text-neutral-500">Loading…</p>}
    </div>
  );
}
