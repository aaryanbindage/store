import { z } from "zod";

export const productSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(4000).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be positive"),
  category: z.string().max(120).optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
});

export type ProductInput = z.infer<typeof productSchema>;
