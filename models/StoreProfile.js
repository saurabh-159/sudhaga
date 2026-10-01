import mongoose from 'mongoose';

const StoreProfileSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'store' },
    legalName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
    grievanceName: { type: String, default: '' },
    grievanceDesignation: { type: String, default: 'Grievance Officer' },
    grievanceEmail: { type: String, default: '' },
    grievancePhone: { type: String, default: '' },
    contactIntro: { type: String, default: '' },
  },
  { timestamps: true }
);

if (mongoose.models.StoreProfile) {
  mongoose.deleteModel('StoreProfile');
}

export default mongoose.model('StoreProfile', StoreProfileSchema);
