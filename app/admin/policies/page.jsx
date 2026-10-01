'use client';

import { useEffect, useState } from 'react';
import PolicyTable from '@/components/admin/PolicyTable';
import StoreProfileForm from '@/components/admin/StoreProfileForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { api } from '@/lib/apiClient';

function shape(policy) {
  return { ...policy, id: String(policy._id || policy.id), system: Boolean(policy.system) };
}

export default function AdminPolicies() {
  const [policies, setPolicies] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([api('/api/policies'), api('/api/store-profile')])
      .then(([pages, store]) => {
        setPolicies((pages || []).map(shape));
        setProfile(store);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <AdminPageHeader
        title="Policies"
        description="Seller contact, and the pages a payment gateway and Google Merchant Center expect."
        action={{ href: '/admin/policies/create', label: '+ Add page' }}
      />
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      {profile ? <StoreProfileForm initial={profile} /> : error ? null : <p className="mb-6 text-sm text-neutral-500">Loading contact details…</p>}
      <PolicyTable
        policies={policies}
        onDelete={async (id) => {
          if (!window.confirm('Delete this page? It will leave the site and the footer.')) return;
          try {
            await api(`/api/policies/${id}`, { method: 'DELETE' });
            load();
          } catch (err) {
            setError(err.message);
          }
        }}
      />
    </div>
  );
}
