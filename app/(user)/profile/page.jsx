'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/apiClient';
import { useCatalog } from '@/components/user/CatalogProvider';

export default function ProfilePage() {
  const router = useRouter();
  const { refreshSession } = useCatalog();
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/auth/me').then(setUser).catch((err) => setError(err.message));
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const updated = await api('/api/auth/me', {
        method: 'PUT',
        body: JSON.stringify({
          name: form.get('name'),
          phone: form.get('phone'),
          address: {
            line1: form.get('line1'),
            city: form.get('city'),
            state: form.get('state'),
            pincode: form.get('pincode'),
          },
        }),
      });
      setUser(updated);
      setMessage('Profile saved.');
    } catch (err) {
      setError(err.message);
    }
  }

  if (!user && !error) return <p className="px-4 py-8">Loading profile…</p>;
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-medium">My Profile</h1>
        <p className="mt-3 text-sm text-neutral-500">Login to see your account.</p>
        <Link href="/account?next=/profile" className="mt-6 inline-block rounded-full bg-neutral-950 px-6 py-3 text-sm text-white">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <form className="space-y-4 rounded-2xl border bg-white p-4 sm:p-6" onSubmit={onSubmit}>
        <Input label="Name" name="name" defaultValue={user?.name || ''} required />
        <Input label="Email" name="email" defaultValue={user?.email || ''} disabled />
        <Input label="Phone" name="phone" defaultValue={user?.phone || ''} />
        <Input label="Address" name="line1" defaultValue={user?.address?.line1 || ''} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Input label="City" name="city" defaultValue={user?.address?.city || ''} />
          <Input label="State" name="state" defaultValue={user?.address?.state || ''} />
          <div className="col-span-2 md:col-span-1">
            <Input label="Pincode" name="pincode" defaultValue={user?.address?.pincode || ''} />
          </div>
        </div>
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button>Save Changes</Button>
        <button
          type="button"
          className="ml-3 text-sm text-neutral-600 underline underline-offset-4"
          onClick={async () => {
            await api('/api/auth/logout', { method: 'POST' });
            await refreshSession();
            router.push('/');
          }}
        >
          Logout
        </button>
      </form>
    </div>
  );
}
