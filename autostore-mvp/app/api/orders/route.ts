import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderSchema } from "@/lib/validations/order";
import { calculateShippingDeadline } from "@/lib/shipping";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const storeId = request.nextUrl.searchParams.get("storeId");

  let query = supabase
    .from("orders")
    .select("*, stores!inner(user_id)")
    .order("shipping_deadline", { ascending: true });

  query = storeId
    ? query.eq("store_id", storeId).eq("stores.user_id", user.id)
    : query.eq("stores.user_id", user.id);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const orders = (data ?? []).map(({ stores: _stores, ...order }) => order);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = orderSchema.safeParse(body);
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

  const shipping_deadline = calculateShippingDeadline().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .insert({ ...parsed.data, shipping_deadline })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data }, { status: 201 });
}
