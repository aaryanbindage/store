import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe, SUBSCRIPTION_PLANS, type PlanId } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = (await request.json()) as { plan: PlanId };
  const planConfig = SUBSCRIPTION_PLANS[plan];

  if (!planConfig?.priceId) {
    return NextResponse.json({ error: "Unknown or unconfigured plan" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: profile?.stripe_customer_id ?? undefined,
    customer_email: profile?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id } },
    success_url: `${appUrl}/dashboard/billing?success=true`,
    cancel_url: `${appUrl}/pricing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
