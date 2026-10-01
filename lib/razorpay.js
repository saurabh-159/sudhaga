import 'server-only';
import Razorpay from 'razorpay';

let razorpay;

export function getRazorpay() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required');
  }
  if (!razorpay) {
    razorpay = new Razorpay({ key_id, key_secret });
  }
  return razorpay;
}