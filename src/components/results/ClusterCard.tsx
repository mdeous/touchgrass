import { useTranslation } from "react-i18next";
import { Calendar, Clock } from "lucide-react";
import { formatShortDate } from "@/lib/format-date";
import { Switch } from "@/components/ui/switch";
import { EfficiencyBadge } from "@/components/results/EfficiencyBadge";
import { useAppStore } from "@/store/app-store";
import { useDateLocale } from "@/hooks/use-date-locale";
import { cn } from "@/lib/utils";
import type { Bridge } from "@/engine/types";

interface ClusterCardProps {
  readonly bridge: Bridge;
  readonly disabled: boolean;
  readonly selected: boolean;
  readonly onHover?: (bridgeId: string | null) => void;
}

export function ClusterCard({
  bridge,
  disabled,
  selected,
  onHover,
}: ClusterCardProps) {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const toggleBridgeDisabled = useAppStore((s) => s.toggleBridgeDisabled);

  const handleToggle = () => toggleBridgeDisabled(bridge.id);

  const lang = i18n.language;
  const s = formatShortDate(bridge.startDate, locale, lang);
  const e = formatShortDate(bridge.endDate, locale, lang);
  const dateRangeStr = `${s} – ${e}`;

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
            {(i18n.language === "en"
              ? bridge.pontName
              : bridge.pontNameLocal) ?? t("bridge.break")}
          </span>
          {!disabled && <EfficiencyBadge efficiency={bridge.efficiency} />}
        </div>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Calendar className="h-3 w-3 shrink-0" />
            {dateRangeStr}
          </span>
          <span className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3 shrink-0" />
            {t("bridge.daysOff", { count: bridge.totalDaysOff })}
          </span>
        </div>
        {!disabled && (
          <span className="text-xs text-muted-foreground/70">
            {t("bridge.ptoCost", { count: bridge.ptoCost })}
          </span>
        )}
      </div>
    </div>
  );
}
