import { z } from "zod";

export const orderSchema = z.object({
  store_id: z.string().uuid(),
  customer_name: z.string().min(1, "Customer name is required").max(200),
  customer_email: z.string().email().optional().or(z.literal("")),
  customer_phone: z.string().max(40).optional().or(z.literal("")),
  total_amount: z.coerce.number().min(0),
  shipping_address: z
    .object({
      line1: z.string().min(1),
      line2: z.string().optional().or(z.literal("")),
      city: z.string().min(1),
      state: z.string().min(1),
      postal_code: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
  status: z.enum(["pending", "processing", "shipped", "delivered"]).optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type OrderInput = z.infer<typeof orderSchema>;
