import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Wishlist',
  description: 'Saved Sudhaga pieces.',
  canonical: '/wishlist',
  indexable: false,
});

export default function WishlistLayout({ children }) {
  return children;
}
