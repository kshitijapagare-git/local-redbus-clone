import type { ReactElement } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import {
  boardingPoints as defaultBoardingPoints,
  cities as defaultCities,
  routes as defaultRoutes,
} from '../data'
import { formatDateShort, isPastDate, parseDateParam } from '../lib/date'
import { parseCityIdParam, toSearchString } from '../lib/search'
import type { BoardingPoint, City, Route } from '../types'

interface SearchResultsProps {
  cities?: City[]
  boardingPoints?: BoardingPoint[]
  routes?: Route[]
}

function SearchResults({
  cities = defaultCities,
  boardingPoints = defaultBoardingPoints,
  routes = defaultRoutes,
}: SearchResultsProps): ReactElement {
  const [searchParams] = useSearchParams()

  const fromId = parseCityIdParam(searchParams.get('from'))
  const toId = parseCityIdParam(searchParams.get('to'))
  const dateParam = searchParams.get('date')
  const date = dateParam === null ? null : parseDateParam(dateParam)
  const today = new Date()

  const fromCity = cities.find((city) => city.id === fromId)
  const toCity = cities.find((city) => city.id === toId)

  if (
    fromCity === undefined ||
    toCity === undefined ||
    dateParam === null ||
    date === null ||
    isPastDate(date, today)
  ) {
    return (
      <main className="search-results-error">
        <h1>We couldn't find that search</h1>
        <p>This link is missing a valid departure city, destination or journey date.</p>
        <Link className="back-home" to="/">
          Back to home
        </Link>
      </main>
    )
  }

  const route = routes.find(
    (candidate) => candidate.fromCityId === fromCity.id && candidate.toCityId === toCity.id,
  )

  if (!route) {
    return (
      <main className="search-results-empty">
        <h2>No buses found</h2>
        <p>
          No routes run between {fromCity.name} and {toCity.name}.
        </p>
        <Link
          className="back-home"
          to={`/?${toSearchString({ fromId: fromCity.id, toId: toCity.id, date: dateParam })}`}
        >
          Modify search
        </Link>
      </main>
    )
  }

  const departureBoardingPoints = boardingPoints.filter(
    (boardingPoint) => boardingPoint.cityId === fromCity.id,
  )

  return (
    <main className="container search-results">
      <header className="search-results-header">
        <h1>
          {fromCity.name} → {toCity.name} · {formatDateShort(date)}
        </h1>
        <Link
          className="modify-search"
          to={`/?${toSearchString({ fromId: fromCity.id, toId: toCity.id, date: dateParam })}`}
        >
          Modify search
        </Link>
      </header>
      <section aria-labelledby="boarding-points-heading">
        <div className="section-head">
          <h2 id="boarding-points-heading">Boarding Points</h2>
        </div>
        <BoardingPointList cities={cities} boardingPoints={departureBoardingPoints} />
      </section>
    </main>
  )
}

export default SearchResults
