"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { PlanId } from "@/lib/stripe";

export function CheckoutButton({
  plan,
  label = "Subscribe",
  variant = "default",
}: {
  plan: PlanId;
  label?: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/payments/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (res.status === 401) {
      router.push("/login?redirect=/pricing");
      return;
    }

    const json = await res.json();
    if (res.ok && json.url) {
      window.location.href = json.url;
      return;
    }
    setLoading(false);
    alert(json.error ?? "Couldn't start checkout. Make sure Stripe price IDs are configured.");
  }

  return (
    <Button onClick={handleClick} disabled={loading} variant={variant} className="w-full">
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
