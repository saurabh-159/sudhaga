'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FooterLinkForm from '@/components/admin/FooterLinkForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

export default function EditFooterLink() {
  const { id } = useParams();
  const [link, setLink] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/footer-links/${id}`)
      .then(setLink)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <AdminPageHeader
        title="Edit footer link"
        description="Update the text shoppers see, or replace the page or social URL."
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {link ? <FooterLinkForm initial={link} /> : error ? null : <p className="text-sm text-neutral-500">Loading…</p>}
    </div>
  );
}
