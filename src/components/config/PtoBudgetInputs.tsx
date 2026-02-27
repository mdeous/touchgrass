import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";

export function PtoBudgetInputs() {
  const ptoBudget = useAppStore((s) => s.ptoBudget);
  const recoveryBudget = useAppStore((s) => s.recoveryBudget);
  const setPtoBudget = useAppStore((s) => s.setPtoBudget);
  const setRecoveryBudget = useAppStore((s) => s.setRecoveryBudget);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="pto-budget">Paid Time-Off (PTO)</Label>
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
          Paid vacation days available (default 25)
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="recovery-budget">Recovery Days (RTT)</Label>
        <Input
          id="recovery-budget"
          type="number"
          min={0}
          max={50}
          value={recoveryBudget}
          onChange={(e) => {
            const val = Math.max(0, Math.min(50, Number(e.target.value) || 0));
            setRecoveryBudget(val);
          }}
        />
        <p className="text-xs text-muted-foreground">
          Recovery days available (default 9)
        </p>
      </div>
    </div>
  );
}
