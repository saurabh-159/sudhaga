'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';
import { policyPath } from '@/lib/policyInput';

export default function PolicyTable({ policies = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Page</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                  No pages yet.
                </td>
              </tr>
            ) : null}
            {policies.map((policy) => (
              <tr key={policy.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-950">{policy.title}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{policyPath(policy)}</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className={policy.system ? 'text-neutral-700' : policy.published ? 'text-emerald-700' : 'text-neutral-400'}>
                    {policy.system ? 'Required' : policy.published ? 'Published' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/policies/${policy.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    {policy.system ? null : (
                      <Button variant="danger" size="sm" onClick={() => onDelete?.(policy.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
