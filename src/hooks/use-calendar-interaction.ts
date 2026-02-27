import { useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import type { DayInfo, LeaveType } from '@/engine/types'

interface CalendarInteraction {
  readonly onToggle: (dateKey: string) => void
}

export function useCalendarInteraction(
  calendar: readonly DayInfo[],
  ptoRemaining: number,
  recoveryRemaining: number,
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

      if (day.type === 'pto' || day.type === 'recovery') {
        toggleManualOverride(dateKey, null)
        return
      }

      if (day.type !== 'workday') return

      const leaveType: LeaveType = recoveryRemaining > 0 ? 'recovery' : ptoRemaining > 0 ? 'pto' : 'pto'
      toggleManualOverride(dateKey, leaveType)
    },
    [calendar, ptoRemaining, recoveryRemaining, manualOverrides, toggleManualOverride],
  )

  return { onToggle }
}
