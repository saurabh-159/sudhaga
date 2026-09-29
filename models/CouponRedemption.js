import mongoose from 'mongoose';

const CouponRedemptionSchema = new mongoose.Schema(
  {
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    code: { type: String, required: true },
    discount: { type: Number, required: true },
    oncePerUser: { type: Boolean, default: false },
  },
  { timestamps: true },
);

CouponRedemptionSchema.index(
  { coupon: 1, user: 1 },
  { unique: true, partialFilterExpression: { oncePerUser: true } },
);

export default mongoose.models.CouponRedemption || mongoose.model('CouponRedemption', CouponRedemptionSchema);
