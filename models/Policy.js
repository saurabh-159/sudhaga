import mongoose from 'mongoose';

const PolicySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    summary: { type: String, default: '' },
    body: { type: String, required: true },
    published: { type: Boolean, default: true },
    system: { type: Boolean, default: false },
    sort: { type: Number, default: 100 },
  },
  { timestamps: true }
);

if (mongoose.models.Policy) {
  mongoose.deleteModel('Policy');
}

export default mongoose.model('Policy', PolicySchema);
