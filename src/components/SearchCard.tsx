import { useState } from 'react'
import type { ChangeEvent, ReactElement } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { cities as defaultCities } from '../data'
import { classNames } from '../lib/classNames'
import {
  DAY_OPTIONS,
  formatDate,
  getJourneyDay,
  isPastDate,
  parseDateParam,
  TODAY_OFFSET,
  toDateParam,
} from '../lib/date'
import type { SearchQuery } from '../lib/search'
import type { City } from '../types'

interface SearchCardProps {
  cities?: City[]
  initialFromCityId?: City['id'] | null
  initialToCityId?: City['id'] | null
  initialDate?: string | null
  onSearch?: (query: SearchQuery) => void
}

interface SearchErrors {
  from?: string
  to?: string
  date?: string
}

function validateSearch(
  fromId: City['id'] | null,
  fromText: string,
  toId: City['id'] | null,
  toText: string,
): { from?: string; to?: string } {
  const errors: { from?: string; to?: string } = {}

  if (fromText.trim().length === 0) {
    errors.from = 'Please select a city'
  } else if (fromId === null) {
    errors.from = 'Please select a city from the list'
  }

  if (toText.trim().length === 0) {
    errors.to = 'Please select a city'
  } else if (toId === null) {
    errors.to = 'Please select a city from the list'
  }

  if (!errors.from && !errors.to && fromId !== null && toId !== null && fromId === toId) {
    errors.from = 'From and To must be different'
    errors.to = 'From and To must be different'
  }

  return errors
}

function validateDate(value: string, today: Date): string | undefined {
  if (value.trim().length === 0) {
    return undefined
  }

  const date = parseDateParam(value)
  if (!date) {
    return 'Please select a valid date'
  }

  if (isPastDate(date, today)) {
    return 'Date cannot be in the past'
  }

  return undefined
}

function SearchCard({
  cities = defaultCities,
  initialFromCityId = null,
  initialToCityId = null,
  initialDate = null,
  onSearch,
}: SearchCardProps): ReactElement {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(TODAY_OFFSET)
  const [dateInputValue, setDateInputValue] = useState(initialDate ?? '')
  const [forWomen, setForWomen] = useState(false)
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(initialFromCityId ?? null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(initialToCityId ?? null)
  const [fromText, setFromText] = useState(() => {
    const city = cities.find((candidate) => candidate.id === initialFromCityId)
    return city?.name ?? ''
  })
  const [toText, setToText] = useState(() => {
    const city = cities.find((candidate) => candidate.id === initialToCityId)
    return city?.name ?? ''
  })
  const [errors, setErrors] = useState<SearchErrors>({})

  const journeyDay = getJourneyDay(today, dayOffset)
  const hasCustomDate = dateInputValue.trim().length > 0
  const customDate = hasCustomDate ? parseDateParam(dateInputValue) : null
  const displayDate = customDate ?? journeyDay.date
  const displayLabel = customDate ? '' : journeyDay.label

  const handleFromTextChange = (text: string) => {
    setFromText(text)
    setFromCityId(null)
    setErrors((current) => ({ ...current, from: undefined }))
  }

  const handleToTextChange = (text: string) => {
    setToText(text)
    setToCityId(null)
    setErrors((current) => ({ ...current, to: undefined }))
  }

  const handleFromSelect = (city: City) => {
    setFromCityId(city.id)
    setFromText(city.name)
    setErrors((current) => ({ ...current, from: undefined }))
  }

  const handleToSelect = (city: City) => {
    setToCityId(city.id)
    setToText(city.name)
    setErrors((current) => ({ ...current, to: undefined }))
  }

  const handleSwap = () => {
    setFromCityId(toCityId)
    setToCityId(fromCityId)
    setFromText(toText)
    setToText(fromText)
    setErrors({})
  }

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    setDateInputValue(nextValue)
    setErrors((current) => ({ ...current, date: validateDate(nextValue, today) }))
  }

  const handleDaySelect = (offset: number) => {
    setDayOffset(offset)
    setDateInputValue('')
    setErrors((current) => ({ ...current, date: undefined }))
  }

  const handleSearch = () => {
    const nextErrors: SearchErrors = validateSearch(fromCityId, fromText, toCityId, toText)
    const dateError = validateDate(dateInputValue, today)
    if (dateError) {
      nextErrors.date = dateError
    }

    setErrors(nextErrors)

    if (nextErrors.from || nextErrors.to || nextErrors.date) {
      return
    }

    if (fromCityId === null || toCityId === null) {
      return
    }

    const date = hasCustomDate ? dateInputValue : toDateParam(journeyDay.date)
    onSearch?.({ fromId: fromCityId, toId: toCityId, date })
  }

  return (
    <section className="search-card" aria-label="Search buses">
      <div className="search-row">
        <div className="search-fields">
          <CityAutocomplete
            label="From"
            placeholder="From"
            cities={cities}
            value={fromText}
            onValueChange={handleFromTextChange}
            onSelect={handleFromSelect}
            error={errors.from}
          />
          <button
            type="button"
            className="swap-btn"
            aria-label="Swap From and To"
            onClick={handleSwap}
          >
            ⇄
          </button>
          <CityAutocomplete
            label="To"
            placeholder="To"
            cities={cities}
            value={toText}
            onValueChange={handleToTextChange}
            onSelect={handleToSelect}
            error={errors.to}
          />
          <div className="field date-field">
            <span className="field-icon" aria-hidden="true">
              📅
            </span>
            <div className="date-text">
              <small>Date of Journey</small>
              <strong>{formatDate(displayDate)}</strong>
              {displayLabel ? <em>({displayLabel})</em> : null}
            </div>
            {DAY_OPTIONS.map((option) => {
              const isSelected = !hasCustomDate && option.offset === dayOffset
              return (
                <button
                  key={option.offset}
                  type="button"
                  className={classNames('chip', isSelected && 'chip-active')}
                  aria-pressed={isSelected}
                  onClick={() => handleDaySelect(option.offset)}
                >
                  {option.label}
                </button>
              )
            })}
            <input
              className="date-input"
              type="date"
              aria-label="Journey date"
              min={toDateParam(today)}
              value={dateInputValue}
              onChange={handleDateChange}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={errors.date ? 'journey-date-error' : undefined}
            />
          </div>
        </div>
        <div className="women-box">
          <span className="women-icon" aria-hidden="true">
            👩
          </span>
          <div>
            <div>Booking for women</div>
            <a href="#">Know more</a>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={forWomen}
            aria-label="Booking for women"
            className={classNames('toggle', forWomen && 'on')}
            onClick={() => setForWomen((isOn) => !isOn)}
          />
        </div>
      </div>
      {errors.date ? (
        <p className="date-error" id="journey-date-error" role="alert">
          {errors.date}
        </p>
      ) : null}
      <button type="button" className="search-btn" onClick={handleSearch}>
        <span aria-hidden="true">⌕</span> Search buses
      </button>
    </section>
  )
}

export default SearchCard
