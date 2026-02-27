import { Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  groupAllocations,
  generateTimeOffSummary,
} from "@/export/text-summary";
import type { Allocation } from "@/engine/types";
import { getCountryMeta } from "@/data/country-meta";

interface TimeOffSummaryProps {
  readonly allocations: readonly Allocation[];
  readonly country: string;
}

export function TimeOffSummary({ allocations, country }: TimeOffSummaryProps) {
  const meta = getCountryMeta(country);
  const groups = groupAllocations(allocations);

  if (groups.length === 0) return null;

  const handleCopy = async () => {
    try {
      const text = generateTimeOffSummary(allocations, meta);
      await navigator.clipboard.writeText(text);
      toast.success("Time off summary copied to clipboard");
    } catch {
      toast.error("Failed to copy summary");
    }
  };

  return (
    <Accordion type="single" collapsible>
      <AccordionItem
        value="time-off-summary"
        className="rounded-xl border bg-card px-4"
      >
        <AccordionTrigger className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
          Time off summary
        </AccordionTrigger>
        <AccordionContent>
          <div className="flex flex-col gap-4">
            {groups.map((group) => {
              const label =
                group.leaveType === "pto"
                  ? meta.ptoLabel || "PTO"
                  : meta.recoveryLabel || "Recovery";
              return (
                <div key={group.leaveType} className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {label} days to request ({group.count} day
                    {group.count !== 1 ? "s" : ""})
                  </p>
                  <div className="flex flex-col gap-0.5 pl-3">
                    {group.lines.map((line) => (
                      <span key={line} className="text-sm">
                        {line}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
