import mongoose from 'mongoose';

const FooterLinkSchema = new mongoose.Schema(
  {
    section: { type: String, enum: ['help', 'follow'], required: true },
    label: { type: String, required: true, trim: true, maxlength: 40 },
    url: { type: String, default: '', trim: true, maxlength: 500 },
    published: { type: Boolean, default: true },
    sort: { type: Number, default: 100 },
  },
  { timestamps: true }
);

FooterLinkSchema.index({ section: 1, label: 1 }, { unique: true });

if (mongoose.models.FooterLink) {
  mongoose.deleteModel('FooterLink');
}

export default mongoose.model('FooterLink', FooterLinkSchema);
