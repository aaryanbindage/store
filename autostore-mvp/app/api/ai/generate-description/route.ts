import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateProductDescription } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { productName, features, targetAudience, tone } = body;

  if (!productName) {
    return NextResponse.json({ error: "productName is required" }, { status: 400 });
  }

  const description = await generateProductDescription({
    productName,
    features: Array.isArray(features) ? features : [],
    targetAudience,
    tone,
  });

  return NextResponse.json({ description });
}
