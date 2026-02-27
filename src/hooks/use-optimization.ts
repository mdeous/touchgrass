import { useMemo } from 'react'
import { buildCalendar } from '@/engine/calendar-utils'
import { findBridges } from '@/engine/bridge-finder'
import { scoreBridges } from '@/engine/scorer'
import { optimize } from '@/engine/optimizer'
import { allocate } from '@/engine/allocator'
import type { AppConfig, DayInfo, LeaveType, OptimizationResult } from '@/engine/types'
import { format } from 'date-fns'

interface OptimizationOutput {
  readonly calendar: readonly DayInfo[]
  readonly result: OptimizationResult
}

function applyManualOverrides(
  calendar: readonly DayInfo[],
  overrides: Readonly<Record<string, LeaveType | null>>,
): readonly DayInfo[] {
  const overrideKeys = Object.keys(overrides)
  if (overrideKeys.length === 0) return calendar

  return calendar.map((day) => {
    const override = overrides[day.dateKey]
    if (override === undefined) return day
    if (override === null) return { ...day, type: 'workday' as const }
    return { ...day, type: override }
  })
}

export function useOptimization(config: AppConfig): OptimizationOutput {
  return useMemo(() => {
    const baseCalendar = buildCalendar(config)
    const bridges = findBridges(baseCalendar)
    const scored = scoreBridges(bridges, config.strategy)
    const selectedBridges = optimize(
      scored,
      config.cpBudget,
      config.rttBudget,
      config.blackoutDates,
      config.preBookedDates,
    )
    const allAllocations = allocate(
      selectedBridges,
      config.cpBudget,
      config.rttBudget,
      config.preBookedTypes,
    )

    let cpUsed = 0
    let rttUsed = 0
    for (const a of allAllocations) {
      if (a.leaveType === 'cp') cpUsed++
      else rttUsed++
    }

    const totalPtoCost = selectedBridges.reduce((sum, b) => sum + b.ptoCost, 0)
    const totalGained = selectedBridges.reduce((sum, b) => sum + b.gainedDays, 0)
    const averageEfficiency = totalPtoCost > 0 ? totalGained / totalPtoCost : 0
    const totalDaysOff = selectedBridges.reduce((sum, b) => sum + b.totalDaysOff, 0)

    const result: OptimizationResult = {
      selectedBridges,
      allocations: allAllocations,
      cpUsed,
      rttUsed,
      totalDaysOff,
      averageEfficiency,
    }

    const calendarWithAllocations = baseCalendar.map((day) => {
      const allocation = allAllocations.find(
        (a) => format(a.date, 'yyyy-MM-dd') === day.dateKey,
      )
      if (allocation) return { ...day, type: allocation.leaveType }
      return day
    })

    const mergedCalendar = applyManualOverrides(
      calendarWithAllocations,
      config.manualOverrides,
    )

    return { calendar: mergedCalendar, result }
  }, [config])
}
