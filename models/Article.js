import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    body: { type: String, required: true },
    image: { type: String, default: '' },
    imageAlt: { type: String, default: '' },
    seoTitle: String,
    metaDescription: String,
    focusKeyword: String,
    links: [
      {
        label: { type: String, required: true },
        href: { type: String, required: true },
      },
    ],
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

if (mongoose.models.Article) {
  mongoose.deleteModel('Article');
}

export default mongoose.model('Article', ArticleSchema);
