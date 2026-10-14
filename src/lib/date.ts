export const TODAY_OFFSET = 0
export const TOMORROW_OFFSET = 1

export interface DayOption {
  offset: number
  label: string
}

export const DAY_OPTIONS: DayOption[] = [
  { offset: TODAY_OFFSET, label: 'Today' },
  { offset: TOMORROW_OFFSET, label: 'Tomorrow' },
]

export interface JourneyDay {
  date: Date
  label: string
}

export function getJourneyDay(today: Date, offset: number): JourneyDay {
  const option = DAY_OPTIONS.find((dayOption) => dayOption.offset === offset)
  return { date: addDays(today, offset), label: option?.label ?? '' }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(date.getDate() + days)
  return result
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()

  return `${day} ${month}, ${year}`
}

export function toDateParam(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseDateParam(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }

  return date
}

export function formatDateShort(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })

  return `${day} ${month}`
}

export function isPastDate(date: Date, today: Date): boolean {
  return toDateParam(date) < toDateParam(today)
}
