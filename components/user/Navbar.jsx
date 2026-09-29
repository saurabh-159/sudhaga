'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { api } from '@/lib/apiClient';
import { useCatalog } from '@/components/user/CatalogProvider';
import { lockBodyScroll } from '@/lib/scrollLock';
import GoogleAuthButton from '@/components/user/GoogleAuthButton';

export default function Navbar() {
  const { categories, cartCount, wishlistIds, user, authReady, refreshSession, openCart } = useCatalog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const searchRef = useRef(null);
  const accountRef = useRef(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    function onPointerDown(event) {
      if (!accountRef.current?.contains(event.target)) setAccountOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    return lockBodyScroll();
  }, [menuOpen]);

  return (
    <header
      className="sticky top-0 z-40 bg-white"
      style={{ '--brand-gold': BRAND.gold }}
    >
      {/* Main bar */}
      <div className="border-b border-black/[0.06]">
        <div className="mx-auto flex h-[70px] max-w-[1400px] items-center gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutral-800 transition hover:bg-[#f3ebe3] lg:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/" aria-label={BRAND.name} className="shrink-0 transition-opacity hover:opacity-80">
            <Image
              src={BRAND.logo.light}
              alt={BRAND.name}
              width={200}
              height={50}
              priority
              className="h-8 w-auto object-contain sm:h-[38px]"
            />
          </Link>

          {/* Desktop search — center */}
          <form
            action="/products"
            className="mx-auto hidden w-full max-w-md items-center rounded-full border border-black/[0.07] bg-[#faf7f3] transition focus-within:border-[var(--brand-gold)]/55 focus-within:bg-white focus-within:ring-2 focus-within:ring-[var(--brand-gold)]/20 md:flex"
          >
            <Search className="ml-4 h-4 w-4 shrink-0 text-neutral-400" />
            <input
              name="search"
              placeholder="Search sarees, lehengas, suits…"
              className="h-11 w-full bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
            />
          </form>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 md:ml-0">
            <button
              type="button"
              aria-label="Search"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-[#f3ebe3] md:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-[#f3ebe3] sm:inline-flex"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistIds.length > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-gold)] px-1 text-[10px] font-bold leading-none text-black">
                  {wishlistIds.length}
                </span>
              ) : null}
            </Link>

            <div className="relative" ref={accountRef}>
              <button
                type="button"
                aria-label="Account"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-[#f3ebe3]"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <User className="h-[18px] w-[18px]" />
                )}
              </button>

              {accountOpen ? (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border border-black/[0.06] bg-white p-4 shadow-[0_16px_40px_rgba(22,19,17,0.12)]">
                  {!authReady ? (
                    <p className="text-sm text-neutral-500">Checking account…</p>
                  ) : user ? (
                    <div>
                      <p className="truncate text-sm font-medium text-neutral-950">{user.name}</p>
                      <p className="truncate text-xs text-neutral-500">{user.email}</p>
                      <div className="mt-3 grid gap-1">
                        <Link
                          href="/profile"
                          onClick={() => setAccountOpen(false)}
                          className="rounded-xl px-3 py-2 text-sm text-neutral-800 transition hover:bg-[#faf7f3]"
                        >
                          Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setAccountOpen(false)}
                          className="rounded-xl px-3 py-2 text-sm text-neutral-800 transition hover:bg-[#faf7f3]"
                        >
                          Orders
                        </Link>
                        <button
                          type="button"
                          className="rounded-xl px-3 py-2 text-left text-sm text-neutral-800 transition hover:bg-[#faf7f3]"
                          onClick={async () => {
                            await api('/api/auth/logout', { method: 'POST' });
                            await refreshSession();
                            setAccountOpen(false);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                        Account
                      </p>
                      <p className="mt-1 text-sm font-medium text-neutral-950">Login or sign up</p>
                      <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                        Continue with Google. A new account is created the first time you sign in.
                      </p>
                      <div className="mt-3">
                        <GoogleAuthButton onSuccess={() => setAccountOpen(false)} />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              aria-label="Open bag"
              onClick={openCart}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-[#f3ebe3]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand-gold)] px-1 text-[10px] font-bold leading-none text-black">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-black/[0.05] px-4 py-3 md:hidden">
            <form
              action="/products"
              className="flex items-center rounded-full border border-black/[0.07] bg-[#faf7f3] px-3.5"
            >
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                ref={searchRef}
                name="search"
                autoFocus
                placeholder="Search Sudhaga…"
                className="h-11 w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-neutral-400"
              />
            </form>
          </div>
        )}
      </div>

      {/* Category strip — desktop */}
      <nav
        className="hidden border-b border-black/[0.06] lg:block"
        aria-label="Categories"
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-center gap-1 px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="group relative px-3.5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-700 transition hover:text-black"
          >
            All
            <span className="absolute inset-x-3.5 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--brand-gold)] transition duration-200 group-hover:scale-x-100" />
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group relative px-3.5 py-3 text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-700 transition hover:text-black"
            >
              {category.name}
              <span className="absolute inset-x-3.5 bottom-0 h-[2px] origin-left scale-x-0 bg-[var(--brand-gold)] transition duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-black/45"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="absolute inset-y-0 left-0 flex w-[min(88vw,360px)] flex-col bg-[#faf7f3] shadow-[12px_0_40px_rgba(22,19,17,0.18)]"
            aria-label="Mobile"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] bg-white px-4 py-4">
              <Link href="/" onClick={() => setMenuOpen(false)} className="min-w-0">
                <Image
                  src={BRAND.logo.light}
                  alt={BRAND.name}
                  width={160}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-800 transition hover:bg-[#f3ebe3]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form action="/products" className="px-4 pt-4" onSubmit={() => setMenuOpen(false)}>
                <div className="flex items-center rounded-full border border-black/[0.07] bg-white px-3.5">
                  <Search className="h-4 w-4 text-neutral-400" />
                  <input
                    name="search"
                    placeholder="Search sarees, lehengas…"
                    className="h-11 w-full bg-transparent px-2.5 text-sm outline-none placeholder:text-neutral-400"
                  />
                </div>
              </form>

              <div className="grid grid-cols-2 gap-2 px-4 pt-4">
                {[
                  { href: '/products', label: 'Shop all' },
                  { href: '/categories', label: 'Categories' },
                  { href: '/wishlist', label: wishlistIds.length ? `Wishlist (${wishlistIds.length})` : 'Wishlist' },
                  { href: '/orders', label: 'Orders' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-2xl bg-white px-3 py-3 text-sm font-medium text-neutral-900 ring-1 ring-black/[0.06] transition hover:bg-[#f3ebe3]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="px-5 pb-2 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-gold)]">
                  Categories
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 px-4 pb-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="group overflow-hidden rounded-2xl bg-white ring-1 ring-black/5"
                  >
                    <span className="relative block aspect-[3/4] overflow-hidden bg-[#f3ebe3]">
                      <img
                        src={category.image}
                        alt=""
                        className="h-full w-full object-cover transition duration-400 group-hover:scale-105"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                      <span className="absolute inset-x-0 bottom-0 p-2.5">
                        <span className="block text-[12px] font-semibold leading-tight text-white">{category.name}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[10px] text-white/70">{category.blurb}</span>
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-black/[0.06] bg-white px-4 py-4">
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebe3] text-neutral-800">
                      <User className="h-4 w-4" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-neutral-950">{user.name}</span>
                    <span className="block truncate text-xs text-neutral-500">{user.email}</span>
                  </span>
                </Link>
              ) : (
                <div>
                  <p className="text-sm font-medium text-neutral-950">Login or sign up</p>
                  <div className="mt-3">
                    <GoogleAuthButton onSuccess={() => setMenuOpen(false)} />
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
