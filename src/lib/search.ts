import type { City } from '../types'

export interface SearchQuery {
  fromId: City['id']
  toId: City['id']
  date: string
}

export function toSearchString(query: SearchQuery): string {
  const params = new URLSearchParams()
  params.set('from', String(query.fromId))
  params.set('to', String(query.toId))
  params.set('date', query.date)
  return params.toString()
}

export function parseCityIdParam(value: string | null): City['id'] | null {
  if (value === null || !/^\d+$/.test(value)) {
    return null
  }

  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}