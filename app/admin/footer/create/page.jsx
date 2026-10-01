import FooterLinkForm from '@/components/admin/FooterLinkForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateFooterLink() {
  return (
    <div>
      <AdminPageHeader
        title="Add footer link"
        description="Add a Help page or a social profile. It shows in the store footer after you save a URL."
      />
      <FooterLinkForm />
    </div>
  );
}
