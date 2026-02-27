import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EfficiencyBadgeProps {
  readonly efficiency: number;
}

function efficiencyColor(efficiency: number): string {
  if (efficiency >= 2) return "bg-green-600 text-white border-green-600";
  if (efficiency >= 1.5) return "bg-yellow-500 text-white border-yellow-500";
  return "bg-muted text-muted-foreground";
}

function formatRatio(efficiency: number): string {
  const formatted = Number.isInteger(efficiency)
    ? String(efficiency)
    : efficiency.toFixed(1);
  return `${formatted}:1`;
}

export function EfficiencyBadge({ efficiency }: EfficiencyBadgeProps) {
  return (
    <Badge className={cn("text-[10px]", efficiencyColor(efficiency))}>
      {formatRatio(efficiency)}
    </Badge>
  );
}
