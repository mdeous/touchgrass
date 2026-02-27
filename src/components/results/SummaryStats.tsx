import { CalendarDays, Palmtree, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OptimizationResult } from '@/engine/types'

interface StatItemProps {
  readonly icon: React.ReactNode
  readonly label: string
  readonly value: string | number
  readonly sub?: string
  readonly className?: string
}

function StatItem({ icon, label, value, sub, className }: StatItemProps) {
  return (
    <Card className={cn('flex-1 min-w-[120px]', className)}>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-lg font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

interface SummaryStatsProps {
  readonly result: OptimizationResult
  readonly cpBudget: number
  readonly rttBudget: number
}

export function SummaryStats({ result, cpBudget, rttBudget }: SummaryStatsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatItem
        icon={<CalendarDays className="h-4 w-4" />}
        label="Total days off"
        value={result.totalDaysOff}
      />
      <StatItem
        icon={<Palmtree className="h-4 w-4" />}
        label="CP used"
        value={`${result.cpUsed}/${cpBudget}`}
        sub={`${cpBudget - result.cpUsed} remaining`}
      />
      <StatItem
        icon={<Palmtree className="h-4 w-4" />}
        label="RTT used"
        value={`${result.rttUsed}/${rttBudget}`}
        sub={`${rttBudget - result.rttUsed} remaining`}
      />
      <StatItem
        icon={<TrendingUp className="h-4 w-4" />}
        label="Avg efficiency"
        value={`${result.averageEfficiency.toFixed(1)}:1`}
      />
      <StatItem
        icon={<BarChart3 className="h-4 w-4" />}
        label="Breaks"
        value={result.selectedBridges.length}
      />
    </div>
  )
}
