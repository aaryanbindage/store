export function calculateShippingDeadline(
  orderDate: Date = new Date(),
  processingDays = 2,
  shippingBuffer = 1
): Date {
  const deadline = new Date(orderDate);
  let businessDaysAdded = 0;

  while (businessDaysAdded < processingDays + shippingBuffer) {
    deadline.setDate(deadline.getDate() + 1);
    const dayOfWeek = deadline.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysAdded++;
    }
  }

  deadline.setHours(17, 0, 0, 0);
  return deadline;
}

export type Urgency = "overdue" | "urgent" | "soon" | "normal";

export function getDeadlineUrgency(deadline: string | null, status: string): Urgency {
  if (!deadline || status === "delivered") return "normal";
  const hoursLeft = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return "overdue";
  if (hoursLeft < 24) return "urgent";
  if (hoursLeft < 72) return "soon";
  return "normal";
}

export const urgencyStyles: Record<Urgency, string> = {
  overdue: "bg-destructive/15 text-destructive border-destructive/30",
  urgent: "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400",
  soon: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30 dark:text-yellow-400",
  normal: "bg-muted text-muted-foreground border-transparent",
};
