import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import { CalendarOff, X } from "lucide-react";
import { formatShortDate } from "@/lib/format-date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAppStore } from "@/store/app-store";
import { useDateLocale } from "@/hooks/use-date-locale";
import { isInYear, yearPickerProps } from "@/components/config/year-scope";

const DATE_FORMAT = "yyyy-MM-dd";

function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT);
}

function fromDateKey(key: string): Date {
  return parse(key, DATE_FORMAT, new Date());
}

export function BlackoutDatePicker() {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const blackoutDates = useAppStore((s) => s.blackoutDates);
  const addBlackoutDate = useAppStore((s) => s.addBlackoutDate);
  const removeBlackoutDate = useAppStore((s) => s.removeBlackoutDate);

  const year = useAppStore((s) => s.year);
  // Only the selected year matters to the plan; other years stay stored.
  const yearDates = blackoutDates.filter((key) => isInYear(key, year));
  const selectedDates = yearDates.map(fromDateKey);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("config.blackoutDates")}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarOff className="size-3.5" />
              {t("config.add")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="multiple"
              locale={locale}
              {...yearPickerProps(year)}
              selected={selectedDates}
              onSelect={(dates) => {
                if (!dates) return;
                const newKeys = new Set(dates.map(toDateKey));
                const oldKeys = new Set(yearDates);
                for (const key of newKeys) {
                  if (!oldKeys.has(key)) addBlackoutDate(key);
                }
                for (const key of oldKeys) {
                  if (!newKeys.has(key)) removeBlackoutDate(key);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("config.blackoutHelper")}
      </p>

      {yearDates.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...yearDates].sort().map((dateKey) => (
            <Badge key={dateKey} variant="secondary" className="gap-1 pr-1">
              {formatShortDate(fromDateKey(dateKey), locale, i18n.language)}
              <button
                type="button"
                onClick={() => removeBlackoutDate(dateKey)}
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={t("config.removeDate", { date: dateKey })}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
