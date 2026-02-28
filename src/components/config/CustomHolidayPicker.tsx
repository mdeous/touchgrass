import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import { PartyPopper, X } from "lucide-react";
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

const DATE_FORMAT = "yyyy-MM-dd";

function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT);
}

function fromDateKey(key: string): Date {
  return parse(key, DATE_FORMAT, new Date());
}

export function CustomHolidayPicker() {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const customHolidays = useAppStore((s) => s.customHolidays);
  const addCustomHoliday = useAppStore((s) => s.addCustomHoliday);
  const removeCustomHoliday = useAppStore((s) => s.removeCustomHoliday);

  const selectedDates = customHolidays.map(fromDateKey);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {t("config.customHolidays")}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <PartyPopper className="size-3.5" />
              {t("config.add")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="multiple"
              locale={locale}
              selected={selectedDates}
              onSelect={(dates) => {
                if (!dates) return;
                const newKeys = new Set(dates.map(toDateKey));
                const oldKeys = new Set(customHolidays);
                for (const key of newKeys) {
                  if (!oldKeys.has(key)) addCustomHoliday(key);
                }
                for (const key of oldKeys) {
                  if (!newKeys.has(key)) removeCustomHoliday(key);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("config.customHolidaysHelper")}
      </p>

      {customHolidays.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...customHolidays].sort().map((dateKey) => (
            <Badge key={dateKey} variant="secondary" className="gap-1 pr-1">
              {formatShortDate(fromDateKey(dateKey), locale, i18n.language)}
              <button
                type="button"
                onClick={() => removeCustomHoliday(dateKey)}
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
