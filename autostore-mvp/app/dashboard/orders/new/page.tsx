import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { OrderForm } from "@/components/orders/order-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ storeId?: string }>;
}) {
  const { storeId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  if (!stores || stores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            You need a store before you can log orders.
          </p>
          <Button asChild size="sm">
            <Link href="/dashboard/stores/new">Create a store</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">New order</h1>
      <OrderForm stores={stores} defaultStoreId={storeId} />
    </div>
  );
}
