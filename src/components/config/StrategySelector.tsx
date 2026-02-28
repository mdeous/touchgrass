import { useTranslation } from "react-i18next";
import type { Strategy } from "@/engine/types";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

export function StrategySelector() {
  const { t } = useTranslation();
  const strategy = useAppStore((s) => s.strategy);
  const setStrategy = useAppStore((s) => s.setStrategy);

  const strategies: { value: Strategy; label: string; description: string }[] =
    [
      {
        value: "balanced",
        label: t("strategy.balanced"),
        description: t("strategy.balancedDesc"),
      },
      {
        value: "long-weekends",
        label: t("strategy.longWeekends"),
        description: t("strategy.longWeekendsDesc"),
      },
      {
        value: "extended",
        label: t("strategy.extended"),
        description: t("strategy.extendedDesc"),
      },
    ];

  return (
    <div className="flex flex-col gap-2">
      {strategies.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => setStrategy(s.value)}
          className={cn(
            "flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors",
            strategy === s.value
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-accent",
          )}
        >
          <span className="text-sm font-medium">{s.label}</span>
          <span className="text-xs text-muted-foreground">
            {s.description}
          </span>
        </button>
      ))}
    </div>
  );
}
