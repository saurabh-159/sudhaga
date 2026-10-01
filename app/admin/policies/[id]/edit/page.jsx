'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PolicyForm from '@/components/admin/PolicyForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

export default function EditPolicy() {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/api/policies/${id}`)
      .then(setPolicy)
      .catch((err) => setError(err.message));
  }, [id]);

  return (
    <div>
      <AdminPageHeader title="Edit page" description="Saved text replaces the public page." />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {policy ? <PolicyForm initial={policy} /> : error ? null : <p className="text-sm text-neutral-500">Loading…</p>}
    </div>
  );
}
