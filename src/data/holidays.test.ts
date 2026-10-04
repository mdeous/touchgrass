import { describe, it, expect } from 'vitest'
import { getHolidaysForYear, getEasterSunday } from '@/data/holidays'

describe('getEasterSunday', () => {
  it('returns correct Easter dates for 2024-2030', () => {
    const expected: [number, number, number][] = [
      [2024, 2, 31],
      [2025, 3, 20],
      [2026, 3, 5],
      [2027, 2, 28],
      [2028, 3, 16],
      [2029, 3, 1],
      [2030, 3, 21],
    ]

    for (const [year, month, day] of expected) {
      const easter = getEasterSunday(year)
      expect(easter.getFullYear()).toBe(year)
      expect(easter.getMonth()).toBe(month)
      expect(easter.getDate()).toBe(day)
    }
  })
})

describe('getHolidaysForYear', () => {
  it('returns exactly 11 holidays for metropolitan France in 2026', () => {
    const holidays = getHolidaysForYear(2026, 'metropolitan')
    expect(holidays).toHaveLength(11)
  })

  it('returns exactly 13 holidays for Alsace-Moselle in 2026', () => {
    const holidays = getHolidaysForYear(2026, 'alsace-moselle')
    expect(holidays).toHaveLength(13)
  })

  it('includes Good Friday and Saint-Etienne for Alsace-Moselle', () => {
    const holidays = getHolidaysForYear(2026, 'alsace-moselle')
    const names = holidays.map((h) => h.name)
    expect(names).toContain('Vendredi Saint')
    expect(names).toContain('Saint-Étienne')
  })

  it('includes all expected metropolitan holidays', () => {
    const holidays = getHolidaysForYear(2026, 'metropolitan')
    const names = holidays.map((h) => h.name)
    expect(names).toContain("Jour de l'An")
    expect(names).toContain('Lundi de Pâques')
    expect(names).toContain('Fête du Travail')
    expect(names).toContain('Victoire 1945')
    expect(names).toContain('Ascension')
    expect(names).toContain('Lundi de Pentecôte')
    expect(names).toContain('Fête Nationale')
    expect(names).toContain('Assomption')
    expect(names).toContain('Toussaint')
    expect(names).toContain('Armistice')
    expect(names).toContain('Noël')
  })

  it('computes Ascension Thursday correctly for 2026', () => {
    const holidays = getHolidaysForYear(2026, 'metropolitan')
    const ascension = holidays.find((h) => h.name === 'Ascension')
    expect(ascension).toBeDefined()
    expect(ascension!.date.getFullYear()).toBe(2026)
    expect(ascension!.date.getMonth()).toBe(4)
    expect(ascension!.date.getDate()).toBe(14)
  })

  it('returns extra holidays for DOM-TOM regions', () => {
    const guadeloupe = getHolidaysForYear(2026, 'guadeloupe')
    expect(guadeloupe.length).toBe(14)
    const names = guadeloupe.map((h) => h.name)
    expect(names).toContain("Abolition de l'esclavage")
    expect(names).toContain('Vendredi Saint')

    const martinique = getHolidaysForYear(2026, 'martinique')
    const goodFriday = martinique.find((h) => h.name === 'Vendredi Saint')!
    expect(goodFriday.date.getMonth()).toBe(3)
    expect(goodFriday.date.getDate()).toBe(3)

    const guyane = getHolidaysForYear(2026, 'guyane')
    expect(guyane.length).toBe(12)
  })

  it('returns different Easter Monday dates across years', () => {
    const h2025 = getHolidaysForYear(2025, 'metropolitan')
    const h2026 = getHolidaysForYear(2026, 'metropolitan')
    const em2025 = h2025.find((h) => h.name === 'Lundi de Pâques')!
    const em2026 = h2026.find((h) => h.name === 'Lundi de Pâques')!
    expect(em2025.date.getTime()).not.toBe(em2026.date.getTime())
  })
})
