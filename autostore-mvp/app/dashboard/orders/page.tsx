import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UrgencyBadge } from "@/components/orders/urgency-badge";

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, stores!inner(user_id, name)")
    .eq("stores.user_id", user!.id)
    .order("shipping_deadline", { ascending: true });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <Button asChild>
          <Link href="/dashboard/orders/new">New order</Link>
        </Button>
      </div>

      {!orders || orders.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No orders yet.{" "}
            <Link href="/dashboard/orders/new" className="text-primary underline-offset-4 hover:underline">
              Log your first order
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col divide-y rounded-md border">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/dashboard/orders/${o.id}`}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{o.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {(o.stores as unknown as { name: string }).name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {o.shipping_deadline ? new Date(o.shipping_deadline).toLocaleDateString() : "—"}
                </span>
                <UrgencyBadge deadline={o.shipping_deadline} status={o.status} />
                <Badge variant="outline" className="capitalize">
                  {o.status}
                </Badge>
                <span className="w-16 text-right font-medium">
                  ${Number(o.total_amount).toFixed(2)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
