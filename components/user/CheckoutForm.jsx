'use client';

import { MapPin, Plus } from 'lucide-react';
import Input from '../ui/Input';
import { addressKey, addressesFromUser, draftFromEntry, emptyShipping } from '@/lib/addressBook';

const fieldClass =
  'rounded-xl border-black/10 bg-[#faf7f3] focus:border-[var(--brand-gold,#D0B15A)] focus:ring-[var(--brand-gold,#D0B15A)]/20';

function sameDraft(draft, entry) {
  return addressKey({ line1: draft?.address, city: draft?.city, pincode: draft?.pincode }) === addressKey(entry);
}

export default function CheckoutForm({ user, value, onChange, usingNew, onUseSaved, onAddNew }) {
  const form = value || emptyShipping;
  const saved = addressesFromUser(user);
  const selected = usingNew ? null : saved.find((entry) => sameDraft(form, entry));
  const addingNew = Boolean(usingNew);

  function setField(key, fieldValue) {
    onChange({ ...form, [key]: fieldValue });
  }

  function useSaved(entry) {
    onUseSaved?.();
    onChange(draftFromEntry(entry, user));
  }

  function startNew() {
    onAddNew?.();
    onChange({
      name: form.name || user?.name || '',
      phone: form.phone || user?.phone || '',
      email: form.email || user?.email || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });
  }

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="space-y-4"
      id="checkout-form"
    >
      {saved.length ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Saved addresses
          </p>
          {saved.map((entry) => {
            const active = selected && addressKey(selected) === addressKey(entry);
            return (
              <button
                key={addressKey(entry)}
                type="button"
                onClick={() => useSaved(entry)}
                className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  active
                    ? 'bg-[#faf7f3] ring-2 ring-neutral-950'
                    : 'bg-white ring-1 ring-black/10 hover:ring-black/20'
                }`}
              >
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active ? 'border-neutral-950' : 'border-neutral-300'
                  }`}
                >
                  {active ? <span className="h-2 w-2 rounded-full bg-neutral-950" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-950">
                    <MapPin className="h-3.5 w-3.5 text-[var(--brand-gold,#D0B15A)]" strokeWidth={1.6} />
                    {entry.name || 'Saved address'}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
                    {entry.line1}, {entry.city}, {entry.state} {entry.pincode}
                    {entry.phone ? ` · ${entry.phone}` : ''}
                  </span>
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={startNew}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              addingNew
                ? 'bg-[#faf7f3] text-neutral-950 ring-2 ring-neutral-950'
                : 'bg-white text-neutral-800 ring-1 ring-black/10 hover:ring-black/20'
            }`}
          >
            <Plus className="h-4 w-4" strokeWidth={1.6} />
            Add a new address
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Full name"
          name="name"
          required
          className={fieldClass}
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
        />
        <Input
          label="Phone"
          name="phone"
          required
          className={fieldClass}
          value={form.phone}
          onChange={(event) => setField('phone', event.target.value)}
        />
      </div>
      <Input
        label="Email"
        name="email"
        type="email"
        required
        className={fieldClass}
        value={form.email}
        onChange={(event) => setField('email', event.target.value)}
      />
      <Input
        label="Address"
        name="address"
        required
        className={fieldClass}
        value={form.address}
        onChange={(event) => setField('address', event.target.value)}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Input
          label="City"
          name="city"
          required
          className={fieldClass}
          value={form.city}
          onChange={(event) => setField('city', event.target.value)}
        />
        <Input
          label="State"
          name="state"
          required
          className={fieldClass}
          value={form.state}
          onChange={(event) => setField('state', event.target.value)}
        />
        <Input
          label="Pincode"
          name="pincode"
          required
          className={fieldClass}
          value={form.pincode}
          onChange={(event) => setField('pincode', event.target.value)}
        />
      </div>
      {user ? (
        <p className="text-xs leading-relaxed text-neutral-500">
          This address is saved to your profile when you continue, so the next order is already filled in.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-neutral-500">
          Sign in with Google to save this address and place the order.
        </p>
      )}
    </form>
  );
}
