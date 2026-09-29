import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';

export default function Footer() {
  return (
    <footer className="mt-16 bg-black text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" aria-label={BRAND.name} className="inline-block">
            <Image
              src={BRAND.logo.dark}
              alt={BRAND.name}
              width={180}
              height={50}
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="mt-3 text-sm text-gray-400">{BRAND.tagline}</p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Shop</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>
              <Link href="/products" className="transition hover:text-[var(--brand-gold,#D0B15A)]">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/categories" className="transition hover:text-[var(--brand-gold,#D0B15A)]">
                Categories
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="transition hover:text-[var(--brand-gold,#D0B15A)]">
                Wishlist
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Help</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>Contact</li>
            <li>Returns</li>
            <li>Shipping</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Follow</h4>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>Instagram</li>
            <li>Twitter</li>
            <li>Facebook</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
