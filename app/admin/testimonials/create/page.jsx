import TestimonialForm from '@/components/admin/TestimonialForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateTestimonial() {
  return (
    <div>
      <AdminPageHeader title="Add review" description="This quote is stored in the database and looped on the homepage." />
      <TestimonialForm />
    </div>
  );
}
