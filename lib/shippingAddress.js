import User from '@/models/User';
import Order from '@/models/Order';
import { addressKey, shippingEntry } from '@/lib/addressBook';

function plainAddresses(user) {
  return (user.addresses || []).map((entry) => (entry.toObject ? entry.toObject() : { ...entry }));
}

function applyEntry(user, entry, { preferFront = true } = {}) {
  const current = plainAddresses(user);
  const key = addressKey(entry);
  const index = current.findIndex((item) => addressKey(item) === key);
  if (index >= 0) {
    const next = { ...current[index], ...entry };
    current.splice(index, 1);
    current.unshift(next);
  } else if (preferFront) {
    current.unshift(entry);
  } else {
    current.push(entry);
  }
  user.addresses = current.slice(0, 8);
  user.address = {
    line1: entry.line1,
    city: entry.city,
    state: entry.state,
    pincode: entry.pincode,
  };
  if (entry.phone) user.phone = entry.phone;
  user.markModified('addresses');
  user.markModified('address');
}

export async function rememberShippingAddress(userId, shipping) {
  const entry = shippingEntry(shipping);
  if (!entry) return null;
  const user = await User.findById(userId);
  if (!user) return null;
  applyEntry(user, entry);
  await user.save();
  return user;
}

export async function backfillAddresses(user) {
  const orders = await Order.find({ user: user._id }).select('shipping').sort({ createdAt: -1 }).limit(30);
  const existing = plainAddresses(user);
  const keys = new Set(existing.map((entry) => addressKey(entry)));
  const fromOrders = [];

  for (const order of orders) {
    const entry = shippingEntry(order.shipping);
    if (!entry) continue;
    const key = addressKey(entry);
    if (keys.has(key)) continue;
    keys.add(key);
    fromOrders.push(entry);
  }

  const profile = user.address?.line1
    ? shippingEntry({
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address.line1,
        city: user.address.city,
        state: user.address.state,
        pincode: user.address.pincode,
      })
    : null;

  if (profile && !keys.has(addressKey(profile))) {
    fromOrders.push(profile);
  }

  if (!fromOrders.length) return user;

  user.addresses = [...fromOrders, ...existing].slice(0, 8);
  const primary = user.addresses[0];
  if (primary && !user.address?.line1) {
    user.address = {
      line1: primary.line1,
      city: primary.city,
      state: primary.state,
      pincode: primary.pincode,
    };
    if (!user.phone && primary.phone) user.phone = primary.phone;
  }
  user.markModified('addresses');
  user.markModified('address');
  await user.save();
  return user;
}
