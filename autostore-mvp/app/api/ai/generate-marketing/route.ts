import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateMarketingCopy } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { productName, description } = body;

  if (!productName || !description) {
    return NextResponse.json(
      { error: "productName and description are required" },
      { status: 400 }
    );
  }

  const content = await generateMarketingCopy({ productName, description });
  return NextResponse.json({ content });
}
