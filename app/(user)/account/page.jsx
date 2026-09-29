'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/apiClient';
import { useCatalog } from '@/components/user/CatalogProvider';

function safeNext(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

function AccountForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refreshSession } = useCatalog();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const next = safeNext(params.get('next'));

  async function onSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      if (mode === 'register') {
        await api('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name: form.get('name'),
            email: form.get('email'),
            password: form.get('password'),
          }),
        });
      } else {
        await api('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: form.get('email'),
            password: form.get('password'),
            portal: 'store',
          }),
        });
      }
      await refreshSession();
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-black/10 bg-white p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Account</p>
        <h1 className="mt-2 text-2xl font-medium text-neutral-950">
          {mode === 'login' ? 'Login' : 'Create account'}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          Items saved on this device move to your account after login.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {mode === 'register' ? <Input label="Name" name="name" required /> : null}
          <Input label="Email" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required minLength={6} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </Button>
        </form>
        <button
          type="button"
          className="mt-4 text-sm text-neutral-600 underline underline-offset-4"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-center">Loading…</p>}>
      <AccountForm />
    </Suspense>
  );
}
