import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    googleId: { type: String, unique: true, sparse: true },
    avatar: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: String,
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    addresses: [
      {
        name: String,
        phone: String,
        email: String,
        line1: String,
        city: String,
        state: String,
        pincode: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);