import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    placement: {
      type: String,
      enum: ['hero', 'promo', 'deal-side', 'deal-center'],
      required: true,
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    badge: { type: String, default: '' },
    href: { type: String, default: '/products' },
    cta: { type: String, default: '' },
    code: { type: String, default: '' },
    image: { type: String, default: '' },
    hoverImage: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    accent: { type: Boolean, default: false },
    endsAt: { type: Date, default: null },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
