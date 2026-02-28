import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { ReloadPrompt } from "@/components/pwa/ReloadPrompt";
import type { AppConfig } from "@/engine/types";

export function AppShell() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const year = useAppStore((s) => s.year);
  const country = useAppStore((s) => s.country);
  const subdivision = useAppStore((s) => s.subdivision);
  const weekendDays = useAppStore((s) => s.weekendDays);
  const schoolZone = useAppStore((s) => s.schoolZone);
  const ptoBudget = useAppStore((s) => s.ptoBudget);
  const recoveryBudget = useAppStore((s) => s.recoveryBudget);
  const strategy = useAppStore((s) => s.strategy);
  const blackoutDates = useAppStore((s) => s.blackoutDates);
  const preBookedDates = useAppStore((s) => s.preBookedDates);
  const preBookedTypes = useAppStore((s) => s.preBookedTypes);
  const customHolidays = useAppStore((s) => s.customHolidays);
  const manualOverrides = useAppStore((s) => s.manualOverrides);
  const disabledBridges = useAppStore((s) => s.disabledBridges);

  const config: AppConfig = {
    year,
    country,
    subdivision,
    weekendDays,
    schoolZone,
    ptoBudget,
    recoveryBudget,
    strategy,
    blackoutDates,
    preBookedDates,
    preBookedTypes,
    customHolidays,
    manualOverrides,
    disabledBridges,
  };

  useUrlState();

  const { calendar, result, allBridges, loading } = useOptimization(config);

  const ptoRemaining = config.ptoBudget - result.ptoUsed;
  const recoveryRemaining = config.recoveryBudget - result.recoveryUsed;
  const { onToggle } = useCalendarInteraction(
    calendar,
    ptoRemaining,
    recoveryRemaining,
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-screen-2xl flex-col gap-4 p-4 xl:flex-row xl:items-start">
        {/* Mobile config trigger */}
        <div className="xl:hidden">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="size-4" />
                {t("app.configuration")}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto p-0">
              <SheetHeader className="px-4 pt-4">
                <SheetTitle>{t("app.configuration")}</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <ConfigPanel />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden w-[280px] shrink-0 rounded-xl border bg-card p-4 xl:block">
          <ConfigPanel />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">{t("app.loadingHolidays")}</p>
            </div>
          ) : (
            <CalendarGrid
              days={calendar}
              year={config.year}
              onToggle={onToggle}
            />
          )}
          <CalendarLegend />
        </div>

        <aside className="w-full shrink-0 xl:w-[320px]">
          <ResultsPanel
            result={result}
            config={config}
            allBridges={allBridges}
          />
        </aside>
      </main>

      <Toaster position="bottom-right" />
      <ReloadPrompt />
    </div>
  );
}
