"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/payments/portal", { method: "POST" });
    const json = await res.json();
    if (res.ok && json.url) {
      window.location.href = json.url;
      return;
    }
    setLoading(false);
    alert(json.error ?? "Couldn't open billing portal");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? "Opening…" : "Manage billing"}
    </Button>
  );
}
