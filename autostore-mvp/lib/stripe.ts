import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export type PlanId = "starter" | "growth" | "scale";

export const SUBSCRIPTION_PLANS: Record<
  PlanId,
  { name: string; price: number; priceId: string | undefined; features: string[] }
> = {
  starter: {
    name: "Starter",
    price: 49,
    priceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: ["Single store", "AI product descriptions", "Email support"],
  },
  growth: {
    name: "Growth",
    price: 149,
    priceId: process.env.STRIPE_GROWTH_PRICE_ID,
    features: ["Multiple stores", "AI marketing & social content", "Priority support"],
  },
  scale: {
    name: "Scale",
    price: 349,
    priceId: process.env.STRIPE_SCALE_PRICE_ID,
    features: ["Unlimited stores", "Full AI content suite", "Dedicated support"],
  },
};

export function planForPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  const entry = (Object.entries(SUBSCRIPTION_PLANS) as [PlanId, (typeof SUBSCRIPTION_PLANS)[PlanId]][]).find(
    ([, plan]) => plan.priceId === priceId
  );
  return entry ? entry[0] : null;
}
