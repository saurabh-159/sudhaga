import { pageHead } from '@/lib/pageMeta';

export async function generateMetadata({ params }) {
  const { id } = await params;
  return pageHead({
    title: 'Order',
    description: 'Your Sudhaga order details.',
    canonical: `/orders/${id}`,
    indexable: false,
  });
}

export default function OrderLayout({ children }) {
  return children;
}
