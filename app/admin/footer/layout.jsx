import { pageHead } from '@/lib/pageMeta';

export const metadata = pageHead({
  title: 'Footer',
  description: 'Manage Sudhaga footer link text and URLs.',
  canonical: '/admin/footer',
  indexable: false,
});

export default function Layout({ children }) {
  return children;
}
