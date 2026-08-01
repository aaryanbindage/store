import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  platform: z.enum(["shopify", "amazon", "etsy", "other"]),
  description: z.string().max(2000).optional().or(z.literal("")),
  website_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
});

export type StoreInput = z.infer<typeof storeSchema>;
