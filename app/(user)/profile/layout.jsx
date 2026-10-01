import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Profile',
  description: 'Your Sudhaga profile.',
  canonical: '/profile',
  indexable: false,
});

export default function ProfileLayout({ children }) {
  return children;
}
