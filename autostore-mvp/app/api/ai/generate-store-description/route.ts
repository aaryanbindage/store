import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStoreDescription } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { storeName, businessType, products } = body;

  if (!storeName) {
    return NextResponse.json({ error: "storeName is required" }, { status: 400 });
  }

  const description = await generateStoreDescription({
    storeName,
    businessType: businessType ?? "other",
    products: Array.isArray(products) ? products : [],
  });

  return NextResponse.json({ description });
}
