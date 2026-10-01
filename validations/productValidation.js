import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  image: z.string().optional(),
  category: z.string(),
  stock: z.number().min(0).default(0),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  seoTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  imageAlt: z.string().optional(),
  attributes: z
    .array(
      z.object({
        sku: z.string().max(40).optional(),
        price: z.number().min(0),
        options: z
          .array(
            z.object({
              name: z.string().min(1),
              slug: z.string().min(1),
              value: z.string().min(1),
            })
          )
          .min(1),
      })
    )
    .optional()
    .default([]),
});