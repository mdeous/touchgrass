import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { EfficiencyBadge } from '@/components/results/EfficiencyBadge'
import { useAppStore } from '@/store/app-store'
import { cn } from '@/lib/utils'
import type { Bridge } from '@/engine/types'

interface ClusterCardProps {
  readonly bridge: Bridge
  readonly disabled: boolean
  readonly selected: boolean
  readonly onHover?: (bridgeId: string | null) => void
}

function dateRange(start: Date, end: Date): string {
  const s = format(start, 'MMM d')
  const e = format(end, 'MMM d, yyyy')
  return `${s} - ${e}`
}

export function ClusterCard({ bridge, disabled, selected, onHover }: ClusterCardProps) {
  const toggleBridgeDisabled = useAppStore((s) => s.toggleBridgeDisabled)

  const handleToggle = () => {
    if (bridge.pontName) {
      toggleBridgeDisabled(bridge.pontName)
    }
  }

  return (
    <Card
      className={cn(
        'transition-all',
        disabled && 'opacity-50',
        selected && !disabled && 'hover:shadow-md',
      )}
      onMouseEnter={() => onHover?.(bridge.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <CardContent className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <Switch
              checked={!disabled}
              onCheckedChange={handleToggle}
              aria-label={`Toggle ${bridge.pontName ?? 'bridge'}`}
              className="shrink-0 scale-75"
            />
            <span className={cn('truncate text-sm font-medium', disabled && 'line-through')}>
              Pont: {bridge.pontName ?? 'Break'}
            </span>
          </div>
          {!disabled && <EfficiencyBadge efficiency={bridge.efficiency} />}
        </div>
        <div className="flex items-center gap-3 pl-9 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {dateRange(bridge.startDate, bridge.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {bridge.totalDaysOff}d off
          </span>
        </div>
        {!disabled && (
          <div className="pl-9 text-xs text-muted-foreground">
            Cost: {bridge.ptoCost} PTO day{bridge.ptoCost !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
