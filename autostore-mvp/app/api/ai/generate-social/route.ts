import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSocialContent } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { productName, description, platform } = body;

  if (!productName || !description || !platform) {
    return NextResponse.json(
      { error: "productName, description, and platform are required" },
      { status: 400 }
    );
  }

  const content = await generateSocialContent({ productName, description, platform });
  return NextResponse.json({ content });
}
