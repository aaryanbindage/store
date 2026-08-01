import Link from "next/link";
import { Sparkles, Store, ClipboardList, TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";
import { SUBSCRIPTION_PLANS, type PlanId } from "@/lib/stripe";

const features = [
  {
    icon: Sparkles,
    title: "AI content generation",
    description:
      "Generate SEO-optimized product descriptions, marketing copy, and social media posts in seconds with Gemini.",
  },
  {
    icon: Store,
    title: "Store management",
    description: "Track every store and product you sell in one dashboard, across any platform.",
  },
  {
    icon: ClipboardList,
    title: "Order & deadline tracking",
    description:
      "Log orders and get automatic shipping deadlines with urgency indicators so nothing slips through.",
  },
  {
    icon: TrendingUp,
    title: "Revenue insights",
    description: "See revenue and order volume across every store at a glance.",
  },
];

const steps = [
  { title: "Add your store", description: "Tell us about your store and what you sell." },
  {
    title: "Add products & generate content",
    description: "Add products manually, then let AI write descriptions and marketing copy for you.",
  },
  {
    title: "Track orders & get reminders",
    description: "Log orders as they come in — we calculate ship-by dates and remind you before they slip.",
  },
];

const planOrder: PlanId[] = ["starter", "growth", "scale"];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <MarketingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-6 py-20 text-center">
          <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            AI-powered e-commerce automation
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Run your store with AI doing the busywork
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            AutoStore AI generates product descriptions and marketing content, tracks orders and
            shipping deadlines, and keeps every store you run in one dashboard.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-6 shadow-lg"
              asChild
            >
              <a 
                href="https://www.foundersweekends.com/api/pay?venture=5fafe8d0-8f98-4405-9ed7-752846dbccfa&amount=2800&name=Venture+1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscribe monthly — $28
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="mb-2 size-6 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="flex flex-col gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing preview */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Plans for every stage
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
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
                </Card>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Button asChild>
              <Link href="/pricing">View full pricing</Link>
            </Button>
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to automate your e-commerce business?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start using AI to generate content, track orders, and grow your store today.
          </p>
          <div className="mt-8 flex justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-6 shadow-lg"
              asChild
            >
              <a 
                href="https://www.foundersweekends.com/api/pay?venture=5fafe8d0-8f98-4405-9ed7-752846dbccfa&amount=2800&name=Venture+1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscribe monthly — $28
              </a>
            </Button>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
