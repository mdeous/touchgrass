import type { Bridge, Strategy } from '@/engine/types'

function getStrategyMultiplier(bridge: Bridge, strategy: Strategy): number {
  if (strategy === 'balanced') return 1.0

  if (strategy === 'long-weekends') {
    if (bridge.ptoCost <= 2) return 1.5
    return 0.7
  }

  if (strategy === 'extended') {
    if (bridge.ptoCost >= 3) return 1.5
    return 0.7
  }

  return 1.0
}

function computeWeightedScore(bridge: Bridge, strategy: Strategy): number {
  const efficiencyScore = bridge.efficiency
  const lengthBonus = Math.log2(bridge.totalDaysOff + 1)
  const strategyMultiplier = getStrategyMultiplier(bridge, strategy)

  return (efficiencyScore + lengthBonus) * strategyMultiplier
}

export function scoreBridges(bridges: readonly Bridge[], strategy: Strategy): Bridge[] {
  const scored = bridges.map((bridge) => ({
    ...bridge,
    weightedScore: computeWeightedScore(bridge, strategy),
  }))

  return [...scored].sort((a, b) => {
    if (b.weightedScore !== a.weightedScore) return b.weightedScore - a.weightedScore
    if (b.totalDaysOff !== a.totalDaysOff) return b.totalDaysOff - a.totalDaysOff
    return a.startDate.getTime() - b.startDate.getTime()
  })
}
