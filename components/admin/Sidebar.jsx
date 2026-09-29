'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  LogOut,
  Package,
  FolderTree,
  Tags,
  ShoppingBag,
  TicketPercent,
  Users,
  Settings,
  ImageIcon,
  MessageSquare,
  X,
} from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { api } from '@/lib/apiClient';

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin/attributes', label: 'Attributes', icon: Tags },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent },
  { href: '/admin/banners', label: 'Homepage', icon: ImageIcon },
  { href: '/admin/testimonials', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function isActive(path, href) {
  if (href === '/admin') return path === '/admin';
  return path === href || path.startsWith(`${href}/`);
}

function Panel({ path, loggingOut, logout, onNavigate, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-5">
        <Image
          src={BRAND.logo.dark}
          alt={BRAND.name}
          width={140}
          height={36}
          className="h-8 w-auto object-contain"
          priority
        />
        {onClose ? (
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Manage
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const active = isActive(path, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? 'bg-white/10 font-medium text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-[var(--brand-gold)]' : ''}`} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/65 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? 'Logging out…' : 'Logout'}
        </button>
        <div className="px-3 pb-1 pt-3">
          <p className="text-xs text-white/40">Admin console</p>
          <p className="mt-0.5 text-sm font-medium text-white/80">{BRAND.name}</p>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ open = false, onClose }) {
  const path = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  const panel = (
    <Panel path={path} loggingOut={loggingOut} logout={logout} onNavigate={onClose} />
  );

  return (
    <>
      <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-white/10 bg-neutral-950 text-white md:flex">
        {panel}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(86vw,300px)] flex-col bg-neutral-950 text-white shadow-[12px_0_40px_rgba(0,0,0,0.35)]">
            <Panel
              path={path}
              loggingOut={loggingOut}
              logout={logout}
              onNavigate={onClose}
              onClose={onClose}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
