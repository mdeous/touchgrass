import { useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import type { DayInfo, LeaveType } from '@/engine/types'

interface CalendarInteraction {
  readonly onToggle: (dateKey: string) => void
}

/**
 * Clicking a day:
 * - with a manual override: removes it;
 * - picked by the optimizer: forces it back to a workday;
 * - a plain workday: books it as leave, if any budget is left.
 */
export function useCalendarInteraction(
  calendar: readonly DayInfo[],
  ptoRemaining: number,
  recoveryRemaining: number,
): CalendarInteraction {
  const setManualOverride = useAppStore((s) => s.setManualOverride)
  const clearManualOverride = useAppStore((s) => s.clearManualOverride)
  const manualOverrides = useAppStore((s) => s.manualOverrides)

  const onToggle = useCallback(
    (dateKey: string) => {
      const day = calendar.find((d) => d.dateKey === dateKey)
      if (!day) return

      if (dateKey in manualOverrides) {
        clearManualOverride(dateKey)
        return
      }

      if (day.type === 'pto' || day.type === 'recovery') {
        setManualOverride(dateKey, null)
        return
      }

      if (day.type !== 'workday') return

      let leaveType: LeaveType
      if (recoveryRemaining > 0) leaveType = 'recovery'
      else if (ptoRemaining > 0) leaveType = 'pto'
      else return
      setManualOverride(dateKey, leaveType)
    },
    [
      calendar,
      ptoRemaining,
      recoveryRemaining,
      manualOverrides,
      setManualOverride,
      clearManualOverride,
    ],
  )

  return { onToggle }
}
