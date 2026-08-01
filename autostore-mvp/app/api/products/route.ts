import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations/product";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeId = request.nextUrl.searchParams.get("storeId");

  let query = supabase.from("products").select("*, stores!inner(user_id)").order("created_at", {
    ascending: false,
  });

  query = storeId
    ? query.eq("store_id", storeId).eq("stores.user_id", user.id)
    : query.eq("stores.user_id", user.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products = (data ?? []).map(({ stores: _stores, ...product }) => product);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id")
    .eq("id", parsed.data.store_id)
    .eq("user_id", user.id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { data, error } = await supabase.from("products").insert(parsed.data).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
