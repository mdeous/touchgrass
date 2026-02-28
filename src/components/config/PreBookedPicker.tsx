import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format, parse } from "date-fns";
import { CalendarCheck, X } from "lucide-react";
import { formatShortDate } from "@/lib/format-date";
import type { LeaveType } from "@/engine/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { useDateLocale } from "@/hooks/use-date-locale";

const DATE_FORMAT = "yyyy-MM-dd";

function toDateKey(date: Date): string {
  return format(date, DATE_FORMAT);
}

function fromDateKey(key: string): Date {
  return parse(key, DATE_FORMAT, new Date());
}

export function PreBookedPicker() {
  const { t, i18n } = useTranslation();
  const locale = useDateLocale();
  const preBookedDates = useAppStore((s) => s.preBookedDates);
  const preBookedTypes = useAppStore((s) => s.preBookedTypes);
  const addPreBookedDate = useAppStore((s) => s.addPreBookedDate);
  const removePreBookedDate = useAppStore((s) => s.removePreBookedDate);
  const [leaveType, setLeaveType] = useState<LeaveType>("pto");

  const selectedDates = preBookedDates.map(fromDateKey);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t("config.preBookedDays")}</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarCheck className="size-3.5" />
              {t("config.add")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <span className="text-xs text-muted-foreground">
                {t("config.type")}
              </span>
              <Select
                value={leaveType}
                onValueChange={(v) => setLeaveType(v as LeaveType)}
              >
                <SelectTrigger size="sm" className="h-7 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pto">{t("config.pto")}</SelectItem>
                  <SelectItem value="recovery">{t("config.rtt")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Calendar
              mode="multiple"
              locale={locale}
              selected={selectedDates}
              onSelect={(dates) => {
                if (!dates) return;
                const newKeys = new Set(dates.map(toDateKey));
                const oldKeys = new Set(preBookedDates);
                for (const key of newKeys) {
                  if (!oldKeys.has(key)) addPreBookedDate(key, leaveType);
                }
                for (const key of oldKeys) {
                  if (!newKeys.has(key)) removePreBookedDate(key);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <p className="text-xs text-muted-foreground">
        {t("config.preBookedHelper")}
      </p>

      {preBookedDates.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {[...preBookedDates].sort().map((dateKey) => (
            <Badge key={dateKey} variant="outline" className="gap-1 pr-1">
              {formatShortDate(fromDateKey(dateKey), locale, i18n.language)}
              <span className="text-xs font-semibold uppercase text-primary">
                {(preBookedTypes[dateKey] ?? "pto") === "pto"
                  ? t("config.pto")
                  : t("config.rtt")}
              </span>
              <button
                type="button"
                onClick={() => removePreBookedDate(dateKey)}
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
