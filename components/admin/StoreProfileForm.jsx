'use client';

import { useState } from 'react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { api } from '@/lib/apiClient';

export default function StoreProfileForm({ initial }) {
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaved(false);
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api('/api/store-profile', { method: 'PUT', body: JSON.stringify(payload) });
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-5">
      <AdminFormSection
        title="Seller contact"
        description="Shown on the contact page. Gateways and Google Merchant Center expect a legal name, a full address, a phone or email, and a grievance officer."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Seller name" name="legalName" defaultValue={initial.legalName} required />
          <Input label="Support email" name="email" type="email" defaultValue={initial.email} required />
          <Input label="Phone" name="phone" type="tel" defaultValue={initial.phone} placeholder="98xxxxxxxx" />
          <Input label="Country" name="country" defaultValue={initial.country || 'India'} />
        </div>
        <Input label="Address line 1" name="addressLine1" defaultValue={initial.addressLine1} />
        <Input label="Address line 2" name="addressLine2" defaultValue={initial.addressLine2} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="City" name="city" defaultValue={initial.city} />
          <Input label="State" name="state" defaultValue={initial.state} />
          <Input label="PIN code" name="pincode" defaultValue={initial.pincode} inputMode="numeric" />
        </div>
        <Textarea
          label="Contact page intro"
          name="contactIntro"
          defaultValue={initial.contactIntro}
          rows={3}
        />
      </AdminFormSection>

      <AdminFormSection
        title="Grievance officer"
        description="Required on an Indian e-commerce contact page. Use a person who will actually receive complaints."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Name" name="grievanceName" defaultValue={initial.grievanceName} />
          <Input
            label="Designation"
            name="grievanceDesignation"
            defaultValue={initial.grievanceDesignation || 'Grievance Officer'}
          />
          <Input label="Email" name="grievanceEmail" type="email" defaultValue={initial.grievanceEmail} />
          <Input label="Phone" name="grievancePhone" type="tel" defaultValue={initial.grievancePhone} />
        </div>
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-700">Contact details saved.</p> : null}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save contact details'}
        </Button>
      </div>
    </form>
  );
}
