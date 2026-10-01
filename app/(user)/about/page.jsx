import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'About',
  description: `${BRAND.name} is an ethnic wear store. ${BRAND.tagline}`,
  canonical: '/about',
});

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">About {BRAND.name}</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        {BRAND.name} sells ethnic wear for celebrations and everyday dressing. {BRAND.tagline}. Orders are placed on this
        website, and support is available at support@sudhaga.com.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Questions about an order, a return, or shipping can go through the contact page.
      </p>
      <Link href="/contact" className="mt-6 inline-block text-sm font-medium text-neutral-950 underline">
        Contact us
      </Link>
    </article>
  );
}
