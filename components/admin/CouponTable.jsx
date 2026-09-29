'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

function discountLabel(coupon) {
  if (coupon.type === 'percent') return `${coupon.value}% off`;
  return `₹${Number(coupon.value || 0).toLocaleString('en-IN')} off`;
}

export default function CouponTable({ coupons = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Discount</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Used</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No coupons yet.
                </td>
              </tr>
            ) : null}
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <p className="font-mono font-medium text-neutral-950">{coupon.code}</p>
                  {coupon.description ? (
                    <p className="mt-0.5 max-w-xs truncate text-xs text-neutral-500">{coupon.description}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-neutral-700">{discountLabel(coupon)}</td>
                <td className="hidden px-4 py-3 text-neutral-700 sm:table-cell">
                  {coupon.usedCount || 0}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <span className={coupon.active ? 'text-emerald-700' : 'text-neutral-400'}>
                    {coupon.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/coupons/${coupon.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={() => onDelete?.(coupon.id)}>
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
