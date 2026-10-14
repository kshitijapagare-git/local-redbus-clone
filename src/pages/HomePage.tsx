import type { ReactElement } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import BoardingPointList from '../components/BoardingPointList'
import Header from '../components/Header'
import Offers from '../components/Offers'
import SearchCard from '../components/SearchCard'
import { boardingPoints, cities } from '../data'
import { parseCityIdParam, toSearchString } from '../lib/search'
import type { SearchQuery } from '../lib/search'

function HomePage(): ReactElement {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const fromId = parseCityIdParam(searchParams.get('from'))
  const toId = parseCityIdParam(searchParams.get('to'))
  const date = searchParams.get('date')

  const handleSearch = (query: SearchQuery) => {
    navigate(`/search?${toSearchString(query)}`)
  }

  return (
    <>
      <Header />
      <section className="hero">
        <div className="hero-scene" aria-hidden="true">
          <div className="hill hill-back" />
          <div className="hill hill-front" />
          <div className="road" />
          <div className="hero-bus">🚌</div>
        </div>
        <div className="container">
          <h1>
            India's No. 1 online
            <br />
            bus ticket booking site
          </h1>
        </div>
      </section>
      <div className="container search-wrap">
        <SearchCard
          initialFromCityId={fromId}
          initialToCityId={toId}
          initialDate={date}
          onSearch={handleSearch}
        />
      </div>
      <main>
        <Offers />
        <section className="container section" aria-labelledby="boarding-points-heading">
          <div className="section-head">
            <h2 id="boarding-points-heading">Boarding Points</h2>
          </div>
          <BoardingPointList cities={cities} boardingPoints={boardingPoints} />
        </section>
      </main>
    </>
  )
}

export default HomePage
