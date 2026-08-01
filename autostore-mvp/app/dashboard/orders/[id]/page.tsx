import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "@/components/orders/order-form";
import { DeleteOrderButton } from "@/components/orders/delete-order-button";
import { UrgencyBadge } from "@/components/orders/urgency-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*, stores!inner(user_id, id, name)")
    .eq("id", id)
    .eq("stores.user_id", user!.id)
    .single();

  if (!order) notFound();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  const { stores: _s, ...orderData } = order;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{order.customer_name}</h1>
          <UrgencyBadge deadline={order.shipping_deadline} status={order.status} />
        </div>
        <DeleteOrderButton orderId={order.id} storeId={order.store_id} />
      </div>

      {order.shipping_deadline && (
        <p className="text-sm text-muted-foreground">
          Ship by{" "}
          <strong>
            {new Date(order.shipping_deadline).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </strong>
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order details</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderForm order={orderData} stores={stores ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
