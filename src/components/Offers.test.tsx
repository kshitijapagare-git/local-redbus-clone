import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Offers from './Offers'
import { testOffers } from '../test/fixtures'

const ORIGINAL_CLIPBOARD = navigator.clipboard

afterEach(() => {
  vi.useRealTimers()
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    writable: true,
    value: ORIGINAL_CLIPBOARD,
  })
})

describe('Offers', () => {
  it('renders one card per offer with its title, validity and code', () => {
    render(<Offers offers={testOffers} />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(2)
    expect(cards[0]).toHaveTextContent('Save up to Rs 300 on bus tickets')
    expect(cards[0]).toHaveTextContent('Valid till 05 Oct')
    expect(cards[0]).toHaveTextContent('FESTIVE300')
  })

  it('applies the tone as a CSS modifier class', () => {
    render(<Offers offers={testOffers} />)
    expect(screen.getAllByRole('article')[1]).toHaveClass('offer', 'offer-yellow')
  })

  it('renders the sample offers by default', () => {
    render(<Offers />)
    expect(screen.getAllByRole('article')).toHaveLength(4)
  })

  it('filters offers when each tab is selected', () => {
    render(<Offers offers={testOffers} />)

    expect(screen.getAllByRole('article')).toHaveLength(2)

    fireEvent.click(screen.getByRole('tab', { name: 'Bus' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Copy code FESTIVE300' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy code PRIMODAY' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Train' }))
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Copy code PRIMODAY' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copy code FESTIVE300' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'All' }))
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })

  it('shows the empty state for a tab with no offers', () => {
    const busOnlyOffers = testOffers.filter((offer) => offer.category === 'bus')
    render(<Offers offers={busOnlyOffers} />)

    fireEvent.click(screen.getByRole('tab', { name: 'Train' }))

    expect(screen.getByText('No offers right now')).toBeInTheDocument()
    expect(screen.queryAllByRole('article')).toHaveLength(0)
  })

  it('copies a coupon code and shows Copied! for about 2 seconds', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<Offers offers={testOffers} />)

    const copyButton = screen.getByRole('button', { name: 'Copy code FESTIVE300' })
    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(writeText).toHaveBeenCalledWith('FESTIVE300')
    expect(copyButton).toHaveTextContent('Copied!')

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(copyButton).toHaveTextContent('FESTIVE300')
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
  })

  it('shows a manual-copy message when clipboard copying fails', async () => {
    vi.useFakeTimers()
    const writeText = vi.fn().mockRejectedValue(new Error('clipboard unavailable'))
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    render(<Offers offers={testOffers} />)

    const copyButton = screen.getByRole('button', { name: 'Copy code FESTIVE300' })
    await act(async () => {
      fireEvent.click(copyButton)
    })

    expect(writeText).toHaveBeenCalledWith('FESTIVE300')
    expect(screen.getByText('Copy failed — copy the code manually')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })
})
