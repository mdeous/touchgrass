import { describe, it, expect } from 'vitest'
import { allocate } from '@/engine/allocator'
import type { Bridge, LeaveType } from '@/engine/types'

function makeBridge(overrides: Partial<Bridge> & { id: string }): Bridge {
  return {
    days: [new Date(2026, 4, 15)],
    ptoCost: 1,
    totalDaysOff: 4,
    gainedDays: 1,
    efficiency: 1,
    adjacentHolidays: [],
    pontName: null,
    startDate: new Date(2026, 4, 14),
    endDate: new Date(2026, 4, 17),
    weightedScore: 5,
    ...overrides,
  }
}

describe('allocate', () => {
  it('assigns RTT to single-day bridges', () => {
    const bridges = [
      makeBridge({ id: 'a', ptoCost: 1, days: [new Date(2026, 4, 15)] }),
    ]
    const allocations = allocate(bridges, 25, 9, {})
    expect(allocations).toHaveLength(1)
    expect(allocations[0].leaveType).toBe('rtt')
  })

  it('assigns CP to multi-day bridges', () => {
    const bridges = [
      makeBridge({
        id: 'b',
        ptoCost: 3,
        days: [new Date(2026, 4, 11), new Date(2026, 4, 12), new Date(2026, 4, 13)],
      }),
    ]
    const allocations = allocate(bridges, 25, 9, {})
    expect(allocations).toHaveLength(3)
    for (const a of allocations) {
      expect(a.leaveType).toBe('cp')
    }
  })

  it('falls back to CP when RTT exhausted for single-day', () => {
    const bridges = [
      makeBridge({ id: 'a', ptoCost: 1, days: [new Date(2026, 4, 15)] }),
    ]
    const allocations = allocate(bridges, 25, 0, {})
    expect(allocations).toHaveLength(1)
    expect(allocations[0].leaveType).toBe('cp')
  })

  it('falls back to RTT when CP exhausted for multi-day', () => {
    const bridges = [
      makeBridge({
        id: 'c',
        ptoCost: 2,
        days: [new Date(2026, 4, 11), new Date(2026, 4, 12)],
      }),
    ]
    const allocations = allocate(bridges, 0, 9, {})
    expect(allocations).toHaveLength(2)
    for (const a of allocations) {
      expect(a.leaveType).toBe('rtt')
    }
  })

  it('includes pre-booked allocations', () => {
    const preBooked: Record<string, LeaveType> = {
      '2026-03-16': 'cp',
    }
    const bridges = [
      makeBridge({ id: 'a', ptoCost: 1, days: [new Date(2026, 4, 15)] }),
    ]
    const allocations = allocate(bridges, 25, 9, preBooked)
    expect(allocations).toHaveLength(2)
    const preBookedAlloc = allocations.find(
      (a) => a.date.getMonth() === 2 && a.date.getDate() === 16,
    )
    expect(preBookedAlloc).toBeDefined()
    expect(preBookedAlloc!.leaveType).toBe('cp')
  })

  it('deducts pre-booked from budgets', () => {
    const preBooked: Record<string, LeaveType> = {
      '2026-03-16': 'rtt',
    }
    const bridges = [
      makeBridge({ id: 'a', ptoCost: 1, days: [new Date(2026, 4, 15)] }),
    ]
    const allocations = allocate(bridges, 0, 1, preBooked)
    const bridgeAlloc = allocations.find(
      (a) => a.date.getMonth() === 4 && a.date.getDate() === 15,
    )
    expect(bridgeAlloc).toBeUndefined()
  })

  it('returns empty array when no bridges selected', () => {
    const allocations = allocate([], 25, 9, {})
    expect(allocations).toHaveLength(0)
  })
})
