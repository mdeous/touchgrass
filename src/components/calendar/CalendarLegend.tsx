import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function CalendarLegend() {
  const { t } = useTranslation();

  const items = [
    { label: t("legend.workday"), className: "bg-background border" },
    { label: t("legend.weekend"), className: "bg-day-weekend" },
    { label: t("legend.holiday"), className: "bg-day-holiday" },
    { label: t("legend.pto"), className: "bg-day-pto" },
    { label: t("legend.recovery"), className: "bg-day-recovery" },
    { label: t("legend.blackout"), className: "bg-day-blackout" },
    { label: t("legend.prebooked"), className: "bg-day-prebooked" },
    {
      label: t("legend.schoolHoliday"),
      className: "ring-1 ring-dashed ring-day-school bg-background",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ label, className }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn("h-4 w-4 rounded", className)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
