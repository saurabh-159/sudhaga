import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        sku: String,
        price: Number,
        qty: Number,
        image: String,
        options: [
          {
            name: String,
            slug: String,
            value: String,
          },
        ],
      },
    ],
    shipping: {
      name: String,
      phone: String,
      email: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    subtotal: Number,
    discount: { type: Number, default: 0 },
    shippingFee: Number,
    tax: Number,
    total: { type: Number, required: true },
    coupon: {
      code: String,
      type: String,
      value: Number,
    },
    couponUsed: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentId: String,
    razorpayOrderId: String,
  },
  { timestamps: true }
);

if (mongoose.models.Order) {
  mongoose.deleteModel('Order');
}

export default mongoose.model('Order', OrderSchema);