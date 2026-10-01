import Link from 'next/link';
import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Page not found',
  description: 'That page is not available at Sudhaga.',
  canonical: '/',
  indexable: false,
});

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-500">That product or category is not available.</p>
      <Link href="/products" className="mt-6 rounded-lg bg-black px-6 py-2 text-white">
        Shop products
      </Link>
    </div>
  );
}
