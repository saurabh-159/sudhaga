import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        qty: { type: Number, default: 1 },
        sku: { type: String, default: '' },
        options: [
          {
            name: String,
            slug: String,
            value: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

if (mongoose.models.Cart) {
  mongoose.deleteModel('Cart');
}

export default mongoose.model('Cart', CartSchema);