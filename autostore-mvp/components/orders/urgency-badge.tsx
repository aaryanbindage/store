import { Badge } from "@/components/ui/badge";
import { getDeadlineUrgency, urgencyStyles } from "@/lib/shipping";
import { cn } from "@/lib/utils";

const labels = {
  overdue: "Overdue",
  urgent: "Due today",
  soon: "Due soon",
  normal: "On track",
};

export function UrgencyBadge({ deadline, status }: { deadline: string | null; status: string }) {
  const urgency = getDeadlineUrgency(deadline, status);
  return (
    <Badge variant="outline" className={cn("border", urgencyStyles[urgency])}>
      {labels[urgency]}
    </Badge>
  );
}
