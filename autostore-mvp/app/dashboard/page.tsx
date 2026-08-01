import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Package, ClipboardList, DollarSign } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: stores } = await supabase.from("stores").select("id").eq("user_id", user.id);
  const storeIds = (stores ?? []).map((s) => s.id);

  if (storeIds.length === 0) {
    return { storeCount: 0, productCount: 0, orderCount: 0, revenue: 0, upcoming: [] };
  }

  const [{ count: productCount }, { data: orders }] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .in("store_id", storeIds),
    supabase
      .from("orders")
      .select("id, customer_name, total_amount, shipping_deadline, status")
      .in("store_id", storeIds)
      .order("shipping_deadline", { ascending: true }),
  ]);

  const revenue = (orders ?? []).reduce((sum, o) => sum + Number(o.total_amount), 0);
  const upcoming = (orders ?? []).filter(
    (o) => o.status !== "delivered" && o.shipping_deadline
  ).slice(0, 5);

  return {
    storeCount: storeIds.length,
    productCount: productCount ?? 0,
    orderCount: orders?.length ?? 0,
    revenue,
    upcoming,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Stores", value: stats?.storeCount ?? 0, icon: Store, href: "/dashboard/stores" },
    { label: "Products", value: stats?.productCount ?? 0, icon: Package, href: "/dashboard/products" },
    { label: "Orders", value: stats?.orderCount ?? 0, icon: ClipboardList, href: "/dashboard/orders" },
    {
      label: "Total Revenue",
      value: `$${(stats?.revenue ?? 0).toFixed(2)}`,
      icon: DollarSign,
      href: "/dashboard/orders",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <Button asChild>
          <Link href="/dashboard/stores/new">New store</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming shipping deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats || stats.upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders with upcoming deadlines. Create a store and add an order to get started.
            </p>
          ) : (
            <div className="flex flex-col divide-y">
              {stats.upcoming.map((o) => (
                <div key={o.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{o.customer_name}</span>
                  <span className="text-muted-foreground">
                    {o.shipping_deadline
                      ? new Date(o.shipping_deadline).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
