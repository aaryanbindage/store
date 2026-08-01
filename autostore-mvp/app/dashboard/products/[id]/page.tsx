import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/product-form";
import { DeleteProductButton } from "@/components/products/delete-product-button";
import { AIContentPanel } from "@/components/products/ai-content-panel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("*, stores!inner(user_id, id, name)")
    .eq("id", id)
    .eq("stores.user_id", user!.id)
    .single();

  if (!product) notFound();

  const { data: stores } = await supabase
    .from("stores")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  const { stores: _s, ...productData } = product;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
        <DeleteProductButton productId={product.id} storeId={product.store_id} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm product={productData} stores={stores ?? []} />
        </CardContent>
      </Card>

      <AIContentPanel productName={product.name} description={product.description ?? ""} />
    </div>
  );
}
