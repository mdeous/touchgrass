import { useTranslation } from "react-i18next";
import { format, getDay } from "date-fns";
import { DayCell } from "@/components/calendar/DayCell";
import { useDateLocale } from "@/hooks/use-date-locale";
import type { DayInfo } from "@/engine/types";

function mondayOffset(firstDayOfMonth: Date): number {
  const dow = getDay(firstDayOfMonth);
  return dow === 0 ? 6 : dow - 1;
}

interface MonthViewProps {
  readonly month: number;
  readonly year: number;
  readonly days: readonly DayInfo[];
  readonly onToggle: (dateKey: string) => void;
}

export function MonthView({ month, year, days, onToggle }: MonthViewProps) {
  const { t } = useTranslation();
  const locale = useDateLocale();
  const firstDay = new Date(year, month, 1);
  const offset = mondayOffset(firstDay);
  const monthName = format(firstDay, "MMMM", { locale }).replace(/^./, (c) =>
    c.toUpperCase(),
  );

  const dayHeaders = [
    t("calendar.mon"),
    t("calendar.tue"),
    t("calendar.wed"),
    t("calendar.thu"),
    t("calendar.fri"),
    t("calendar.sat"),
    t("calendar.sun"),
  ];

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold text-foreground">{monthName}</h3>
      <div className="grid grid-cols-7 gap-0.5">
        {dayHeaders.map((d, i) => (
          <div
            key={i}
            className="flex h-6 w-7 items-center justify-center text-[10px] font-medium text-muted-foreground"
          >
            {d}
          </div>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <div key={`empty-${i}`} className="h-7 w-7" />
        ))}
        {days.map((day) => (
          <DayCell key={day.dateKey} day={day} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}
