import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Cart',
  description: 'Review the Sudhaga pieces in your bag before checkout.',
  canonical: '/cart',
  indexable: false,
});

export default function CartLayout({ children }) {
  return children;
}
