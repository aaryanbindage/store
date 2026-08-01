import { createClient } from "@/lib/supabase/server";
import { SUBSCRIPTION_PLANS, type PlanId } from "@/lib/stripe";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { ManageBillingButton } from "@/components/billing/manage-billing-button";
import { Check } from "lucide-react";

const planOrder: PlanId[] = ["starter", "growth", "scale"];

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier, subscription_status, stripe_customer_id")
    .eq("id", user!.id)
    .single();

  const currentTier = profile?.subscription_tier ?? "none";
  const isActive = profile?.subscription_status === "active";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Current plan:{" "}
          <Badge variant={isActive ? "default" : "secondary"} className="ml-1 capitalize">
            {currentTier === "none" ? "No active plan" : `${currentTier} (${profile?.subscription_status})`}
          </Badge>
        </p>
        {success === "true" && (
          <p className="mt-2 text-sm text-green-600">
            Subscription updated — it may take a moment to reflect below.
          </p>
        )}
      </div>

      {profile?.stripe_customer_id && (
        <div>
          <ManageBillingButton />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {planOrder.map((id) => {
          const plan = SUBSCRIPTION_PLANS[id];
          const isCurrent = currentTier === id && isActive;
          return (
            <Card key={id} className={isCurrent ? "border-primary" : undefined}>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between text-base">
                  <span>{plan.name}</span>
                  <span className="text-xl font-bold">
                    ${plan.price}
                    <span className="text-xs font-normal text-muted-foreground">/mo</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="size-4 text-primary" /> {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrent ? (
                  <Badge variant="secondary" className="w-full justify-center py-2">
                    Current plan
                  </Badge>
                ) : (
                  <CheckoutButton plan={id} label={currentTier === "none" ? "Subscribe" : "Switch plan"} />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
