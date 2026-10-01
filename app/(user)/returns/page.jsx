import LegalPage from '@/components/user/LegalPage';
import { loadPublicPolicy } from '@/lib/policies';
import { pageHead } from '@/lib/pageMeta';
import { metaDescription } from '@/lib/site';

export async function generateMetadata() {
  const policy = await loadPublicPolicy('returns');
  return pageHead({
    title: policy?.title || 'Returns',
    description: metaDescription(policy?.summary || policy?.body, 'Sudhaga returns and refunds.'),
    canonical: '/returns',
  });
}

export default async function ReturnsPage() {
  const policy = await loadPublicPolicy('returns');
  return <LegalPage policy={policy} />;
}
