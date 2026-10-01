import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Orders',
  description: 'Your Sudhaga orders.',
  canonical: '/orders',
  indexable: false,
});

export default function OrdersLayout({ children }) {
  return children;
}
