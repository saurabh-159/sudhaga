import { BRAND } from '@/lib/brand';
import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Contact',
  description: `Contact ${BRAND.name} for orders, shipping, and returns.`,
  canonical: '/contact',
});

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Contact</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Email support@sudhaga.com for help with an order, a product, shipping, or a return.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Include your order number if you already placed an order. We reply by email.
      </p>
    </article>
  );
}
