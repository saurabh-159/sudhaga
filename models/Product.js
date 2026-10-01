import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    originalPrice: Number,
    image: String,
    images: [String],
    sku: { type: String, unique: true, sparse: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    seoTitle: String,
    metaDescription: String,
    focusKeyword: String,
    imageAlt: String,
    attributes: [
      {
        sku: { type: String },
        price: { type: Number, required: true, min: 0 },
        options: [
          {
            name: { type: String, required: true },
            slug: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

if (mongoose.models.Product) {
  mongoose.deleteModel('Product');
}

export default mongoose.model('Product', ProductSchema);