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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4 p-4 xl:flex-row">
        <div className="xl:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="size-4" />
                Configuration
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="px-4 pt-4">
                <SheetTitle>Configuration</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-5rem)] px-4 pb-4">
                <ConfigPanel />
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden w-[280px] shrink-0 xl:block">
          <div className="sticky top-4">
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <ConfigPanel />
            </ScrollArea>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <CalendarLegend />
          <CalendarGrid
            days={calendar}
            year={config.year}
            onToggle={onToggle}
          />
        </div>

        <aside className="w-full shrink-0 xl:w-[320px]">
          <ResultsPanel result={result} config={config} />
        </aside>
      </main>

      <Footer />
      <Toaster position="bottom-right" />
    </div>
  );
}
