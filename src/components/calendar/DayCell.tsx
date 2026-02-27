import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { DayInfo, DayType } from '@/engine/types'

const dayTypeStyles: Record<DayType, string> = {
  workday: 'bg-background hover:bg-accent',
  weekend: 'bg-day-weekend text-muted-foreground',
  holiday: 'bg-day-holiday font-medium',
  cp: 'bg-day-cp font-medium',
  rtt: 'bg-day-rtt font-medium',
  blackout: 'bg-day-blackout text-muted-foreground',
  'prebooked-cp': 'bg-day-prebooked font-medium',
  'prebooked-rtt': 'bg-day-prebooked font-medium',
}

interface DayCellProps {
  readonly day: DayInfo
  readonly onToggle: (dateKey: string) => void
}

function tooltipLabel(day: DayInfo): string {
  const parts = [
    format(day.date, 'EEEE, MMMM d, yyyy'),
    day.holiday ? day.holiday.nameEn : null,
    `Type: ${day.type}`,
    day.isSchoolHoliday && day.schoolZoneName
      ? `School holiday (${day.schoolZoneName})`
      : null,
  ]
  return parts.filter(Boolean).join('\n')
}

export function DayCell({ day, onToggle }: DayCellProps) {
  const dayNumber = day.date.getDate()
  const isClickable = day.type === 'workday' || day.type === 'cp' || day.type === 'rtt'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={!isClickable}
          onClick={() => onToggle(day.dateKey)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded text-xs transition-colors',
            dayTypeStyles[day.type],
            isClickable && 'cursor-pointer',
            !isClickable && 'cursor-default',
            day.isSchoolHoliday && 'ring-1 ring-dashed ring-day-school'
          )}
        >
          {dayNumber}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="whitespace-pre-line text-left">
        {tooltipLabel(day)}
      </TooltipContent>
    </Tooltip>
  )
}
