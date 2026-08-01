import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StoreForm } from "@/components/stores/store-form";
import { DeleteStoreButton } from "@/components/stores/delete-store-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: store } = await supabase
    .from("stores")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!store) notFound();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", id)
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{store.name}</h1>
            <Badge variant="secondary" className="capitalize">
              {store.platform}
            </Badge>
          </div>
          {store.website_url && (
            <a
              href={store.website_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              {store.website_url}
            </a>
          )}
        </div>
        <DeleteStoreButton storeId={store.id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store details</CardTitle>
        </CardHeader>
        <CardContent>
          <StoreForm store={store} />
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Products</h2>
          <Button asChild size="sm">
            <Link href={`/dashboard/products/new?storeId=${store.id}`}>Add product</Link>
          </Button>
        </div>
        {!products || products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Link key={p.id} href={`/dashboard/products/${p.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="text-sm">{p.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    ${Number(p.price).toFixed(2)}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Orders</h2>
          <Button asChild size="sm">
            <Link href={`/dashboard/orders/new?storeId=${store.id}`}>Add order</Link>
          </Button>
        </div>
        {!orders || orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="flex flex-col divide-y rounded-md border">
            {orders.map((o) => (
              <Link
                key={o.id}
                href={`/dashboard/orders/${o.id}`}
                className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
              >
                <span>{o.customer_name}</span>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {o.status}
                  </Badge>
                  <span className="text-muted-foreground">${Number(o.total_amount).toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
