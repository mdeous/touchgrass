import { useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import type { DayInfo, LeaveType } from '@/engine/types'

interface CalendarInteraction {
  readonly onToggle: (dateKey: string) => void
}

export function useCalendarInteraction(
  calendar: readonly DayInfo[],
  cpRemaining: number,
  rttRemaining: number,
): CalendarInteraction {
  const toggleManualOverride = useAppStore((s) => s.toggleManualOverride)
  const manualOverrides = useAppStore((s) => s.manualOverrides)

  const onToggle = useCallback(
    (dateKey: string) => {
      const day = calendar.find((d) => d.dateKey === dateKey)
      if (!day) return

      const existing = manualOverrides[dateKey]

      if (existing !== undefined) {
        toggleManualOverride(dateKey, null)
        return
      }

      if (day.type === 'cp' || day.type === 'rtt') {
        toggleManualOverride(dateKey, null)
        return
      }

      if (day.type !== 'workday') return

      const leaveType: LeaveType = rttRemaining > 0 ? 'rtt' : cpRemaining > 0 ? 'cp' : 'cp'
      toggleManualOverride(dateKey, leaveType)
    },
    [calendar, cpRemaining, rttRemaining, manualOverrides, toggleManualOverride],
  )

  return { onToggle }
}
