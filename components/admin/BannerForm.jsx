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

const PLACEMENTS = [
  { value: 'hero', label: 'Hero slide' },
  { value: 'promo', label: 'Promo banner' },
  { value: 'deal-side', label: 'Deal side image' },
  { value: 'deal-center', label: 'Deal center panel' },
];

export default function BannerForm({ initial = {} }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState('');
  const [placement, setPlacement] = useState(initial.placement || 'hero');
  const [active, setActive] = useState(initial.active !== false);
  const [accent, setAccent] = useState(Boolean(initial.accent));
  const [image, setImage] = useState(initial.image || '');
  const [hoverImage, setHoverImage] = useState(initial.hoverImage || '');

  async function upload(event, setter) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append('file', file);
    const uploaded = await api('/api/upload', { method: 'POST', body });
    setter(uploaded.url);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving('save');
    const form = new FormData(event.currentTarget);
    const endsAt = String(form.get('endsAt') || '');
    const payload = {
      placement,
      title: form.get('title'),
      subtitle: form.get('subtitle'),
      badge: form.get('badge'),
      href: form.get('href'),
      cta: form.get('cta'),
      code: form.get('code'),
      image,
      hoverImage,
      imageAlt: form.get('imageAlt'),
      accent,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      order: form.get('order') || 0,
      active,
    };
    try {
      if (initial._id || initial.id) {
        await api(`/api/banners/${initial._id || initial.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await api('/api/banners', { method: 'POST', body: JSON.stringify(payload) });
      }
      router.push('/admin/banners');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AdminFormSection
        title="Placement"
        description="Hero slides, the sale promo, and the deal-of-the-day panels all come from this list."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-800">Where it shows</label>
            <select
              value={placement}
              onChange={(event) => setPlacement(event.target.value)}
              className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            >
              {PLACEMENTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Input label="Sort order" name="order" type="number" defaultValue={initial.order ?? 0} />
        </div>
        <label className="flex items-center gap-3 text-sm text-neutral-800">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="h-4 w-4" />
          Visible on the homepage
        </label>
      </AdminFormSection>

      <AdminFormSection title="Copy and link" description="The link must start with / so it stays inside the store.">
        <Input label="Title" name="title" defaultValue={initial.title} required />
        <Textarea label="Subtitle" name="subtitle" defaultValue={initial.subtitle} rows={3} />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Link" name="href" defaultValue={initial.href || '/products'} placeholder="/products" required />
          <Input label="Button label" name="cta" defaultValue={initial.cta} placeholder="Shop the edit" />
          <Input label="Badge" name="badge" defaultValue={initial.badge} placeholder="Just In" />
          {placement === 'promo' ? (
            <Input label="Coupon code" name="code" defaultValue={initial.code} placeholder="B1G1" />
          ) : (
            <input type="hidden" name="code" value="" />
          )}
          {placement === 'promo' ? (
            <Input label="Offer ends" name="endsAt" type="datetime-local" defaultValue={dateInput(initial.endsAt)} />
          ) : null}
        </div>
        {placement === 'hero' ? (
          <label className="flex items-center gap-3 text-sm text-neutral-800">
            <input type="checkbox" checked={accent} onChange={(event) => setAccent(event.target.checked)} className="h-4 w-4" />
            Italic title
          </label>
        ) : null}
      </AdminFormSection>

      {placement !== 'deal-center' ? (
        <AdminFormSection title="Image" description="Upload a photo or paste an image URL.">
          <Input label="Upload image" type="file" accept="image/*" onChange={(event) => upload(event, setImage)} />
          <Input label="Image URL" value={image} onChange={(event) => setImage(event.target.value)} />
          <Input label="Image description" name="imageAlt" defaultValue={initial.imageAlt} hint="SEO task 15. What this banner photo shows, in normal words." />
          {placement === 'deal-side' ? (
            <>
              <Input label="Upload hover image" type="file" accept="image/*" onChange={(event) => upload(event, setHoverImage)} />
              <Input label="Hover image URL" value={hoverImage} onChange={(event) => setHoverImage(event.target.value)} />
            </>
          ) : null}
          {image ? <img src={image} alt="" className="h-40 w-full rounded-xl object-cover" /> : null}
        </AdminFormSection>
      ) : null}

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={Boolean(saving)}>{saving ? 'Saving…' : 'Save banner'}</Button>
        <Link href="/admin/banners">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  );
}
