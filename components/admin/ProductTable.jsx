'use client';

import Link from 'next/link';
import Button from '../ui/Button';
import { Pencil, Trash2 } from 'lucide-react';

export default function ProductTable({ products = [], onDelete }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-black/6 bg-neutral-50/80 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Stock</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-black/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      className="h-11 w-11 rounded-lg object-cover object-top ring-1 ring-black/5"
                    />
                    <span className="max-w-[7.5rem] truncate font-medium text-neutral-900 sm:max-w-[220px]">
                      {p.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-neutral-700">₹{p.price.toLocaleString('en-IN')}</td>
                <td className="hidden px-4 py-3 text-neutral-700 sm:table-cell">{p.stock}</td>
                <td className="hidden px-4 py-3 capitalize text-neutral-600 md:table-cell">
                  {p.category}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete?.(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
