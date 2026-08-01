import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { SUBSCRIPTION_PLANS, type PlanId } from "@/lib/stripe";

const planOrder: PlanId[] = ["starter", "growth", "scale"];

export default function PricingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-6 py-16">
      <div className="text-center">
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick a plan and let AI handle the busywork of running your store.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {planOrder.map((id) => {
          const plan = SUBSCRIPTION_PLANS[id];
          return (
            <Card key={id} className={id === "growth" ? "border-primary shadow-md" : undefined}>
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{plan.name}</span>
                  <span className="text-2xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
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
                <CheckoutButton plan={id} variant={id === "growth" ? "default" : "outline"} />
              </CardFooter>
            </Card>
          );
        })}
      </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
