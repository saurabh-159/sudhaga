import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Shipping',
  description: 'Sudhaga shipping times, charges, and delivery. Free shipping on orders over ₹999.',
  canonical: '/shipping',
});

export default function ShippingPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Shipping</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Orders are packed after payment. Delivery time depends on the address entered at checkout.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Shipping is free on orders over ₹999. Smaller orders include a delivery fee shown before you pay.
      </p>
    </article>
  );
}
