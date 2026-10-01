import LegalPage from '@/components/user/LegalPage';
import { loadPublicPolicy } from '@/lib/policies';
import { pageHead } from '@/lib/pageMeta';
import { metaDescription } from '@/lib/site';
import { FREE_SHIPPING_OVER, SHIPPING_FEE } from '@/lib/pricing';

export async function generateMetadata() {
  const policy = await loadPublicPolicy('shipping');
  return pageHead({
    title: policy?.title || 'Shipping',
    description: metaDescription(policy?.summary || policy?.body, 'Sudhaga shipping times, charges, and delivery.'),
    canonical: '/shipping',
  });
}

export default async function ShippingPage() {
  const policy = await loadPublicPolicy('shipping');
  return (
    <LegalPage
      policy={policy}
      lead={
        <p>
          Shipping is free on orders over ₹{FREE_SHIPPING_OVER}. Smaller orders include a delivery fee of ₹{SHIPPING_FEE}, shown at checkout before you pay.
        </p>
      }
    />
  );
}
