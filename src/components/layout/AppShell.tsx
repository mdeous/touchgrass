import { useState } from "react";
import { Settings } from "lucide-react";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Header } from "@/components/layout/Header";
import { ConfigPanel } from "@/components/config/ConfigPanel";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { useOptimization } from "@/hooks/use-optimization";
import { useCalendarInteraction } from "@/hooks/use-calendar-interaction";
import { useUrlState } from "@/hooks/use-url-state";
import { useAppStore } from "@/store/app-store";
import type { AppConfig } from "@/engine/types";

export function AppShell() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const year = useAppStore((s) => s.year);
  const region = useAppStore((s) => s.region);
  const schoolZone = useAppStore((s) => s.schoolZone);
  const cpBudget = useAppStore((s) => s.cpBudget);
  const rttBudget = useAppStore((s) => s.rttBudget);
  const strategy = useAppStore((s) => s.strategy);
  const blackoutDates = useAppStore((s) => s.blackoutDates);
  const preBookedDates = useAppStore((s) => s.preBookedDates);
  const preBookedTypes = useAppStore((s) => s.preBookedTypes);
  const customHolidays = useAppStore((s) => s.customHolidays);
  const manualOverrides = useAppStore((s) => s.manualOverrides);

  const config: AppConfig = {
    year,
    region,
    schoolZone,
    cpBudget,
    rttBudget,
    strategy,
    blackoutDates,
    preBookedDates,
    preBookedTypes,
    customHolidays,
    manualOverrides,
  };

  useUrlState();

  const { calendar, result } = useOptimization(config);

  const cpRemaining = config.cpBudget - result.cpUsed;
  const rttRemaining = config.rttBudget - result.rttUsed;
  const { onToggle } = useCalendarInteraction(
    calendar,
    cpRemaining,
    rttRemaining,
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4 overflow-hidden p-4 xl:flex-row">
        {/* Mobile config trigger */}
        <div className="xl:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="size-4" />
                Configuration
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto p-0">
              <SheetHeader className="px-4 pt-4">
                <SheetTitle>Configuration</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <ConfigPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Left sidebar — scrolls independently */}
        <aside className="hidden w-[280px] shrink-0 overflow-y-auto xl:block">
          <ConfigPanel />
        </aside>

        {/* Calendar — scrolls independently */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
          <CalendarLegend />
          <CalendarGrid
            days={calendar}
            year={config.year}
            onToggle={onToggle}
          />
        </div>

        {/* Right sidebar — scrolls independently */}
        <aside className="w-full shrink-0 overflow-y-auto xl:w-[320px]">
          <ResultsPanel result={result} config={config} />
        </aside>
      </main>

      <Toaster position="bottom-right" />
    </div>
  );
}
