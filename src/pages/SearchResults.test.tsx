import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SearchResults from './SearchResults'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('SearchResults', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 2, 10, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows only the boarding points in the departure city', () => {
    renderAt('/search?from=1&to=2&date=2026-10-02')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Pune → Bengaluru · 02 Oct',
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Shivajinagar')
    expect(items[1]).toHaveTextContent('Hinjewadi')
    expect(screen.queryByText('Majestic')).not.toBeInTheDocument()
  })

  it('shows the empty state when no route connects the cities', () => {
    renderAt('/search?from=1&to=1&date=2026-10-02')

    expect(screen.getByRole('heading', { name: 'No buses found' })).toBeInTheDocument()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('shows a full-page error for an unknown city', () => {
    renderAt('/search?from=999&to=2&date=2026-10-02')

    expect(
      screen.getByRole('heading', { name: "We couldn't find that search" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('shows the error state for a malformed date', () => {
    renderAt('/search?from=1&to=2&date=not-a-date')

    expect(
      screen.getByRole('heading', { name: "We couldn't find that search" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('shows the error state for a past date', () => {
    renderAt('/search?from=1&to=2&date=2000-01-01')

    expect(
      screen.getByRole('heading', { name: "We couldn't find that search" }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('links back to the home search with the same query', () => {
    renderAt('/search?from=1&to=2&date=2026-10-02')

    expect(screen.getByRole('link', { name: 'Modify search' })).toHaveAttribute(
      'href',
      '/?from=1&to=2&date=2026-10-02',
    )
  })
})
