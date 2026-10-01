'use client';

import Link from 'next/link';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminFormSection from '@/components/admin/AdminFormSection';

export default function AdminSettings() {
  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Store identity and checkout defaults."
      />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-5"
      >
        <AdminFormSection
          title="Seller and policies"
          description="Contact details, the grievance officer, and the shipping, returns, privacy, and terms pages."
        >
          <Link href="/admin/policies" className="text-sm font-medium text-neutral-950 underline">
            Edit policies
          </Link>
        </AdminFormSection>

        <AdminFormSection
          title="Footer"
          description="Help and social links. Admins can change the text and paste a page or profile URL."
        >
          <Link href="/admin/footer" className="text-sm font-medium text-neutral-950 underline">
            Edit footer links
          </Link>
        </AdminFormSection>

        <AdminFormSection
          title="Commerce"
          description="Currency and tax defaults for order totals."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Currency"
              defaultValue="INR"
              options={[
                { value: 'INR', label: 'INR — Indian Rupee' },
                { value: 'USD', label: 'USD — US Dollar' },
              ]}
            />
            <Input label="Tax rate (%)" type="number" defaultValue="0" min="0" />
          </div>
        </AdminFormSection>

        <div className="flex flex-wrap items-center gap-3 border-t border-black/6 pt-5">
          <Button type="submit">Save settings</Button>
          <Button type="button" variant="outline">
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
