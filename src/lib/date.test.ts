import { describe, expect, it } from 'vitest'
import {
  addDays,
  formatDate,
  formatDateShort,
  getJourneyDay,
  isPastDate,
  parseDateParam,
  TODAY_OFFSET,
  TOMORROW_OFFSET,
  toDateParam,
} from './date'

describe('getJourneyDay', () => {
  const today = new Date(2026, 9, 2)

  it('returns today with the Today label', () => {
    const journeyDay = getJourneyDay(today, TODAY_OFFSET)
    expect(formatDate(journeyDay.date)).toBe('02 Oct, 2026')
    expect(journeyDay.label).toBe('Today')
  })

  it('returns tomorrow with the Tomorrow label', () => {
    const journeyDay = getJourneyDay(today, TOMORROW_OFFSET)
    expect(formatDate(journeyDay.date)).toBe('03 Oct, 2026')
    expect(journeyDay.label).toBe('Tomorrow')
  })
})

describe('formatDate', () => {
  it('formats as "DD Mon, YYYY"', () => {
    expect(formatDate(new Date(2026, 9, 2))).toBe('02 Oct, 2026')
  })
})

describe('addDays', () => {
  it('adds days across a month boundary', () => {
    expect(formatDate(addDays(new Date(2026, 9, 31), 1))).toBe('01 Nov, 2026')
  })

  it('does not mutate the input date', () => {
    const start = new Date(2026, 9, 2)
    addDays(start, 1)
    expect(formatDate(start)).toBe('02 Oct, 2026')
  })
})

describe('toDateParam', () => {
  it('formats a local date as YYYY-MM-DD', () => {
    expect(toDateParam(new Date(2026, 9, 2))).toBe('2026-10-02')
  })
})

describe('parseDateParam', () => {
  it('parses a valid date into a local Date', () => {
    expect(parseDateParam('2026-10-02')).toEqual(new Date(2026, 9, 2))
  })

  it('returns null for a malformed date', () => {
    expect(parseDateParam('not-a-date')).toBeNull()
  })

  it('returns null for an impossible date', () => {
    expect(parseDateParam('2026-02-30')).toBeNull()
  })
})

describe('formatDateShort', () => {
  it('formats as "DD Mon"', () => {
    expect(formatDateShort(new Date(2026, 9, 2))).toBe('02 Oct')
  })
})

describe('isPastDate', () => {
  it('is true when the date is before today', () => {
    expect(isPastDate(new Date(2026, 9, 1), new Date(2026, 9, 2))).toBe(true)
  })

  it('is false when the date is today', () => {
    expect(isPastDate(new Date(2026, 9, 2), new Date(2026, 9, 2))).toBe(false)
  })

  it('is false when the date is after today', () => {
    expect(isPastDate(new Date(2026, 9, 3), new Date(2026, 9, 2))).toBe(false)
  })
})
