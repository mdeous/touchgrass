import type { Strategy } from '@/engine/types'

interface StrategyShape {
  /** Break length (days) the strategy aims for. */
  readonly idealLength: number
  /** True if breaks longer than the ideal are worth less (long weekends). */
  readonly shortBreaks: boolean
  /** Value a leave day must add to be worth spending. */
  readonly leaveCost: number
}

const STRATEGY_SHAPES: Readonly<Record<Strategy, StrategyShape>> = {
  'long-weekends': { idealLength: 5, shortBreaks: true, leaveCost: 1 },
  balanced: { idealLength: 10, shortBreaks: false, leaveCost: 0.6 },
  extended: { idealLength: 16, shortBreaks: false, leaveCost: 0.5 },
}

/**
 * How much the strategy likes a break of `length` days, between 0 and 1.
 * Long-weekends: full value up to the ideal length, then less. Others: value
 * grows with length up to the ideal, so joining breaks never loses value.
 */
function lengthWeight(length: number, shape: StrategyShape): number {
  if (shape.shortBreaks) {
    return length <= shape.idealLength ? 1 : shape.idealLength / length
  }
  return Math.min(length, shape.idealLength) / shape.idealLength
}

/**
 * Value of a break of `length` days off that contains `freeDays` weekend or
 * holiday days: the free days it captures, weighted by how well its length
 * fits the strategy. Leave days are paid for separately via `leaveDayCost`.
 */
export function breakValue(
  length: number,
  freeDays: number,
  strategy: Strategy,
): number {
  if (length <= 0) return 0
  return freeDays * lengthWeight(length, STRATEGY_SHAPES[strategy])
}

/**
 * Opportunity cost of one leave day, in captured free days. Leave is only
 * spent where it adds more value than this.
 */
export function leaveDayCost(strategy: Strategy): number {
  return STRATEGY_SHAPES[strategy].leaveCost
}
