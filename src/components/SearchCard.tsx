import { useState } from 'react'
import type { ReactElement } from 'react'
import CityAutocomplete from './CityAutocomplete'
import { cities as defaultCities } from '../data'
import { classNames } from '../lib/classNames'
import { DAY_OPTIONS, formatDate, getJourneyDay, TODAY_OFFSET } from '../lib/date'
import type { City } from '../types'

interface SearchCardProps {
  cities?: City[]
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

function SearchCard({ cities = defaultCities }: SearchCardProps): ReactElement {
  const [today] = useState(() => new Date())
  const [dayOffset, setDayOffset] = useState(TODAY_OFFSET)
  const [forWomen, setForWomen] = useState(false)
  const [fromCityId, setFromCityId] = useState<City['id'] | null>(null)
  const [toCityId, setToCityId] = useState<City['id'] | null>(null)
  const [fromText, setFromText] = useState('')
  const [toText, setToText] = useState('')
  const [errors, setErrors] = useState<{ from?: string; to?: string }>({})

  const journeyDay = getJourneyDay(today, dayOffset)

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

  const handleSearch = () => {
    setErrors(validateSearch(fromCityId, fromText, toCityId, toText))
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
              <strong>{formatDate(journeyDay.date)}</strong>
              <em>({journeyDay.label})</em>
            </div>
            {DAY_OPTIONS.map((option) => {
              const isSelected = option.offset === dayOffset
              return (
                <button
                  key={option.offset}
                  type="button"
                  className={classNames('chip', isSelected && 'chip-active')}
                  aria-pressed={isSelected}
                  onClick={() => setDayOffset(option.offset)}
                >
                  {option.label}
                </button>
              )
            })}
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
      <button type="button" className="search-btn" onClick={handleSearch}>
        <span aria-hidden="true">⌕</span> Search buses
      </button>
    </section>
  )
}

export default SearchCard
