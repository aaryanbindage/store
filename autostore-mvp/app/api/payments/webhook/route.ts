import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, planForPriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function upsertSubscriptionFromStripeSubscription(
  subscription: Stripe.Subscription,
  userId?: string
) {
  const admin = createAdminClient();
  const priceId = subscription.items.data[0]?.price.id;
  const plan = planForPriceId(priceId);
  const status = subscription.status === "active" || subscription.status === "trialing"
    ? "active"
    : subscription.status === "past_due"
      ? "past_due"
      : "canceled";

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;

  const update = {
    stripe_customer_id: customerId,
    subscription_tier: plan ?? "none",
    subscription_status: status,
    updated_at: new Date().toISOString(),
  };

  if (userId) {
    await admin.from("profiles").update(update).eq("id", userId);
  } else {
    await admin.from("profiles").update(update).eq("stripe_customer_id", customerId);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            typeof session.subscription === "string" ? session.subscription : session.subscription.id
          );
          await upsertSubscriptionFromStripeSubscription(
            subscription,
            session.client_reference_id ?? undefined
          );
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await upsertSubscriptionFromStripeSubscription(subscription, subscription.metadata?.user_id);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("Stripe webhook handling error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
