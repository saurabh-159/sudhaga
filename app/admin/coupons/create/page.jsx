import CouponForm from '@/components/admin/CouponForm';
import AdminPageHeader from '@/components/admin/AdminPageHeader';

export default function CreateCoupon() {
  return (
    <div>
      <AdminPageHeader
        title="Add coupon"
        description="Set the code, discount, and how many times it can be used."
      />
      <CouponForm />
    </div>
  );
}
