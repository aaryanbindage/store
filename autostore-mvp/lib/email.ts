import { Resend } from "resend";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not configured");
    resendClient = new Resend(key);
  }
  return resendClient;
}

export async function sendShippingDeadlineReminder(params: {
  to: string;
  customerName: string;
  orderId: string;
  deadline: string;
}) {
  const { to, customerName, orderId, deadline } = params;
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const deadlineLabel = new Date(deadline).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  await getResend().emails.send({
    from,
    to,
    subject: `Shipping deadline reminder — order for ${customerName}`,
    html: `
      <h2>Shipping deadline reminder</h2>
      <p>Order <strong>#${orderId.slice(0, 8)}</strong> for <strong>${customerName}</strong> must ship by:</p>
      <p style="font-size:18px"><strong>${deadlineLabel}</strong></p>
      <p>Log in to AutoStore AI to update the order status once it's shipped.</p>
    `,
  });
}
