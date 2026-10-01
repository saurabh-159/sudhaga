import Image from 'next/image';
import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { isExternalFooterUrl } from '@/lib/footerLinkInput';
import { listPublicFooterLinks } from '@/lib/footerLinks';
import { policyPath } from '@/lib/policyInput';
import { listExtraPolicies } from '@/lib/policies';

function FooterAnchor({ href, children, external = false }) {
  const className = 'transition hover:text-[var(--brand-gold,#D0B15A)]';
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default async function Footer() {
  const [extraPolicies, footerLinks] = await Promise.all([listExtraPolicies(), listPublicFooterLinks()]);
  const helpLinks = footerLinks.filter((link) => link.section === 'help');
  const followLinks = footerLinks.filter((link) => link.section === 'follow');
  const helpHrefs = new Set(helpLinks.map((link) => link.url));
  const extraHelp = extraPolicies.filter((policy) => !helpHrefs.has(policyPath(policy)));
  return (
    <footer className="mt-16 bg-black text-white">
      <div className="mx-auto grid max-w-[1400px] grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
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
            {helpLinks.map((link) => (
              <li key={link.id}>
                <FooterAnchor href={link.url} external={isExternalFooterUrl(link.url)}>
                  {link.label}
                </FooterAnchor>
              </li>
            ))}
            {extraHelp.map((policy) => (
              <li key={policy.id}>
                <FooterAnchor href={policyPath(policy)}>{policy.title}</FooterAnchor>
              </li>
            ))}
          </ul>
        </div>
        {followLinks.length ? (
          <div>
            <h4 className="mb-3 font-semibold">Follow</h4>
            <ul className="space-y-1 text-sm text-gray-400">
              {followLinks.map((link) => (
                <li key={link.id}>
                  <FooterAnchor href={link.url} external={isExternalFooterUrl(link.url)}>
                    {link.label}
                  </FooterAnchor>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
      </div>
    </footer>
  );
}
