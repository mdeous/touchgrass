import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function WeekendSelector() {
  const { t } = useTranslation();
  const weekendDays = useAppStore((s) => s.weekendDays);
  const setWeekendDays = useAppStore((s) => s.setWeekendDays);

  const days = [
    { index: 1, label: t("day.mon") },
    { index: 2, label: t("day.tue") },
    { index: 3, label: t("day.wed") },
    { index: 4, label: t("day.thu") },
    { index: 5, label: t("day.fri") },
    { index: 6, label: t("day.sat") },
    { index: 0, label: t("day.sun") },
  ];

  const toggle = (day: number) => {
    const next = weekendDays.includes(day)
      ? weekendDays.filter((d) => d !== day)
      : [...weekendDays, day];
    setWeekendDays(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{t("config.weekendDays")}</Label>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ index, label }) => (
          <button
            key={index}
            type="button"
            onClick={() => toggle(index)}
            className={cn(
              "rounded-md py-1 text-xs font-medium transition-colors",
              weekendDays.includes(index)
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("config.weekendHelper")}
      </p>
    </div>
  );
}
