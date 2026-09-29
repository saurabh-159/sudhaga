import { z } from 'zod';

export const orderSchema = z.object({
  shipping: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    pincode: z.string(),
  }),
});