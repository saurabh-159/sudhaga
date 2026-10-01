import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    blurb: String,
    image: String,
    imageFocus: String,
    imageFit: String,
    imageBg: String,
    seoTitle: String,
    metaDescription: String,
    focusKeyword: String,
    imageAlt: String,
    answerText: String,
  },
  { timestamps: true }
);

if (mongoose.models.Category) {
  mongoose.deleteModel('Category');
}

export default mongoose.model('Category', CategorySchema);