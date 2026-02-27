import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const DAYS: { index: number; label: string }[] = [
  { index: 1, label: "M" },
  { index: 2, label: "T" },
  { index: 3, label: "W" },
  { index: 4, label: "T" },
  { index: 5, label: "F" },
  { index: 6, label: "S" },
  { index: 0, label: "S" },
];

export function WeekendSelector() {
  const weekendDays = useAppStore((s) => s.weekendDays);
  const setWeekendDays = useAppStore((s) => s.setWeekendDays);

  const toggle = (day: number) => {
    const next = weekendDays.includes(day)
      ? weekendDays.filter((d) => d !== day)
      : [...weekendDays, day];
    setWeekendDays(next);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>Weekend Days</Label>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(({ index, label }) => (
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
      <p className="text-xs text-muted-foreground">Days off each week</p>
    </div>
  );
}
