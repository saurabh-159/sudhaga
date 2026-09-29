import BannerForm from '@/components/admin/BannerForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateBanner() {
  return (
    <div>
      <AdminPageHeader title="Add banner" description="This appears on the homepage as soon as it is marked visible." />
      <BannerForm />
    </div>
  );
}
