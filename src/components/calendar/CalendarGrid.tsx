import { useMemo } from 'react'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MonthView } from '@/components/calendar/MonthView'
import type { DayInfo } from '@/engine/types'

interface CalendarGridProps {
  readonly days: readonly DayInfo[]
  readonly year: number
  readonly onToggle: (dateKey: string) => void
}

function groupByMonth(days: readonly DayInfo[]): Map<number, DayInfo[]> {
  const map = new Map<number, DayInfo[]>()
  for (const day of days) {
    const month = day.date.getMonth()
    const existing = map.get(month)
    if (existing) {
      existing.push(day)
    } else {
      map.set(month, [day])
    }
  }
  return map
}

export function CalendarGrid({ days, year, onToggle }: CalendarGridProps) {
  const monthGroups = useMemo(() => groupByMonth(days), [days])
  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {months.map((month) => (
          <MonthView
            key={month}
            month={month}
            year={year}
            days={monthGroups.get(month) ?? []}
            onToggle={onToggle}
          />
        ))}
      </div>
    </TooltipProvider>
  )
}
