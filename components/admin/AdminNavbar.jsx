'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const titles = {
  '/admin': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/products/create': 'Add Product',
  '/admin/categories': 'Categories',
  '/admin/categories/create': 'Add Category',
  '/admin/attributes': 'Attributes',
  '/admin/attributes/create': 'Add Attribute',
  '/admin/orders': 'Orders',
  '/admin/users': 'Users',
  '/admin/settings': 'Settings',
};

function resolveTitle(path) {
  if (titles[path]) return titles[path];
  if (path.startsWith('/admin/products/') && path.endsWith('/edit')) return 'Edit Product';
  if (path.startsWith('/admin/orders/')) return 'Order Details';
  return 'Admin Panel';
}

export default function AdminNavbar({ onMenu }) {
  const path = usePathname();
  const title = resolveTitle(path);

  return (
    <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-3 border-b border-black/8 bg-[#f6f4f1]/95 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenu}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-800 transition hover:bg-white md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Admin
          </p>
          <h1 className="truncate text-lg font-semibold tracking-tight text-neutral-900">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-neutral-900">Admin User</p>
          <p className="text-xs text-neutral-500">admin@sudhaga.com</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950 text-sm font-semibold text-white">
          A
        </div>
      </div>
    </header>
  );
}
