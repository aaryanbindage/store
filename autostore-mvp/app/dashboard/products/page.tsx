import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function ProductsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: products } = await supabase
    .from("products")
    .select("*, stores!inner(user_id, name)")
    .eq("stores.user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <Button asChild>
          <Link href="/dashboard/products/new">New product</Link>
        </Button>
      </div>

      {!products || products.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No products yet.{" "}
            <Link href="/dashboard/products/new" className="text-primary underline-offset-4 hover:underline">
              Add your first product
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link key={p.id} href={`/dashboard/products/${p.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-3 pt-6">
                  {p.image_url ? (
                    <Image
                      src={p.image_url}
                      alt={p.name}
                      width={48}
                      height={48}
                      unoptimized
                      className="size-12 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="size-12 rounded-md border bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(p.stores as unknown as { name: string }).name} · ${Number(p.price).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
