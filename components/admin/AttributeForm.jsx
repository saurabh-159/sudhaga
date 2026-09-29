'use client';

import { useState } from 'react';
import Link from 'next/link';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import AdminFormSection from './AdminFormSection';
import { Plus, X } from 'lucide-react';

export default function AttributeForm({ initial = {}, onSubmit }) {
  const [values, setValues] = useState(initial.values || ['']);
  const [draft, setDraft] = useState('');

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) return;
    setValues((prev) => [...prev.filter(Boolean), trimmed]);
    setDraft('');
  };

  const removeValue = (value) => {
    setValues((prev) => prev.filter((v) => v !== value));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ values: values.filter(Boolean) });
      }}
      className="space-y-5"
    >
      <AdminFormSection
        title="Attribute details"
        description="Define a filter or option group used across products."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Name"
            name="name"
            defaultValue={initial.name}
            placeholder="Size"
            required
          />
          <Input
            label="Slug"
            name="slug"
            defaultValue={initial.slug}
            placeholder="size"
            hint="Used in URLs and APIs"
            required
          />
        </div>
        <Select
          label="Type"
          name="type"
          defaultValue={initial.type || 'select'}
          options={[
            { value: 'select', label: 'Select (multi-value)' },
            { value: 'color', label: 'Color swatch' },
            { value: 'text', label: 'Text' },
          ]}
        />
      </AdminFormSection>

      <AdminFormSection
        title="Values"
        description="Add the options customers can choose from."
      >
        <div className="flex gap-2">
          <Input
            label="Add value"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. XL"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addValue();
              }
            }}
          />
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={addValue}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {values.filter(Boolean).length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-center text-sm text-neutral-500">
            No values yet — add at least one option.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {values.filter(Boolean).map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800"
              >
                {value}
                <button
                  type="button"
                  onClick={() => removeValue(value)}
                  className="rounded p-0.5 text-neutral-400 transition hover:bg-white hover:text-neutral-900"
                  aria-label={`Remove ${value}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </AdminFormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
        <Button type="submit">Save attribute</Button>
        <Link href="/admin/attributes">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
