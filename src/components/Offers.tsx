import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, ReactElement } from 'react'
import { offers as defaultOffers } from '../data'
import { classNames } from '../lib/classNames'
import type { Offer, OfferTone } from '../types'

const OFFER_TABS = ['All', 'Bus', 'Train'] as const

type OfferTab = (typeof OFFER_TABS)[number]

const TAB_TO_CATEGORY: Record<Exclude<OfferTab, 'All'>, Offer['category']> = {
  Bus: 'bus',
  Train: 'train',
}

const TONE_CLASS: Record<OfferTone, string> = {
  peach: 'offer-peach',
  pink: 'offer-pink',
  yellow: 'offer-yellow',
}

const CATEGORY_BADGE: Record<Offer['category'], 'Bus' | 'Train'> = {
  bus: 'Bus',
  train: 'Train',
}

type CopyStatus = 'copied' | 'failed'

interface OffersProps {
  offers?: Offer[]
}

function Offers({ offers = defaultOffers }: OffersProps): ReactElement {
  const [activeTab, setActiveTab] = useState<OfferTab>('All')
  const [copyStatusByCode, setCopyStatusByCode] = useState<Record<string, CopyStatus | undefined>>(
    {},
  )
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const copyTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  useEffect(() => {
    const timers = copyTimers.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const visibleOffers =
    activeTab === 'All'
      ? offers
      : offers.filter((offer) => offer.category === TAB_TO_CATEGORY[activeTab])

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return
    }

    event.preventDefault()
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (index + direction + OFFER_TABS.length) % OFFER_TABS.length
    const nextTab = OFFER_TABS[nextIndex]
    if (nextTab === undefined) {
      return
    }

    setActiveTab(nextTab)
    tabRefs.current[nextIndex]?.focus()
  }

  const handleCopy = async (offer: Offer) => {
    try {
      await navigator.clipboard.writeText(offer.code)
      setCopyStatusByCode((current) => ({ ...current, [offer.code]: 'copied' }))
    } catch {
      setCopyStatusByCode((current) => ({ ...current, [offer.code]: 'failed' }))
    }

    const existingTimer = copyTimers.current.get(offer.code)
    if (existingTimer !== undefined) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      setCopyStatusByCode((current) => {
        if (current[offer.code] === undefined) {
          return current
        }
        const next = { ...current }
        delete next[offer.code]
        return next
      })
      copyTimers.current.delete(offer.code)
    }, 2000)
    copyTimers.current.set(offer.code, timer)
  }

  return (
    <section className="container section" aria-labelledby="offers-heading">
      <div className="section-head">
        <h2 id="offers-heading">Offers for you</h2>
        <a href="#">View more</a>
      </div>
      <div className="tabs" role="tablist" aria-label="Offer categories">
        {OFFER_TABS.map((tab, index) => {
          const isActive = tab === activeTab
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              ref={(element) => {
                tabRefs.current[index] = element
              }}
              className={classNames('tab', isActive && 'active')}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            >
              {tab}
            </button>
          )
        })}
      </div>
      {visibleOffers.length === 0 ? (
        <p className="offers-empty">No offers right now</p>
      ) : (
        <div className="offer-grid">
          {visibleOffers.map((offer) => {
            const copyStatus = copyStatusByCode[offer.code]
            return (
              <article key={offer.code} className={classNames('offer', TONE_CLASS[offer.tone])}>
                <span className="badge">{CATEGORY_BADGE[offer.category]}</span>
                <h3>{offer.title}</h3>
                <p>Valid till {offer.valid}</p>
                <button
                  type="button"
                  className="code"
                  aria-label={`Copy code ${offer.code}`}
                  onClick={() => void handleCopy(offer)}
                >
                  {copyStatus === 'copied' ? (
                    'Copied!'
                  ) : copyStatus === 'failed' ? (
                    'Copy failed — copy the code manually'
                  ) : (
                    <>
                      <span aria-hidden="true">🏷</span> {offer.code}
                    </>
                  )}
                </button>
                <span className="offer-art" aria-hidden="true">
                  🚌
                </span>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Offers
