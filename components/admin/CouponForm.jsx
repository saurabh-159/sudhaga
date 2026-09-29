'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';

function dateInput(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function CouponForm({ initial = {} }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [type, setType] = useState(initial.type || 'percent');
  const [active, setActive] = useState(initial.active !== false);
  const [oncePerUser, setOncePerUser] = useState(initial.oncePerUser !== false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const expiresAt = String(form.get('expiresAt') || '');
    const payload = {
      code: form.get('code'),
      description: form.get('description'),
      type,
      value: form.get('value'),
      minSubtotal: form.get('minSubtotal') || 0,
      maxUses: form.get('maxUses') || null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      active,
      oncePerUser,
    };
    try {
      if (initial._id || initial.id) {
        await api(`/api/coupons/${initial._id || initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/coupons', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/coupons');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection
        title="Coupon"
        description="Customers enter this code at checkout. Applying it only previews the discount. It is marked used after the order is placed."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Code"
            name="code"
            defaultValue={initial.code}
            placeholder="WELCOME10"
            required
          />
          <div className="w-full">
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">Discount type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            >
              <option value="percent">Percent off</option>
              <option value="flat">Flat amount off</option>
            </select>
          </div>
          <Input
            label={type === 'percent' ? 'Percent off' : 'Amount off (₹)'}
            name="value"
            type="number"
            min="1"
            max={type === 'percent' ? '100' : undefined}
            step="1"
            defaultValue={initial.value}
            required
          />
          <Input
            label="Minimum subtotal (₹)"
            name="minSubtotal"
            type="number"
            min="0"
            step="1"
            defaultValue={initial.minSubtotal || 0}
          />
          <Input
            label="Usage limit"
            name="maxUses"
            type="number"
            min="1"
            step="1"
            defaultValue={initial.maxUses ?? ''}
            placeholder="Unlimited"
            hint="Leave empty for unlimited uses"
          />
          <Input
            label="Expires"
            name="expiresAt"
            type="datetime-local"
            defaultValue={dateInput(initial.expiresAt)}
            hint="Leave empty if the coupon does not expire"
          />
        </div>
        <Textarea
          label="Description"
          name="description"
          defaultValue={initial.description}
          placeholder="10% off your first order"
          rows={2}
        />
        <label className="flex items-center gap-2 text-sm text-neutral-800">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-800">
          <input
            type="checkbox"
            checked={oncePerUser}
            onChange={(event) => setOncePerUser(event.target.checked)}
          />
          One use per customer
        </label>
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save coupon'}
        </Button>
        <Link href="/admin/coupons">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
