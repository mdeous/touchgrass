import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { getCountryMeta } from "@/data/country-meta";

export function PtoBudgetInputs() {
  const country = useAppStore((s) => s.country);
  const ptoBudget = useAppStore((s) => s.ptoBudget);
  const recoveryBudget = useAppStore((s) => s.recoveryBudget);
  const setPtoBudget = useAppStore((s) => s.setPtoBudget);
  const setRecoveryBudget = useAppStore((s) => s.setRecoveryBudget);

  const meta = getCountryMeta(country);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pto-budget">Paid Time Off</Label>
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
          Paid vacation days available (default {meta.defaultPtoBudget})
        </p>
      </div>

      {meta.hasRecoveryDays && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="recovery-budget">Recovery Days</Label>
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
            Recovery days available (default {meta.defaultRecoveryBudget})
          </p>
        </div>
      )}
    </div>
  );
}
