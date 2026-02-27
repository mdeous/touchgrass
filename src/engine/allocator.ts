import { format } from 'date-fns'
import type { Allocation, Bridge, LeaveType } from '@/engine/types'

export function allocate(
  selectedBridges: readonly Bridge[],
  cpBudget: number,
  rttBudget: number,
  preBookedTypes: Readonly<Record<string, LeaveType>>,
): Allocation[] {
  let cpRemaining = cpBudget
  let rttRemaining = rttBudget

  for (const dateKey of Object.keys(preBookedTypes)) {
    const type = preBookedTypes[dateKey]
    if (type === 'cp') cpRemaining--
    else rttRemaining--
  }

  const preBookedAllocations: Allocation[] = Object.entries(preBookedTypes).map(
    ([dateKey, leaveType]) => {
      const [y, m, d] = dateKey.split('-').map(Number)
      return { date: new Date(y, m - 1, d), leaveType }
    },
  )

  const bridgeAllocations: Allocation[] = []

  const sortedBridges = [...selectedBridges].sort((a, b) => a.ptoCost - b.ptoCost)

  for (const bridge of sortedBridges) {
    const isSingleDay = bridge.ptoCost === 1

    for (const day of bridge.days) {
      const dateKey = format(day, 'yyyy-MM-dd')
      if (preBookedTypes[dateKey]) continue

      let assignedType: LeaveType

      if (isSingleDay) {
        if (rttRemaining > 0) {
          assignedType = 'rtt'
          rttRemaining--
        } else if (cpRemaining > 0) {
          assignedType = 'cp'
          cpRemaining--
        } else {
          continue
        }
      } else {
        if (cpRemaining > 0) {
          assignedType = 'cp'
          cpRemaining--
        } else if (rttRemaining > 0) {
          assignedType = 'rtt'
          rttRemaining--
        } else {
          continue
        }
      }

      bridgeAllocations.push({
        date: new Date(day.getTime()),
        leaveType: assignedType,
      })
    }
  }

  return [...preBookedAllocations, ...bridgeAllocations]
}
