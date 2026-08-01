import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendShippingDeadlineReminder } from "@/lib/email";

// Scans for orders whose shipping deadline is within the next 24h (or already
// overdue) and haven't shipped yet, then emails the store owner a reminder.
// Wire this up as a Vercel Cron job (see vercel.json) once deployed — locally
// it can be hit manually with the CRON_SECRET bearer token for testing.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const windowEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: orders, error } = await admin
    .from("orders")
    .select("id, customer_name, shipping_deadline, status, reminder_sent_at, stores(user_id, name, profiles(email))")
    .lte("shipping_deadline", windowEnd)
    .is("reminder_sent_at", null)
    .not("status", "in", "(shipped,delivered)");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  for (const order of orders ?? []) {
    const store = order.stores as unknown as { name: string; profiles: { email: string | null } } | null;
    const ownerEmail = store?.profiles?.email;
    if (!ownerEmail || !order.shipping_deadline) continue;

    try {
      await sendShippingDeadlineReminder({
        to: ownerEmail,
        customerName: order.customer_name,
        orderId: order.id,
        deadline: order.shipping_deadline,
      });
      await admin
        .from("orders")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", order.id);
      sent++;
    } catch (err) {
      console.error(`Failed to send reminder for order ${order.id}:`, err);
    }
  }

  return NextResponse.json({ checked: orders?.length ?? 0, sent });
}
