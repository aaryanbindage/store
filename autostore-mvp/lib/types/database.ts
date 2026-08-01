export type SubscriptionTier = "none" | "starter" | "growth" | "scale";
export type SubscriptionStatus = "inactive" | "active" | "past_due" | "canceled";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export type StorePlatform = "shopify" | "amazon" | "etsy" | "other";

export interface Store {
  id: string;
  user_id: string;
  name: string;
  platform: StorePlatform;
  description: string | null;
  website_url: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface AIGeneratedContent {
  description?: string;
  marketing?: Record<string, string>;
  social?: Record<string, { content: string; hashtags: string[] }>;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: string | null;
  tags: string[];
  ai_generated_content: AIGeneratedContent;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered";

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  store_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  total_amount: number;
  currency: string;
  shipping_address: ShippingAddress | null;
  shipping_deadline: string | null;
  status: OrderStatus;
  notes: string | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}
