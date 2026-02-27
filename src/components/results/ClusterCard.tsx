import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { EfficiencyBadge } from '@/components/results/EfficiencyBadge'
import type { Bridge } from '@/engine/types'

interface ClusterCardProps {
  readonly bridge: Bridge
  readonly onHover?: (bridgeId: string | null) => void
}

function dateRange(start: Date, end: Date): string {
  const s = format(start, 'MMM d')
  const e = format(end, 'MMM d, yyyy')
  return `${s} - ${e}`
}

export function ClusterCard({ bridge, onHover }: ClusterCardProps) {
  return (
    <Card
      className="transition-shadow hover:shadow-md"
      onMouseEnter={() => onHover?.(bridge.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <CardContent className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">
            {bridge.pontName ?? 'PTO Break'}
          </span>
          <EfficiencyBadge efficiency={bridge.efficiency} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateRange(bridge.startDate, bridge.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {bridge.totalDaysOff}d off
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Cost: {bridge.ptoCost} PTO day{bridge.ptoCost !== 1 ? 's' : ''}
        </div>
      </CardContent>
    </Card>
  )
}
