import { useTranslation } from "react-i18next";
import { CalendarDays, Palmtree, TrendingUp } from "lucide-react";
import type { OptimizationResult } from "@/engine/types";
import { getCountryMeta } from "@/data/country-meta";

interface StatItemProps {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string | number;
  readonly sub?: string;
}

function StatItem({ icon, label, value, sub }: StatItemProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold leading-tight">{value}</p>
        <p className="truncate text-[11px] text-muted-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );
}

interface SummaryStatsProps {
  readonly result: OptimizationResult;
  readonly ptoBudget: number;
  readonly recoveryBudget: number;
  readonly country: string;
}

export function SummaryStats({
  result,
  ptoBudget,
  recoveryBudget,
  country,
}: SummaryStatsProps) {
  const { t } = useTranslation();
  const meta = getCountryMeta(country);
  const effDisplay = Number.isInteger(result.averageEfficiency)
    ? result.averageEfficiency
    : result.averageEfficiency.toFixed(1);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <StatItem
        icon={<CalendarDays className="h-4 w-4" />}
        label={t("results.totalDaysOff")}
        value={result.totalDaysOff}
      />
      <StatItem
        icon={<TrendingUp className="h-4 w-4" />}
        label={t("results.avgEfficiency")}
        value={`${effDisplay}:1`}
      />
      <StatItem
        icon={<Palmtree className="h-4 w-4" />}
        label={t("results.used", { label: meta.ptoLabel || "PTO" })}
        value={`${result.ptoUsed} / ${ptoBudget}`}
        sub={t("results.remaining", { count: ptoBudget - result.ptoUsed })}
      />
      {meta.hasRecoveryDays && (
        <StatItem
          icon={<Palmtree className="h-4 w-4" />}
          label={t("results.used", {
            label: meta.recoveryLabel || "Recovery",
          })}
          value={`${result.recoveryUsed} / ${recoveryBudget}`}
          sub={t("results.remaining", {
            count: recoveryBudget - result.recoveryUsed,
          })}
        />
      )}
    </div>
  );
}
