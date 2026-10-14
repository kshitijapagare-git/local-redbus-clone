import { useId, useState } from 'react'
import type { ChangeEvent, KeyboardEvent, ReactElement } from 'react'
import { classNames } from '../lib/classNames'
import type { City } from '../types'

interface CityAutocompleteProps {
  label: string
  placeholder: string
  cities: City[]
  value: string
  onValueChange: (text: string) => void
  onSelect: (city: City) => void
  error?: string
}

function matchesCity(city: City, query: string): boolean {
  return city.name.toLowerCase().startsWith(query.toLowerCase())
}

function filterCities(cities: City[], query: string): City[] {
  if (query.trim().length === 0) {
    return []
  }
  return cities.filter((city) => matchesCity(city, query))
}

function CityAutocomplete({
  label,
  placeholder,
  cities,
  value,
  onValueChange,
  onSelect,
  error,
}: CityAutocompleteProps): ReactElement {
  const listboxId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions = filterCities(cities, value)
  const activeCity = suggestions[activeIndex]

  const optionId = (city: City) => `${listboxId}-option-${city.id}`

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value
    onValueChange(nextValue)
    setActiveIndex(0)
    setIsOpen(filterCities(cities, nextValue).length > 0)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((current) => (current + 1) % suggestions.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length)
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (activeCity) {
        onSelect(activeCity)
        setIsOpen(false)
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
    }
  }

  return (
    <div className="city-autocomplete">
      <label className="field">
        <span className="field-icon" aria-hidden="true">
          🚌
        </span>
        <input
          className="city-autocomplete-input"
          type="text"
          placeholder={placeholder}
          aria-label={label}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeCity ? optionId(activeCity) : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${listboxId}-error` : undefined}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={() => setIsOpen(false)}
        />
      </label>
      {isOpen ? (
        <ul
          className="city-autocomplete-listbox"
          role="listbox"
          id={listboxId}
          aria-label={`${label} suggestions`}
        >
          {suggestions.map((city, index) => (
            <li
              key={city.id}
              id={optionId(city)}
              role="option"
              aria-selected={index === activeIndex}
              className={classNames('city-autocomplete-option', index === activeIndex && 'active')}
              onMouseDown={(event) => {
                event.preventDefault()
                onSelect(city)
                setIsOpen(false)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="city-autocomplete-name">{city.name}</span>
              <span className="city-autocomplete-state">, {city.state}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {error ? (
        <p className="city-autocomplete-error" id={`${listboxId}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default CityAutocomplete
