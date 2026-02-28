import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { getCountryMeta } from "@/data/country-meta";

export function PtoBudgetInputs() {
  const { t } = useTranslation();
  const country = useAppStore((s) => s.country);
  const ptoBudget = useAppStore((s) => s.ptoBudget);
  const recoveryBudget = useAppStore((s) => s.recoveryBudget);
  const setPtoBudget = useAppStore((s) => s.setPtoBudget);
  const setRecoveryBudget = useAppStore((s) => s.setRecoveryBudget);

  const meta = getCountryMeta(country);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pto-budget">{t("config.paidTimeOff")}</Label>
        <Input
          id="pto-budget"
          type="number"
          min={0}
          max={50}
          value={ptoBudget}
          onChange={(e) => {
            const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
            setPtoBudget(val);
          }}
        />
        <p className="text-xs text-muted-foreground">
          {t("config.ptoHelper", { count: meta.defaultPtoBudget })}
        </p>
      </div>

      {meta.hasRecoveryDays && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recovery-budget">{t("config.recoveryDays")}</Label>
          <Input
            id="recovery-budget"
            type="number"
            min={0}
            max={50}
            value={recoveryBudget}
            onChange={(e) => {
              const val = Math.max(
                0,
                Math.min(50, Number(e.target.value) || 0),
              );
              setRecoveryBudget(val);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {t("config.recoveryHelper", { count: meta.defaultRecoveryBudget })}
          </p>
        </div>
      )}
    </div>
  );
}
