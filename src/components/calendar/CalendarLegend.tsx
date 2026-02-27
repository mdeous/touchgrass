import { cn } from "@/lib/utils";

const LEGEND_ITEMS = [
  { label: "Workday", className: "bg-background border" },
  { label: "Weekend", className: "bg-day-weekend" },
  { label: "Holiday", className: "bg-day-holiday" },
  { label: "PTO", className: "bg-day-pto" },
  { label: "Recovery (RTT)", className: "bg-day-recovery" },
  { label: "Blackout", className: "bg-day-blackout" },
  { label: "Pre-booked", className: "bg-day-prebooked" },
  {
    label: "School Hol.",
    className: "ring-1 ring-dashed ring-day-school bg-background",
  },
] as const;

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {LEGEND_ITEMS.map(({ label, className }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={cn("h-4 w-4 rounded", className)} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      ))}
    </div>
  );
}
