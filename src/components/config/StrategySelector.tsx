import type { Strategy } from '@/engine/types'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

const STRATEGIES: { value: Strategy; label: string; description: string }[] = [
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Mix of long weekends and extended breaks',
  },
  {
    value: 'long-weekends',
    label: 'Long Weekends',
    description: 'Maximize 3-4 day weekends throughout the year',
  },
  {
    value: 'extended',
    label: 'Extended Vacations',
    description: 'Fewer but longer vacation periods',
  },
]

export function StrategySelector() {
  const strategy = useAppStore((s) => s.strategy)
  const setStrategy = useAppStore((s) => s.setStrategy)

  return (
    <div className="flex flex-col gap-2">
      {STRATEGIES.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => setStrategy(s.value)}
          className={cn(
            'flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors',
            strategy === s.value
              ? 'border-primary bg-primary/5'
              : 'border-border hover:bg-accent'
          )}
        >
          <span className="text-sm font-medium">{s.label}</span>
          <span className="text-xs text-muted-foreground">{s.description}</span>
        </button>
      ))}
    </div>
  )
}
