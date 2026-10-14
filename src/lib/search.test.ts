import { describe, expect, it } from 'vitest'
import { parseCityIdParam, toSearchString } from './search'

describe('toSearchString', () => {
  it('encodes from, to and date as a query string', () => {
    expect(toSearchString({ fromId: 1, toId: 2, date: '2026-10-02' })).toBe(
      'from=1&to=2&date=2026-10-02',
    )
  })
})

describe('parseCityIdParam', () => {
  it('parses a positive integer string', () => {
    expect(parseCityIdParam('1')).toBe(1)
    expect(parseCityIdParam('2')).toBe(2)
  })

  it('returns null for a non-numeric string', () => {
    expect(parseCityIdParam('999x')).toBeNull()
  })

  it('returns null for null', () => {
    expect(parseCityIdParam(null)).toBeNull()
  })
})