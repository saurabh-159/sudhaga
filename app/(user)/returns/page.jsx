import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Returns',
  description: 'Sudhaga returns and refunds. Ask for a return within 7 days of delivery.',
  canonical: '/returns',
});

export default function ReturnsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Returns</h1>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        You can ask for a return within 7 days of delivery. Email support@sudhaga.com with your order number.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        Approved refunds go back to the original payment method. Personal-care items are not returnable.
      </p>
    </article>
  );
}
