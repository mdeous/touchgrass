import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDateLocale } from "@/hooks/use-date-locale";
import type { DayInfo, DayType } from "@/engine/types";

const dayTypeLegendKey: Record<DayType, string> = {
  workday: "legend.workday",
  weekend: "legend.weekend",
  holiday: "legend.holiday",
  pto: "legend.pto",
  recovery: "legend.recovery",
  blackout: "legend.blackout",
  "prebooked-pto": "legend.prebooked",
  "prebooked-recovery": "legend.prebooked",
};

const dayTypeStyles: Record<DayType, string> = {
  workday: "bg-background hover:bg-accent",
  weekend: "bg-day-weekend text-muted-foreground",
  holiday: "bg-day-holiday font-medium",
  pto: "bg-day-pto font-medium",
  recovery: "bg-day-recovery font-medium",
  blackout: "bg-day-blackout text-muted-foreground",
  "prebooked-pto": "bg-day-prebooked font-medium",
  "prebooked-recovery": "bg-day-prebooked font-medium",
};

interface DayCellProps {
  readonly day: DayInfo;
  readonly onToggle: (dateKey: string) => void;
}

export function DayCell({ day, onToggle }: DayCellProps) {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const dayNumber = day.date.getDate();
  const isClickable =
    day.type === "workday" || day.type === "pto" || day.type === "recovery";

  const holidayName =
    day.holiday
      ? i18n.language === "fr"
        ? day.holiday.name
        : day.holiday.nameEn
      : null;

  const tooltipParts = [
    format(day.date, "PPPP", { locale }),
    holidayName,
    t("dayCell.type", { type: t(dayTypeLegendKey[day.type]) }),
    day.isSchoolHoliday && day.schoolZoneName
      ? t("dayCell.schoolHoliday", { zone: day.schoolZoneName })
      : null,
  ];
  const tooltipText = tooltipParts.filter(Boolean).join("\n");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={!isClickable}
          onClick={() => onToggle(day.dateKey)}
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded text-xs transition-colors",
            dayTypeStyles[day.type],
            isClickable && "cursor-pointer",
            !isClickable && "cursor-default",
            day.isSchoolHoliday && "ring-1 ring-dashed ring-day-school",
          )}
        >
          {dayNumber}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="whitespace-pre-line text-left">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
