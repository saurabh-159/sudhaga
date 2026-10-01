'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

function columnName(section) {
  return section === 'follow' ? 'Follow' : 'Help';
}

export default function FooterLinkTable({ links = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Text</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Column</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No footer links yet.
                </td>
              </tr>
            ) : null}
            {links.map((link) => (
              <tr key={link.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <p className="font-medium text-neutral-950">{link.label}</p>
                  <p className="mt-0.5 max-w-md truncate text-xs text-neutral-500">
                    {link.url || 'Add a URL before this can appear in the footer'}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400 sm:hidden">{columnName(link.section)}</p>
                </td>
                <td className="hidden px-4 py-3 text-neutral-700 sm:table-cell">{columnName(link.section)}</td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className={!link.url ? 'text-amber-700' : link.published ? 'text-emerald-700' : 'text-neutral-400'}>
                    {!link.url ? 'Needs URL' : link.published ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/footer/${link.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => onDelete?.(link.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </Button>
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
