import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/store/app-store'

export function PtoBudgetInputs() {
  const cpBudget = useAppStore((s) => s.cpBudget)
  const rttBudget = useAppStore((s) => s.rttBudget)
  const setCpBudget = useAppStore((s) => s.setCpBudget)
  const setRttBudget = useAppStore((s) => s.setRttBudget)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cp-budget">Conges Payes (CP)</Label>
        <Input
          id="cp-budget"
          type="number"
          min={0}
          max={50}
          value={cpBudget}
          onChange={(e) => {
            const val = Math.max(0, Math.min(50, Number(e.target.value) || 0))
            setCpBudget(val)
          }}
        />
        <p className="text-xs text-muted-foreground">
          Paid vacation days available (default 25)
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rtt-budget">RTT</Label>
        <Input
          id="rtt-budget"
          type="number"
          min={0}
          max={50}
          value={rttBudget}
          onChange={(e) => {
            const val = Math.max(0, Math.min(50, Number(e.target.value) || 0))
            setRttBudget(val)
          }}
        />
        <p className="text-xs text-muted-foreground">
          Working time reduction days (default 9)
        </p>
      </div>
    </div>
  )
}
