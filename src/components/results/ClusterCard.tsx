import { format } from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { EfficiencyBadge } from "@/components/results/EfficiencyBadge";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";
import type { Bridge } from "@/engine/types";

interface ClusterCardProps {
  readonly bridge: Bridge;
  readonly disabled: boolean;
  readonly selected: boolean;
  readonly onHover?: (bridgeId: string | null) => void;
}

function dateRange(start: Date, end: Date): string {
  const s = format(start, "MMM d");
  const e = format(end, "MMM d");
  return `${s} – ${e}`;
}

export function ClusterCard({
  bridge,
  disabled,
  selected,
  onHover,
}: ClusterCardProps) {
  const toggleBridgeDisabled = useAppStore((s) => s.toggleBridgeDisabled);

  const handleToggle = () => {
    if (bridge.pontName) {
      toggleBridgeDisabled(bridge.pontName);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors",
        disabled
          ? "opacity-40"
          : selected
            ? "bg-primary/5 hover:bg-primary/8"
            : "hover:bg-muted/50",
      )}
      onMouseEnter={() => onHover?.(bridge.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <Switch
        checked={!disabled}
        onCheckedChange={handleToggle}
        aria-label={`Toggle ${bridge.pontName ?? "bridge"}`}
        className="mt-0.5 shrink-0 scale-75"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm font-medium",
              disabled && "line-through",
            )}
          >
            {bridge.pontName ?? "Break"}
          </span>
          {!disabled && <EfficiencyBadge efficiency={bridge.efficiency} />}
        </div>
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" />
            {dateRange(bridge.startDate, bridge.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            {bridge.totalDaysOff}d off
          </span>
          {!disabled && (
            <span className="text-muted-foreground/70">
              {bridge.ptoCost} day{bridge.ptoCost !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
